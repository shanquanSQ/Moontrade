import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { createChart } from "lightweight-charts";
import { getDatabase, ref, push, update } from "firebase/database";

export function Trade() {
  const { Symbol } = useParams();
  const db = getDatabase();
  const [stockData, setStockData] = useState({
    name: "",
    latestPrice: null,
    volume: null,
    description: "",
    homepageURL: "",
    logoURL: "",
    marketCap: null,
  });
  const [currentUserCredits, setCurrentUserCredits] = useState(10000); // Default to 10,000
  const [orderAmount, setOrderAmount] = useState("");
  const [orderType, setOrderType] = useState("buy"); // or 'sell'

  // Ideally, you'd get this dynamically after a user logs in.
  const userId = "someUserId";

  useEffect(() => {
    const fetchPrice = axios.get(
      `https://api.polygon.io/v2/last/trade/${Symbol}?apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
    );

    const fetchDetails = axios.get(
      `https://api.polygon.io/v3/reference/tickers/${Symbol}?apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
    );

    Promise.all([fetchPrice, fetchDetails])
      .then((responses) => {
        const priceData = responses[0].data.results;
        const detailData = responses[1].data.results;

        setStockData({
          name: detailData.name,
          latestPrice: priceData.p,
          volume: priceData.q,
          description: detailData.description,
          homepageURL: detailData.homepage_url,
          logoURL: detailData.branding.logo_url,
          marketCap: detailData.market_cap,
        });
      })
      .catch((error) => {
        console.error("Error fetching combined stock data:", error);
      });
  }, [Symbol]);

  const handleOrderSubmit = (event) => {
    event.preventDefault();
    const orderData = {
      Symbol: Symbol,
      name: stockData.name,
      price: stockData.latestPrice,
      amount: orderAmount,
      timestamp: new Date().toISOString(),
      type: orderType,
    };

    // Save to Firebase Realtime Database
    const orderRef = ref(db, "orders");
    push(orderRef, orderData);

    const userRef = ref(db, "users/" + userId);
    let updatedCredits = currentUserCredits;

    if (orderType === "buy") {
      updatedCredits -= stockData.latestPrice * orderAmount;
    } else if (orderType === "sell") {
      updatedCredits += stockData.latestPrice * orderAmount;
    }
    update(userRef, { credits: updatedCredits });
  };

  return (
    <div>
      <h1>
        Trading Page for {stockData.name} ({Symbol})
      </h1>
      <p>Latest Price: ${stockData.latestPrice}</p>
      <p>Volume: {stockData.volume}</p>

      <table>
        <tbody>
          <tr>
            <td>Name</td>
            <td>{stockData.name}</td>
          </tr>
          <tr>
            <td>Description</td>
            <td>{stockData.description}</td>
          </tr>
          <tr>
            <td>Homepage URL</td>
            <td>
              <a
                href={stockData.homepageURL}
                target="_blank"
                rel="noopener noreferrer"
              >
                {stockData.homepageURL}
              </a>
            </td>
          </tr>
          <tr>
            <td>Logo</td>
            <td>
              <img
                src={stockData.logoURL}
                alt={`${stockData.name} logo`}
                style={{ width: "50px", height: "50px" }}
              />
            </td>
          </tr>
          <tr>
            <td>Market Capitalization</td>
            <td>${(stockData.marketCap / 1000000000).toFixed(2)} Billion</td>
          </tr>
        </tbody>
      </table>

      {/* Your TradingView chart can go here */}

      {/* Remaining code for buying/selling and other functionalities */}
      <form onSubmit={handleOrderSubmit}>
        <select
          value={orderType}
          onChange={(e) => setOrderType(e.target.value)}
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <input
          type="number"
          value={orderAmount}
          onChange={(e) => setOrderAmount(e.target.value)}
          placeholder="Amount"
        />
        <button type="submit">Confirm Order</button>
      </form>
    </div>
  );
}
