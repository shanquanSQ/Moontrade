import React, { useState, useEffect } from "react";
import axios from "axios";
import stockList from "../sp100/sp100.json";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ref, getDatabase, update, get } from "firebase/database";
import { useAuth } from "../util/auth";
import { formatCurrency } from "../util/formattingUtils";

/**
 * Get the date string for the last working day in "yyyy-mm-dd" format.
 *
 * If today is Monday, it returns the date for the previous Friday.
 * If today is Sunday, it returns the date for the previous Saturday.
 * Otherwise, it returns the date for the previous day.
 *
 * @returns {string} The date string of the last working day.
 */
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

/**
 * The `Markets` component fetches and displays stock information for a specified list of stocks.
 * Users can view stock details, sort them, and manage a personalized watchlist of stocks.
 *
 * @component
 * @example
 * return (
 *   <Markets />
 * )
 */
export function Markets() {
  const [stocks, setStocks] = useState([]);
  const [sortType, setSortType] = useState("");
  const [sortDirection, setSortDirection] = useState("ascending");
  const [viewWatchList, setViewWatchList] = useState(false);
  const [watchListStocks, setWatchListStocks] = useState([]);
  const [userID, setUserID] = useState("");

  const db = getDatabase();
  const userAuth = useAuth(); // our custom provider

  useEffect(() => {
    console.log("useeffect set user id");
    if (userAuth.user === null) {
      const userInfo = localStorage.getItem("userLocalInfo");
      console.log("get info");
      setUserID(userInfo.uid);
    } else {
      console.log("set info");
      localStorage.setItem("userLocalInfo", userAuth.user);
      setUserID(userAuth.user.uid);
    }
  }, []);

  useEffect(() => {
    /**
     * Fetch stock data and update the `stocks` state.
     *
     * This function makes API requests in parallel to fetch data for all stocks listed
     * in `stockList`, and updates the `stocks` state with the fetched data.
     *
     * @async
     */
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

  // Ensures that Watchlist is loaded on page load + when userAuth changes from null to containing to firebase auth's user
  // AND only WHEN userID is set (i.e. the authenticated user info has been retrieved from firebase auth and put into state) then we run this.
  useEffect(() => {
    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      setWatchListStocks(snapshot.val());
      console.log("stocks watchlist snapshot: ", snapshot.val());
    });
  }, [userID]);

  /**
   * Populate the user's watchlist and toggle the `viewWatchList` state.
   *
   * This function toggles the `viewWatchList` state and, if it becomes `true`, fetches
   * and sets the user's watchlist stocks from Firebase into the `watchListStocks` state.
   */
  const handlePopulateWatchList = () => {
    setViewWatchList(!viewWatchList);

    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      setWatchListStocks(snapshot.val());
      console.log("watchlist button click: ", snapshot.val());
    });
  };

  /**
   * Add or remove a stock from the user's watchlist in Firebase and update local state.
   *
   * If the stock identified by the button `id` is already in the user's watchlist, it will
   * be removed. If it's not, it will be added.
   *
   * @param {React.SyntheticEvent} ev - The React synthetic event.
   */
  const handleSaveToWatchlist = (ev) => {
    ev.preventDefault();
    const Symbol = ev.target.id;

    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      const data = snapshot.val();
      if (data === null) {
        setWatchListStocks({ [Symbol]: `${Symbol}` });
        update(userWatchListRef, { [Symbol]: `${Symbol}` });
      } else {
        if (Symbol in data) {
          console.log(
            `Already in watchlist, Removing ${Symbol} from Watchlist`
          );

          setWatchListStocks((prevState) => {
            console.log("deleting stock");
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
    const sortArray = () => {
      let sorted = [...stocks];
      const compareFunc = (a, b) => {
        if (sortType === "symbol") {
          if (!a.Symbol) return 1;
          if (!b.Symbol) return -1;
          return a.Symbol.localeCompare(b.Symbol);
        } else if (sortType === "volume") {
          return (b.volume || 0) - (a.volume || 0);
        }
      };

      sorted.sort((a, b) => {
        const result = compareFunc(a, b);
        return sortDirection === "ascending" ? result : -result;
      });

      setStocks(sorted);
    };

    sortArray();
  }, [sortType, sortDirection]);

  return (
    <>
      <div className="structure">
        <div className="contentcontainer">
          <div className="titlestructure">
            <h1 className="titleheading">Markets</h1>
          </div>

          {/* Page Subtitle Header */}
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-txtcolor-primary">
                S&P 100 Stocks
              </h1>
              <p className="mt-2 text-sm text-txtcolor-secondary">
                View Prices, Trade Stocks and Add to Watchlist
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
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

          {/* Main Page Content */}
          <div className="table-responsive bg-gray text-black">
            <div className="table-responsive bg-gray text-black rounded-md">
              <table className="w-full border-collapse bg-white">
                <thead>
                  <tr className="text-gray-800">
                    <th className="py-2 px-4 border-b">
                      Ticker{" "}
                      <span
                        className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200"
                        onClick={() => {
                          if (
                            sortType === "symbol" &&
                            sortDirection === "ascending"
                          ) {
                            setSortDirection("descending");
                          } else {
                            setSortType("symbol");
                            setSortDirection("ascending");
                          }
                        }}
                      >
                        <ChevronDownIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </span>
                    </th>

                    <th className="py-2 px-4 border-b ">Name</th>
                    <th className="py-2 px-4 border-b">Last Close</th>
                    <th className="py-2 px-4 border-b">
                      Volume{" "}
                      <span
                        className="ml-2 flex-none rounded bg-gray-100 text-gray-900 group-hover:bg-gray-200"
                        onClick={() => {
                          if (
                            sortType === "volume" &&
                            sortDirection === "ascending"
                          ) {
                            setSortDirection("descending");
                          } else {
                            setSortType("volume");
                            setSortDirection("ascending");
                          }
                        }}
                      >
                        <ChevronDownIcon
                          className="h-5 w-5"
                          aria-hidden="true"
                        />
                      </span>
                    </th>
                    <th className="py-2 px-4 border-b">Watchlist</th>
                  </tr>
                </thead>
                {viewWatchList === true ? (
                  <tbody>
                    {stocks.map((stock) => {
                      if (watchListStocks !== null) {
                        if (stock.Symbol in watchListStocks) {
                          return (
                            <tr
                              key={stock.Symbol}
                              className="h-[5rem] hover:bg-teal-200"
                            >
                              <td className="py-2 px-4 text-center">
                                <Link
                                  to={`/trade/${stock.Symbol}`}
                                  className="text-indigo-600 font-bold hover:text-indigo-800"
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
                              <td className="py-2 px-4">
                                {formatCurrency(stock.close)}
                              </td>
                              <td className="py-2 px-4">
                                {formatCurrency(stock.volume)}
                              </td>
                              <td className="py-2 px-4 text-center">
                                <input
                                  type="button"
                                  id={stock.Symbol}
                                  className={
                                    watchListStocks &&
                                    stock.Symbol in watchListStocks
                                      ? "smallfunctionbtn-primary"
                                      : "smallfunctionbtn-neutral"
                                  }
                                  onClick={handleSaveToWatchlist}
                                  value={
                                    watchListStocks &&
                                    stock.Symbol in watchListStocks
                                      ? "✓"
                                      : "+"
                                  }
                                />
                              </td>
                            </tr>
                          );
                        }
                      } else {
                        return null;
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
                            className="text-indigo-600 font-bold hover:text-indigo-800"
                          >
                            {stock.Symbol}
                          </Link>
                        </td>
                        <td className="py-2 px-4">
                          <Link
                            to={`/trade/${stock.Symbol}`}
                            className="text-indigo-600 text-bold hover:text-indigo-800"
                          >
                            {stock.Name}
                          </Link>
                        </td>
                        <td className="py-2 px-4">
                          {formatCurrency(stock.close)}
                        </td>
                        <td className="py-2 px-4">
                          {formatCurrency(stock.volume)}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <input
                            type="button"
                            id={stock.Symbol}
                            className={
                              watchListStocks && stock.Symbol in watchListStocks
                                ? "smallfunctionbtn-primary"
                                : "smallfunctionbtn-neutral"
                            }
                            onClick={handleSaveToWatchlist}
                            value={
                              watchListStocks && stock.Symbol in watchListStocks
                                ? "✓"
                                : "+"
                            }
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
      </div>
    </>
  );
}
