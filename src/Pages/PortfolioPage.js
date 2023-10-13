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
  update,
} from "@firebase/database";

export const PortfolioPage = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [positions, setPositions] = useState([]);
  const auth = useAuth();
  const userID = auth.user.uid;
  const db = getDatabase();

  const [portfolioPL, setPortfolioPL] = useState(0); // Portfolio PnL
  const [numTrades, setNumTrades] = useState(0); // # of Trades Done

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
    const userRef = ref(db, `users/${userID}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        // console.log("User data from Firebase:", snapshot.val());
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

      const numberOfTrades = trades.length;
      setNumTrades(numberOfTrades);

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

      // Calculate total portfolio P&L
      let totalPL = 0;
      for (const symbol in aggregatedTrades) {
        totalPL += aggregatedTrades[symbol].realizedPL;
      }
      setPortfolioPL(totalPL);

      // Update Firebase
      try {
        const userRef = ref(db, `users/${userID}`);
        update(userRef, { realizedPnL: totalPL });
      } catch (error) {
        console.error("Error updating Firebase:", error);
      }

      // Call the function to calculate trades after constructing aggregatedTrades
      calculateTrades(aggregatedTrades, trades);
    });
  }, [db]);

  return (
    <div className="structure">
      <div className="contentcontainer">
        <div className="titlestructure">
          <h1 className="titleheading">Portfolio</h1>
        </div>

        <div className="sm:flex sm:items-center py-2">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-txtcolor-primary">
              Your Portfolio{" "}
            </h1>
            <p className="mt-2 text-sm text-txtcolor-secondary">
              View Portfolio, P&L and Rank{" "}
            </p>
          </div>
        </div>

        {/* Stats Bar */}
        <dl className="statsflex mb-[.2rem] lg:mb-[.5rem]">
          <div className="statsbox">
            <dt className="statsheader">Portfolio Balance</dt>
            <dd className="statsdata">${credits.toFixed(2)}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">Portfolio P&L</dt>
            <dd className="statsdata">${portfolioPL.toFixed(2)}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">No. of Trades</dt>
            <dd className="statsdata">{numTrades}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">Competition Rank</dt>
            <dd className="statsdata">#</dd>
          </div>
        </dl>
        <div className="table-responsive bg-white text-black px-4 pt-4 pb-0 rounded-md">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-gray-800">
                <th>Symbol</th>
                <th>Name</th>
                <th>Current Price</th>
                <th>Current Holding</th>
                <th>Average Buy Price</th>
                <th>Amount Bought</th>
                <th>Average Sell Price</th>
                <th>Amount Sold</th>
                <th>Unrealized P&L</th>
                <th>Realized P&L</th>{" "}
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td>
                    <Link to={`/trade/${position.Symbol}`}>
                      {position.Symbol}
                    </Link>
                  </td>
                  <td>{position.name}</td>
                  <td>${position.currentPrice.toFixed(2)}</td>
                  <td>{position.amount}</td>
                  <td>${position.averageBuyPrice.toFixed(2)}</td>
                  <td>{position.buyAmount.toFixed(0)}</td>
                  <td>${position.averageSellPrice.toFixed(2)}</td>
                  <td>{position.sellAmount.toFixed(0)}</td>
                  <td>${position.unrealizedPL.toFixed(2)}</td>
                  <td>${position.realizedPL.toFixed(2)}</td>{" "}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;
