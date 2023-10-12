import React, { useState, useEffect } from "react";
import axios from "axios";
import stockList from "../sp100/sp100.json";
import { Link } from "react-router-dom";
import { ref, getDatabase, update, get } from "firebase/database";
import { useAuth } from "../util/auth";

function getLastWorkingDay() {
  const today = new Date();
  let lastWorkingDay = new Date(today);

  if (today.getDay() === 0) {
    // Sunday
    lastWorkingDay.setDate(today.getDate() - 2);
  } else if (today.getDay() === 1) {
    // Monday
    lastWorkingDay.setDate(today.getDate() - 3);
  } else {
    // Any other day
    lastWorkingDay.setDate(today.getDate() - 1);
  }

  const year = lastWorkingDay.getFullYear();
  const month = String(lastWorkingDay.getMonth() + 1).padStart(2, "0");
  const day = String(lastWorkingDay.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function Markets() {
  const [stocks, setStocks] = useState([]);
  const [sortType, setSortType] = useState("name");
  const [viewWatchList, setViewWatchList] = useState(false);
  const [watchListStocks, setWatchListStocks] = useState([]);

  const db = getDatabase();
  const auth = useAuth();
  const userID = auth.user.uid; // This will give you the uid of the logged-in user.
  // might break the page if i refresh

  useEffect(() => {
    const fetchData = async () => {
      const lastWorkingDate = getLastWorkingDay();
      const promises = stockList.map((stock) =>
        axios
          .get(
            `https://api.polygon.io/v1/open-close/${stock.Symbol}/${lastWorkingDate}?adjusted=true&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
          )
          .then((response) => {
            return {
              ...stock,
              ...response.data,
            };
          })
          .catch((error) => {
            console.error(`Error fetching data for ${stock.Symbol}`, error);
          })
      );

      // Fetch all stock data in parallel
      const fetchedStocks = await Promise.all(promises);

      // Filter out any undefined values (due to errors in fetching)
      const validStocks = fetchedStocks.filter(Boolean);

      setStocks(validStocks);
    };

    fetchData();
  }, []);

  useEffect(() => {
    console.log("onmount");
    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      setWatchListStocks(snapshot.val());
    });
  }, []);

  const handlePopulateWatchList = () => {
    setViewWatchList(!viewWatchList);

    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      setWatchListStocks(snapshot.val());
      console.log(snapshot.val());
    });
  };

  const handleSaveToWatchlist = (ev) => {
    ev.preventDefault();
    // console.log(ev.target.id);
    const Symbol = ev.target.id;

    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      const data = snapshot.val();
      if (data === null) {
        update(userWatchListRef, { [Symbol]: `${Symbol}` });
      } else {
        if (Symbol in data) {
          console.log(
            `Already in watchlist, Removing ${Symbol} from Watchlist`
          );

          setWatchListStocks((prevState) => {
            const updatedState = { ...prevState };
            delete updatedState[Symbol];
            return updatedState;
          });

          update(userWatchListRef, { [Symbol]: null });
        } else {
          console.log(`Not in watchlist, Adding ${Symbol} Into Watchlist.`);

          setWatchListStocks((prevState) => ({
            ...prevState,
            [Symbol]: `${Symbol}`,
          }));

          update(userWatchListRef, { [Symbol]: `${Symbol}` });
        }
      }
    });
  };

  useEffect(() => {
    const sortArray = (type) => {
      const types = {
        volume: "volume",
        name: "name",
      };
      const sortProperty = types[type];
      const sorted = [...stocks].sort(
        (a, b) => (b[sortProperty] || 0) - (a[sortProperty] || 0)
      );
      setStocks(sorted);
    };
    sortArray(sortType);
  }, [sortType]);

  return (
    <div className="structure">
      <div className="contentcontainer">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="heading1">Markets</h1>
        </div>

        <div className="flex flex-row w-[100%] justify-end">
          <div>
            <button
              className={
                viewWatchList === false
                  ? "primary-cta-btn"
                  : "secondary-cta-btn"
              }
              onClick={handlePopulateWatchList}
            >
              Watchlist
            </button>
          </div>
        </div>

        <div className="table-responsive bg-gray text-black rounded-lg shadow-lg p-4">
          <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="text-gray-800">
                <th className="py-2 px-4 border-b">Ticker</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Last Close</th>
                <th className="py-2 px-4 border-b">Volume</th>
                <th className="py-2 px-4 border-b">Watch</th>
              </tr>
            </thead>
            {viewWatchList === true ? (
              <tbody>
                {stocks.map((stock) => {
                  if (stock.Symbol in watchListStocks) {
                    return (
                      <tr
                        key={stock.Symbol}
                        className="h-[5rem] hover:bg-teal-200"
                      >
                        <td className="py-2 px-4 text-center">
                          <Link
                            to={`/trade/${stock.Symbol}`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {stock.Symbol}
                          </Link>
                        </td>
                        <td className="py-2 px-4">
                          <Link
                            to={`/trade/${stock.Symbol}`}
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {stock.Name}
                          </Link>
                        </td>
                        <td className="py-2 px-4">{stock.close}</td>
                        <td className="py-2 px-4">{stock.volume}</td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="button"
                            id={stock.Symbol}
                            className={
                              stock.Symbol in watchListStocks
                                ? "smallfunctionbtn-primary"
                                : "smallfunctionbtn-neutral"
                            }
                            onClick={handleSaveToWatchlist}
                            value={stock.Symbol in watchListStocks ? "✓" : "+"}
                          />
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            ) : (
              <tbody>
                {stocks.map((stock) => (
                  <tr
                    key={stock.Symbol}
                    className="h-[5rem] hover:bg-indigo-200"
                  >
                    <td className="py-2 px-4 text-center">
                      <Link
                        to={`/trade/${stock.Symbol}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {stock.Symbol}
                      </Link>
                    </td>
                    <td className="py-2 px-4">
                      <Link
                        to={`/trade/${stock.Symbol}`}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        {stock.Name}
                      </Link>
                    </td>
                    <td className="py-2 px-4">{stock.close}</td>
                    <td className="py-2 px-4">{stock.volume}</td>
                    <td className="py-2 px-4 text-center">
                      <input
                        type="button"
                        id={stock.Symbol}
                        className={
                          stock.Symbol in watchListStocks
                            ? "smallfunctionbtn-primary"
                            : "smallfunctionbtn-neutral"
                        }
                        onClick={handleSaveToWatchlist}
                        value={stock.Symbol in watchListStocks ? "✓" : "+"}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
