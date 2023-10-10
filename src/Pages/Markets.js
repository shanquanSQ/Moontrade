import React, { useState, useEffect } from "react";
import axios from "axios";
import stockList from "../sp100/sp100.json";
import { Link } from "react-router-dom";

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
    <div>
      <select onChange={(e) => setSortType(e.target.value)}>
        <option value="name">Alphabetical</option>
        <option value="volume">Volume</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Name</th>
            <th>Last Close</th>
            <th>Volume</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {stocks.map((stock) => (
            <tr key={stock.Symbol}>
              <td>
                <Link to={`/trade/${stock.Symbol}`}>{stock.Symbol}</Link>
              </td>
              <td>
                <Link to={`/trade/${stock.Symbol}`}>{stock.Name}</Link>
              </td>
              <td>{stock.close}</td>
              <td>{stock.volume}</td>
              <td>
                <button>Add to Watchlist</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
