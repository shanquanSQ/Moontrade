import React, { useState, useEffect } from "react";
import axios from "axios";
import stockList from "../sp100/sp100.json";
import { Link } from "react-router-dom";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

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

function formatCurrency(number) {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formatter.format(number);
}

export function Markets() {
  const [stocks, setStocks] = useState([]);
  const [sortType, setSortType] = useState("");
  const [sortDirection, setSortDirection] = useState("ascending");

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
    <div className="structure">
      <div className="contentcontainer">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="heading1">Markets</h1>
        </div>

        <div className="table-responsive bg-gray text-black rounded-lg shadow-lg p-4">
          <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
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
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </th>

                <th className="py-2 px-4 border-b">Name</th>
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
                    <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </th>
                <th className="py-2 px-4 border-b">Watchlist</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.Symbol} className="hover:bg-fuchsia-400">
                  <td className="py-2 px-4">
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
                  <td className="py-2 px-4">{formatCurrency(stock.close)}</td>
                  <td className="py-2 px-4">{formatCurrency(stock.volume)}</td>
                  <td className="py-2 px-4">
                    <button className="primary-cta-btn">+</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
