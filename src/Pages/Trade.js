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
} from "firebase/database";
import { useAuth } from "../util/auth";
import { TradingView } from "../Components/TradingView/TradingView";

// Helper Functions
// Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
// But I made some modifications so you can key in 1-12 normally, just fyi
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

// getDatesInMonth(1, 2023);

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

  const [userWatchList, setUserWatchList] = useState([]); // list of KEY:VALUE => SYMBOL:SYMBOL

  useEffect(() => {
    /////////////////////////////////////////
    // Polygon.io API call to get Daily Open/Close data.
    // Need to run the API call 30 times to get monthly data.
    ////////////////////////////////////////

    // Need to un-hardcode this
    const daysInfo = getDatesInMonth(9, 2023);

    const fetchData = async () => {
      const collectedAPIcall = daysInfo.map((eachDate) =>
        axios
          .get(
            `https://api.polygon.io/v1/open-close/AAPL/${eachDate.toString()}?adjusted=true&apiKey=${
              process.env.REACT_APP_POLYGON_API_KEY
            }`
          )
          .then((response) => {
            return { time: response.data.from, value: response.data.close };
          })
          .catch((error) => {
            console.error(`Error fetching data for date: ${eachDate}`);
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

  const handleSaveToWatchlist = () => {
    // instantiates watchlist for firebase RTDB
    // (impt to note that it is just a reference to the db, it is not an empty string or empty list etc.)
    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);

    get(userWatchListRef).then((snapshot) => {
      const data = snapshot.val();
      if (data === null) {
        update(userWatchListRef, { [Symbol]: `${Symbol}` });
      } else {
        if (Symbol in data) {
          console.log(
            `Already in watchlist, Removing ${Symbol} from Watchlist`
          );
          update(userWatchListRef, { [Symbol]: null });
        } else {
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
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold leading-6 text-white">
            Trade: {stockData.name} ({Symbol})
          </h1>
        </div>
        <p className="my-2">Latest Price: ${stockData.latestPrice}</p>
        <p className="mb-4">Volume: {stockData.volume}</p>

        {typeof userCredits === "number" && (
          <div className="mt-4">
            <h3 className="text-lg">
              Your Current Balance: ${userCredits.toFixed(2)}
            </h3>
            <h3 className="text-lg">
              Your Current Holdings for {stockData.name}: {currentHolding}
            </h3>
            <button className="primary-cta-btn" onClick={handleSaveToWatchlist}>
              Add to WatchList
            </button>
          </div>
        )}

        <div className="mt-4">
          <TradingView ticker={Symbol} data={stockChartData} />
        </div>

        <form className="mt-4" onSubmit={handleOrderSubmit}>
          <div className="flex items-center space-x-4">
            <select
              className="rounded border p-2 text-black"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <input
              className="rounded border p-2 text-black"
              type="number"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              placeholder="Amount"
            />
            <button className="primary-cta-btn" type="submit">
              Confirm Order
            </button>
          </div>
        </form>

        <div className="table-responsive bg-white text-black rounded-lg shadow-lg p-4 mb-4">
          <table className="w-full border-collapse">
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
                <td>
                  ${(stockData.marketCap / 1000000000).toFixed(2)} Billion
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
