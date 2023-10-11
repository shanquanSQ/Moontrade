import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../util/auth";
import axios from "axios";

// Firebase v9 SDK imports
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "@firebase/database";

export const PortfolioPage = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [positions, setPositions] = useState([]);
  const auth = useAuth();
  const userID = auth.user.uid; // might not always be defined user is not defined on page
  // take out 21 line out
  const db = getDatabase();

  const calculateTrades = async (aggregatedTrades, trades) => {
    for (const trade of trades) {
      try {
        const response = await axios.get(
          `https://api.polygon.io/v2/last/trade/${trade.Symbol}?apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
        );
        const currentMarketPrice = response.data.results.p;
        const aggregatedTrade = aggregatedTrades[trade.Symbol];

        // Store current market price to the aggregatedTrade object
        aggregatedTrade.currentPrice = currentMarketPrice;

        // Calculate Unrealized P&L
        aggregatedTrade.unrealizedPL =
          (currentMarketPrice - aggregatedTrade.averageBuyPrice) *
          aggregatedTrade.amount;
      } catch (error) {
        console.error("Error fetching stock price:", error);
      }
    }
    setPositions(Object.values(aggregatedTrades));
  };

  useEffect(() => {
    //if user.auth.id exists, then run this
    const userRef = ref(db, `users/${userID}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("User data from Firebase:", snapshot.val());
        setCredits(snapshot.val().credits);
      }
    });

    const ordersRef = query(
      ref(db, "orders"),
      orderByChild("userId"),
      equalTo(userID)
    );

    onValue(ordersRef, (snapshot) => {
      const trades = [];
      const aggregatedTrades = {};

      snapshot.forEach((childSnapshot) => {
        trades.push(childSnapshot.val());
      });

      trades.forEach((trade) => {
        if (!aggregatedTrades[trade.Symbol]) {
          aggregatedTrades[trade.Symbol] = {
            Symbol: trade.Symbol,
            name: trade.name,
            amount: 0,
            totalBuyCost: 0,
            totalSellCost: 0,
            buyAmount: 0,
            sellAmount: 0,
            averageBuyPrice: 0,
            averageSellPrice: 0,
            unrealizedPL: 0,
            realizedPL: 0,
            currentPrice: 0,
          };
        }

        const aggregatedTrade = aggregatedTrades[trade.Symbol];
        if (trade.type === "buy") {
          aggregatedTrade.amount += parseFloat(trade.amount);
          aggregatedTrade.buyAmount += parseFloat(trade.amount);
          aggregatedTrade.totalBuyCost +=
            parseFloat(trade.amount) * trade.price;
        } else if (trade.type === "sell") {
          aggregatedTrade.amount -= parseFloat(trade.amount);
          aggregatedTrade.sellAmount += parseFloat(trade.amount);
          aggregatedTrade.totalSellCost +=
            parseFloat(trade.amount) * trade.price;
        }

        aggregatedTrade.averageBuyPrice =
          aggregatedTrade.totalBuyCost / aggregatedTrade.buyAmount || 0;
        aggregatedTrade.averageSellPrice =
          aggregatedTrade.totalSellCost / aggregatedTrade.sellAmount || 0;

        // Calculate Realized P&L
        if (trade.type === "sell") {
          aggregatedTrade.realizedPL +=
            (trade.price - aggregatedTrade.averageBuyPrice) *
            parseFloat(trade.amount);
        }
      });

      // Call the function to calculate trades after constructing aggregatedTrades
      calculateTrades(aggregatedTrades, trades);
    });
  }, [db]);

  return (
    <>
      <div>Portfolio Page</div>
      <h2>Balance: ${credits.toFixed(2)}</h2>
      <h3>Positions:</h3>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Current Price</th>
            <th>Current Holding</th>
            <th>Average Buy Price</th>
            <th>Amount Bought</th>
            <th>Average Sell Price</th>
            <th>Amount Sold</th>
            <th>Unrealized P&L</th>
            <th>Realized P&L</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={index}>
              <td>
                <Link to={`/trade/${position.Symbol}`}>{position.Symbol}</Link>
              </td>
              <td>{position.name}</td>
              <td>${position.currentPrice.toFixed(2)}</td>
              <td>{position.amount}</td>
              <td>${position.averageBuyPrice.toFixed(2)}</td>
              <td>{position.buyAmount.toFixed(0)}</td>
              <td>${position.averageSellPrice.toFixed(2)}</td>
              <td>{position.sellAmount.toFixed(0)}</td>
              <td>${position.unrealizedPL.toFixed(2)}</td>
              <td>${position.realizedPL.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default PortfolioPage;
