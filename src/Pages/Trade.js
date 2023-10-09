import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  getDatabase,
  ref,
  push,
  update,
  onValue,
  runTransaction,
  set,
} from "firebase/database";
import { useAuth } from "../util/auth";
import { TradingView } from "../Components/TradingView/TradingView";

// Helper Functions
function getDatesInMonth(month, year) {
  const date = new Date(year, month - 1, 1);
  const days = [];
  while (date.getMonth() === month - 1) {
    const addDate = `${new Date(date).getFullYear()}-${new Date(
      date
    ).getMonth()}-${String(new Date(date).getDate()).padStart(2, "0")}`;

    days.push(addDate);
    date.setDate(date.getDate() + 1);
  }
  // console.log(days);
  return days;
}

getDatesInMonth(1, 2023);

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

  useEffect(() => {
    const daysInfo = getDatesInMonth(9, 2023);
    console.log("days info is : ", daysInfo);
    const chartInfo = [];
    // Month in JavaScript is 0-indexed (January is 0, February is 1, etc),
    // But I made some modifications so you can key in 1-12 normally, just fyi

    const fetchData = () => {
      console.log("TRIGGERED");
      for (const date of daysInfo) {
        console.log("individual date: ", date);
        const individualDateData = axios.get(
          `https://api.polygon.io/v1/open-close/AAPL/${date}?adjusted=true&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
        );
        Promise.all[individualDateData].then((response) => {
          const dailyPriceData = response[0].data;
          const dailyClose = dailyPriceData.close;
          const priceDataDate = dailyPriceData.from;
          console.log("response is: ", dailyPriceData);
          chartInfo.push({ time: priceDataDate, value: dailyClose });
        });
      }
    };

    // const fetchData = async () => {
    //   for (const date of daysInfo) {
    //     console.log("info: ", date);
    //     try {
    //       console.log("trying");
    //       const response = await axios.get(
    //         `https://api.polygon.io/v1/open-close/AAPL/${date}?adjusted=true&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
    //       );
    //       console.log(`Data for ${date}:`, response.data);
    //       chartInfo.push(response.data);
    //     } catch (error) {
    //       console.error(`Error for ${date}:`, error);
    //     }
    //   }
    // };

    // Promise.all([fetchData]).then(() => {
    //   console.log("chart info is: ", chartInfo);
    //   console.log("DONE!");
    // });

    // Polygon.io API call to get Daily Open/Close data.
    // Need to run the API call 30 times to get monthly data.
    const dailyOpenClose = axios.get(
      `https://api.polygon.io/v1/open-close/AAPL/2023-10-05?adjusted=true&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
    );

    const dailyOpenClose2 = axios.get(
      `https://api.polygon.io/v1/open-close/AAPL/2023-10-06?adjusted=true&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
    );

    Promise.all([dailyOpenClose, dailyOpenClose2]).then((response) => {
      const dailyPriceData = response[0].data;
      const dailyPriceData2 = response[1].data;

      const dailyClose = dailyPriceData.close;
      const priceDataDate = dailyPriceData.from;

      const dailyClose2 = dailyPriceData2.close;
      const priceDataDate2 = dailyPriceData2.from;

      console.log(dailyPriceData);
      console.log(dailyPriceData2);

      // Need to convert the date to a UNIX timestamp.
      // use JS's Date.parse(date string)
      // const priceDataDate = Date.parse(dailyPriceData.from);
      // const priceDataDate2 = Date.parse(dailyPriceData2.from);

      setStockChartData([
        { time: priceDataDate, value: dailyClose },
        { time: priceDataDate2, value: dailyClose2 },
      ]);
    });
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

    // Save to Firebase Realtime Database and update credits
    const orderRef = ref(db, "orders");
    const userCreditsRef = ref(db, `users/${userID}/credits`);

    runTransaction(userCreditsRef, (currentCredits) => {
      if (orderType === "buy") {
        return currentCredits - stockData.latestPrice * orderAmount;
      } else if (orderType === "sell") {
        return currentCredits + stockData.latestPrice * orderAmount;
      }

      return currentCredits; // If neither buy or sell, return the current amount
    }).then(() => {
      const ordersRef = ref(db, "orders");
      const newOrderRef = push(ordersRef);
      set(newOrderRef, orderData);
    });
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
      {typeof userCredits === "number" && (
        <h3>Your Current Balance: ${userCredits.toFixed(2)}</h3>
      )}

      {/* Your TradingView chart can go here */}
      {/* {console.log("the stock chart data: ",  stockChartData)} */}
      <TradingView ticker={Symbol} data={stockChartData} />

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
