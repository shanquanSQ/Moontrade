// import { useNavigate } from "react-router-dom";

// export const PortfolioPage = () => {
//   const navigate = useNavigate();

//   const handleLogIn = () => {
//     // useAuth().login(user);  // Why does this not work?
//     // authUser.login(user);
//     navigate("home");
//   };

//   return (
//     <>
//       <div>Portfolio Page</div>
//     </>
//   );
// };
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Import Link from React Router
import { useNavigate } from "react-router-dom";
import { useAuth } from "../util/auth";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
  equalTo,
} from "@firebase/database";
import PositionPage from "./PositionPage"; // Update the import path to match your file structure

export const PortfolioPage = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState(0);
  const [positions, setPositions] = useState([]);
  const auth = useAuth();
  const userID = auth.user.uid;
  const db = getDatabase();

  useEffect(() => {
    const userRef = ref(db, `users/${userID}`);
    onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        console.log("User data from Firebase:", snapshot.val()); // Add this line
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
            buyAmount: 0, // Separate buy amount accumulator
            sellAmount: 0, // Separate sell amount accumulator
            averageBuyPrice: 0,
            averageSellPrice: 0,
          };
        }

        const aggregatedTrade = aggregatedTrades[trade.Symbol];
        if (trade.type === "buy") {
          aggregatedTrade.amount += parseFloat(trade.amount);
          aggregatedTrade.buyAmount += parseFloat(trade.amount); // Increment the buy amount
          aggregatedTrade.totalBuyCost +=
            parseFloat(trade.amount) * trade.price;
        } else if (trade.type === "sell") {
          aggregatedTrade.amount -= parseFloat(trade.amount);
          aggregatedTrade.sellAmount += parseFloat(trade.amount); // Increment the sell amount
          aggregatedTrade.totalSellCost +=
            parseFloat(trade.amount) * trade.price;
        }

        aggregatedTrade.averageBuyPrice =
          aggregatedTrade.totalBuyCost / aggregatedTrade.buyAmount || 0; // Use buyAmount
        aggregatedTrade.averageSellPrice =
          aggregatedTrade.totalSellCost / aggregatedTrade.sellAmount || 0; // Use sellAmount
      });

      const positionsArray = Object.values(aggregatedTrades);
      setPositions(positionsArray);
    });
  }, [db]);

  return (
    <>
      <div>Portfolio Page</div>
      <h2>Balance: ${credits.toFixed(2)}</h2>
      <h3>Positions:</h3>
      <Link to="/positions">
        {" "}
        {/* Link to the PositionPage */}
        <button>Show Positions</button>
      </Link>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Average Buy Price</th>
            <th>Average Sell Price</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((position, index) => (
            <tr key={index}>
              <td>{position.Symbol}</td>
              <td>{position.name}</td>
              <td>{position.amount}</td>
              <td>${position.averageBuyPrice.toFixed(2)}</td>
              <td>${position.averageSellPrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default PortfolioPage;
