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
  const [sortType, setSortType] = useState("volume");

  useEffect(() => {
    const fetchData = async () => {
      const fetchedStocks = [];

      for (let stock of stockList) {
        try {
          const lastWorkingDate = getLastWorkingDay();

          const response = await axios.get(
            `https://api.polygon.io/v1/open-close/${stock.Symbol}/${lastWorkingDate}?adjusted=true&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
          );

          const mergedData = {
            ...stock,
            ...response.data,
          };

          fetchedStocks.push(mergedData);
        } catch (error) {
          console.error(`Error fetching data for ${stock.Symbol}`, error);
        }
      }

      setStocks(fetchedStocks);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sortArray = (type) => {
      const types = {
        volume: "volume",
        name: "Name",
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
        <option value="volume">Volume</option>
        <option value="name">Alphabetical</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Name</th>
            <th>Last Price</th>
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
