import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

import {
  get,
  getDatabase,
  ref,
  push,
  update,
  onValue,
  runTransaction,
  set,
  query,
  orderByChild,
  equalTo,
  onChildChanged,
} from "firebase/database";
import { useAuth } from "../util/auth";
import { TradingView } from "../Components/TradingView/TradingView";
import { formatCurrency } from "../util/formattingUtils";

/**
 * Helper function to get all dates within a specified month.
 *
 * @param {number} month - 1-indexed month number (1 = January, 2 = February, etc.)
 * @param {number} year - The year.
 * @returns {string[]} - An array containing all the date strings for the specified month.
 */
function getDatesInMonth(month, year) {
  const date = new Date(year, month - 1, 1);
  const days = [];
  while (date.getMonth() === month - 1) {
    const addDate = `${new Date(date).getFullYear()}-${String(
      new Date(date).getMonth()
    ).padStart(2, "0")}-${String(new Date(date).getDate()).padStart(2, "0")}`;

    days.push(addDate);
    date.setDate(date.getDate() + 1);
  }
  console.log("all days is: ", days);
  return days;
}

/**
 * The `Trade` component provides interfaces and visualizations for trading operations,
 * such as buying, selling, and watching stock details.
 *
 * It fetches and displays stock details from the Polygon.io API and allows
 * a user to buy/sell stocks or add/remove stocks from their watchlist.
 *
 * @returns {React.Element} - A React component to perform trade operations.
 */
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
  const [userCredits, setUserCredits] = useState(0); //
  const [orderAmount, setOrderAmount] = useState("");
  const [orderType, setOrderType] = useState("buy"); // or 'sell'

  const auth = useAuth();
  const userID = auth.user.uid; // This will give you the uid of the logged-in user

  const [stockChartData, setStockChartData] = useState([]); // Data for the chart
  const [currentHolding, setCurrentHolding] = useState(0);

  const [inWatchList, setInWatchList] = useState(false);

  useEffect(() => {
    /////////////////////////////////////////
    // Polygon.io API call to get Daily Open/Close data.
    // Need to run the API call sufficient times to get monthly data.
    ////////////////////////////////////////

    // Need to un-hardcode this
    const daysInfo = getDatesInMonth(10, 2023);
    const daysInfo2 = getDatesInMonth(11, 2023);
    const combinedDates = daysInfo.concat(daysInfo2);

    console.log("days- ", daysInfo);

    const fetchData = async () => {
      const collectedAPIcall = combinedDates.map((eachDate) =>
        axios
          .get(
            `https://api.polygon.io/v1/open-close/${Symbol}/${eachDate.toString()}?adjusted=true&apiKey=${
              process.env.REACT_APP_POLYGON_API_KEY
            }`
          )
          .then((response) => {
            return { time: response.data.from, value: response.data.close };
          })
          .catch((error) => {
            // console.error(`Error fetching data for date: ${eachDate}`);
          })
      );

      const allDaysData = await Promise.all(collectedAPIcall);
      // To get rid of all the undefined weekends
      const validDaysData = allDaysData.filter(Boolean);

      setStockChartData(validDaysData);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (userID) {
      const userCreditsRef = ref(db, `users/${userID}/credits`);
      onValue(userCreditsRef, (snapshot) => {
        const creditsValue = snapshot.val();
        if (typeof creditsValue === "number") {
          setUserCredits(creditsValue);
        }
      });
    }
  }, [userID]);

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
          logoURL: detailData.branding.logo_url, //throwing an error
          marketCap: detailData.market_cap,
        });
      })
      .catch((error) => {
        console.error("Error fetching combined stock data:", error);
      });
  }, [Symbol]);

  useEffect(() => {
    const ordersRef = query(
      ref(db, "orders"),
      orderByChild("userId"),
      equalTo(userID)
    );

    onValue(ordersRef, (snapshot) => {
      const trades = [];
      let stockHoldingAmount = 0;

      snapshot.forEach((childSnapshot) => {
        trades.push(childSnapshot.val());
      });

      trades.forEach((trade) => {
        if (trade.Symbol === Symbol) {
          if (trade.type === "buy") {
            stockHoldingAmount += parseFloat(trade.amount);
          } else if (trade.type === "sell") {
            stockHoldingAmount -= parseFloat(trade.amount);
          }
        }
      });

      setCurrentHolding(stockHoldingAmount);
    });
  }, [userID, Symbol, db]);

  /**
   * Handles the submission of a new order (buy or sell).
   *
   * Validates the transaction and, if valid, updates user credits and saves
   * the order to the database.
   *
   * @param {Event} event - The form submission event.
   */
  const handleOrderSubmit = (event) => {
    event.preventDefault();

    if (!isValidTransaction()) return;

    const orderData = {
      userId: userID,
      Symbol: Symbol,
      name: stockData.name,
      price: stockData.latestPrice,
      amount: orderAmount,
      timestamp: new Date().toISOString(),
      type: orderType,
    };

    updateCreditsAndSaveOrder(orderData);
  };

  // Initialises the first text output for Watchlist Button on page load.
  useEffect(() => {
    console.log("watchlist effect");
    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      console.log("innerloop triggered");
      const data = snapshot.val();
      if (data === null) {
        setInWatchList(false);
      } else {
        if (Symbol in data) {
          setInWatchList(true);
        } else {
          setInWatchList(false);
        }
      }
    });
  }, []);

  /**
   * Toggles the selected stock symbol in or out of the user's watchlist.
   *
   * This handler fetches the current watchlist from Firebase Realtime Database,
   * updates it in a way dependent on the current watchlist state for the symbol,
   * then sets the new watchlist to the database.
   */
  const handleSaveToWatchlist = () => {
    // instantiates watchlist for firebase RTDB
    // (impt to note that it is just a reference to the db, it is not an empty string or empty list etc.)
    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      const data = snapshot.val();
      if (data === null) {
        setInWatchList(true);
        update(userWatchListRef, { [Symbol]: `${Symbol}` });
      } else {
        if (Symbol in data) {
          console.log(
            `Already in watchlist, Removing ${Symbol} from Watchlist`
          );
          setInWatchList(false);
          update(userWatchListRef, { [Symbol]: null });
        } else {
          setInWatchList(true);
          update(userWatchListRef, { [Symbol]: `${Symbol}` });
        }
      }
    });
  };

  const isValidTransaction = () => {
    if (parseFloat(orderAmount) <= 0) {
      alert("Please enter a valid amount!");
      return false;
    }
    if (orderType === "sell" && orderAmount > currentHolding) {
      alert("You don't have enough stocks to sell!");
      return false;
    } else if (
      orderType === "buy" &&
      orderAmount * stockData.latestPrice > userCredits
    ) {
      alert("You don't have enough credits to buy this stock!");
      return false;
    }
    return true;
  };

  /**
   * Updates user credits and saves order data to the database.
   *
   * Performs a transaction to update the user's credits based on the order type
   * and amount, and subsequently stores the order data in the database.
   *
   * @param {Object} orderData - The order data to save to the database.
   */
  const updateCreditsAndSaveOrder = (orderData) => {
    const userCreditsRef = ref(db, `users/${userID}/credits`);
    runTransaction(userCreditsRef, (currentCredits) => {
      return orderType === "buy"
        ? currentCredits - stockData.latestPrice * orderAmount
        : orderType === "sell"
        ? currentCredits + stockData.latestPrice * orderAmount
        : currentCredits;
    }).then(() => {
      const newOrderRef = push(ref(db, "orders"));
      set(newOrderRef, orderData);
    });
  };

  return (
    <div className="structure">
      <div className="contentcontainer">
        <div className="titlestructure">
          <h1 className="titleheading">Trade</h1>
        </div>

        {/* Page Subtitle Header */}
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-txtcolor-primary">
              {stockData.name} ({Symbol}){" "}
            </h1>
            <p className="mt-2 text-sm text-txtcolor-secondary">
              Buy, Sell & Add to Watchlist
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              className={
                inWatchList === false ? "primary-cta-btn" : "secondary-cta-btn"
              }
              onClick={handleSaveToWatchlist}
            >
              {inWatchList === false
                ? "Add to Watch list"
                : "Remove from watchlist"}
            </button>
          </div>
        </div>

        {/* Main Page Content */}

        {/* Stats Bar */}
        <dl className="statsflex">
          <div className="statsbox">
            <dt className="statsheader">Last Price</dt>
            <dd className="statsdata">
              {formatCurrency(stockData.latestPrice)}
            </dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">Volume</dt>
            <dd className="statsdata">{formatCurrency(stockData.volume)}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">Stock Holdings</dt>
            <dd className="statsdata">{currentHolding}</dd>
          </div>
          <div className="statsbox">
            <dt className="statsheader">Portfolio Balance</dt>
            <dd className="statsdata">
              {formatCurrency(userCredits.toFixed(2))}
            </dd>
          </div>
        </dl>

        {/* TradingView */}

        <div className="mt-4">
          <TradingView data={stockChartData} />
        </div>

        {/* Trade Form */}

        <div className="px-4 bg-white text-black p-4 my-2">
          <h3 className="text-base font-semibold leading-7">Trade ${Symbol}</h3>
          <form className="mt-4" onSubmit={handleOrderSubmit}>
            <div className="flex items-center space-x-4">
              <select
                className="rounded border p-2 pr-8 text-black"
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
              >
                <option value="buy">Buy </option>
                <option value="sell">Sell</option>
              </select>

              <input
                className="rounded border p-2 text-black"
                type="number"
                value={orderAmount}
                onChange={(e) => setOrderAmount(e.target.value)}
                placeholder="Amount"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button className="primary-cta-btn" type="submit">
                Confirm Order
              </button>
            </div>
          </form>
        </div>

        {/* Stock Description Table*/}

        <div className="desc-table-structure-header">
          <h3 className="desc-table-header">
            {Symbol}: {stockData.name} - Stock Information
          </h3>

          <div className="desc-table-structure-content">
            <dl className="divide-y divide-gray-200">
              <div className="desc-table-row">
                <dt className="desc-table-title">Name</dt>
                <dd className="desc-table-text">{stockData.name}</dd>
              </div>

              <div className="desc-table-row">
                <dt className="desc-table-title">Description</dt>
                <dd className="desc-table-text">{stockData.description}</dd>
              </div>

              <div className="desc-table-row">
                <dt className="desc-table-title">Homepage URL</dt>
                <dd className="desc-table-text">
                  <a
                    href={stockData.homepageURL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {stockData.homepageURL}
                  </a>
                </dd>
              </div>

              <div className="desc-table-row">
                <dt className="desc-table-title">Market Capitalization</dt>
                <dd className="desc-table-text">
                  {formatCurrency(stockData.marketCap / 1000000000)} Billion
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
