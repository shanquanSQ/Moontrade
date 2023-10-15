import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../util/auth";
import axios from "axios";
import { formatCurrency } from "../util/formattingUtils";

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

/**
 * The `PortfolioPage` component is responsible for displaying the user's trading
 * portfolio, which includes their trades, credits, P&L data, and portfolio balance.
 *
 * This component fetches user and trade data from Firebase Realtime Database
 * and performs calculations to display the user's Portfolio P&L, Number of Trades Done,
 * and individual trade details.
 *
 * @component
 * @returns JSX.Element
 */
export const PortfolioPage = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [positions, setPositions] = useState([]);
  const auth = useAuth();
  const userID = auth.user.uid;
  const db = getDatabase();

  const [portfolioPL, setPortfolioPL] = useState(0); // Portfolio PnL
  const [numTrades, setNumTrades] = useState(0); // # of Trades Done

  /**
   * Calculates trades using fetched stock price and updates the state.
   * Also calculates Unrealized P&L for each aggregated trade.
   *
   * @function
   * @async
   * @param {Object} aggregatedTrades - Object containing all trades, aggregated by stock symbol.
   * @param {Array} trades - Array of individual trades to be processed.
   */
  const calculateTrades = async (aggregatedTrades, trades) => {
    for (const trade of trades) {
      try {
        // Fetch the last trade details for the stock symbol from the Polygon API.
        const response = await axios.get(
          `https://api.polygon.io/v2/last/trade/${trade.Symbol}?apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
        );
        const currentMarketPrice = response.data.results.p;
        const aggregatedTrade = aggregatedTrades[trade.Symbol];

        // Store current market price to the aggregatedTrade object
        aggregatedTrade.currentPrice = currentMarketPrice;

        /**
         * Calculate Unrealized P&L:
         * The unrealized profit and loss is calculated by taking
         * the difference between the current market price and the average buy price,
         * then multiplied by the amount of the stock owned.
         *
         * Unrealized P&L = (currentMarketPrice - averageBuyPrice) * amount
         */
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

      /**
       * Constructing aggregatedTrades:
       * For each trade, a symbol-wise aggregation is prepared.
       * It calculates cumulative values needed for later calculations
       * such as total buy cost, total sell cost, amount of stock bought and sold, etc.
       * It helps to calculate various performance metrics of the portfolio such as
       * average buy/sell price, realized and unrealized P&L, etc.
       */
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

        /**
         * Calculating Average Buy Price:
         * The average buy price is calculated by dividing the total cost spent on buying
         * the stock by the total amount bought.
         *
         * averageBuyPrice = totalBuyCost / buyAmount
         */
        aggregatedTrade.averageBuyPrice =
          aggregatedTrade.totalBuyCost / aggregatedTrade.buyAmount || 0;

        /**
         * Calculating Average Sell Price:
         * The average sell price is calculated by dividing the total cost received from selling
         * the stock by the total amount sold.
         *
         * averageSellPrice = totalSellCost / sellAmount
         */
        aggregatedTrade.averageSellPrice =
          aggregatedTrade.totalSellCost / aggregatedTrade.sellAmount || 0;

        /**
         * Calculating Realized P&L for Sell Trades:
         * When the stock is sold, the realized profit and loss are calculated by taking
         * the difference between the sell price and the average buy price,
         * then multiplied by the amount of the stock sold.
         *
         * realizedPL += (sellPrice - averageBuyPrice) * amountSold
         */
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

        {/* Page Subtitle Header */}
        <div className="sm:flex sm:items-center pb-6">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-txtcolor-primary">
              Your Portfolio{" "}
            </h1>
            <p className="mt-2 text-sm text-txtcolor-secondary">
              View Portfolio, P&L and Rank{" "}
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link to="/leaderboard" className="primary-cta-btn">
              View Leaderboard
            </Link>
          </div>
        </div>

        {/* Main Page Content */}

        {/* Stats Bar */}
        <dl className="statsflex mb-[.2rem] lg:mb-[.5rem]">
          <div className="statsbox">
            <dt className="statsheader">Portfolio Balance</dt>
            <dd className="statsdata">{formatCurrency(credits)}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">Portfolio P&L</dt>
            <dd
              className={`statsneutral ${
                portfolioPL >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {formatCurrency(portfolioPL)}
            </dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">No. of Trades</dt>
            <dd className="statsdata">{numTrades}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">P&L %</dt>
            <dd
              className={`statsneutral ${
                portfolioPL >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              {credits !== 0
                ? ((portfolioPL / credits) * 100).toFixed(2)
                : "N/A"}
              %
            </dd>
          </div>
        </dl>
        <div className="table-responsive bg-white text-black rounded-md">
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
                    <Link
                      to={`/trade/${position.Symbol}`}
                      className="font-bold"
                    >
                      {position.Symbol}
                    </Link>
                  </td>
                  <td>{position.name}</td>
                  <td>{formatCurrency(position.currentPrice)}</td>
                  <td>{position.amount}</td>
                  <td>{formatCurrency(position.averageBuyPrice)}</td>
                  <td>{position.buyAmount.toFixed(0)}</td>
                  <td>{formatCurrency(position.averageSellPrice)}</td>
                  <td>{position.sellAmount.toFixed(0)}</td>
                  <td>{formatCurrency(position.unrealizedPL)}</td>
                  <td>{formatCurrency(position.realizedPL)}</td>{" "}
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
