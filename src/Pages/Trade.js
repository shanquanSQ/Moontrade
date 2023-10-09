import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { createChart } from "lightweight-charts";
import { getDatabase, ref, push, update, onValue } from "firebase/database";
import { useAuth } from "../util/auth";

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
  const [userCredits, setUserCredits] = useState(null); //
  const [orderAmount, setOrderAmount] = useState("");
  const [orderType, setOrderType] = useState("buy"); // or 'sell'

  const auth = useAuth();
  const userID = auth.user.uid; // This will give you the uid of the logged-in user

  useEffect(() => {
    if (userID) {
      const userCreditsRef = ref(db, `users/${userID}/credits`);
      onValue(userCreditsRef, (snapshot) => {
        if (snapshot.exists()) {
          setUserCredits(snapshot.val().credits);
        }
      });
    }
  }, [userID, db]);

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
      userId: userID,
      Symbol: Symbol,
      name: stockData.name,
      price: stockData.latestPrice,
      amount: orderAmount,
      timestamp: new Date().toISOString(),
      type: orderType,
    };

    // Save to Firebase Realtime Database and update credits atomically
    const orderRef = ref(db, "orders");
    const userCreditsRef = ref(db, `users/${userID}/credits`);

    let updatedCredits = userCredits;

    if (orderType === "buy") {
      updatedCredits -= stockData.latestPrice * orderAmount;
    } else if (orderType === "sell") {
      updatedCredits += stockData.latestPrice * orderAmount;
    }

    // Create an updates object for atomic updates
    const updates = {
      [`orders/${orderRef.key}`]: orderData,
      [`users/${userID}/credits`]: updatedCredits, // Update the user's credits correctly
    };

    // Update both order and user credits atomically
    update(ref(db), updates);
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

      {/* Displaying the user's current balance if available */}
      {userCredits !== null && (
        <h3>Your Current Balance: ${userCredits.toFixed(2)}</h3>
      )}

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
