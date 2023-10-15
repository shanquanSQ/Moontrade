import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../util/auth";
import { ref, getDatabase, get } from "firebase/database";

/**
 * A React component that fetches and displays the latest news for
 * stocks listed in the user's watchlist. It retrieves the watchlist
 * from Firebase, fetches news for each stock using the Polygon API,
 * and displays the news in a structured format.
 */
export function News() {
  const [news, setNews] = useState({});
  const [watchListStocks, setWatchListStocks] = useState([]);
  const [userID, setUserID] = useState("");
  const db = getDatabase();
  const userAuth = useAuth();

  useEffect(() => {
    console.log("useeffect set user id");
    if (userAuth.user === null) {
      const userInfo = localStorage.getItem("userLocalInfo");
      console.log("get info");
      setUserID(userInfo.uid);
    } else {
      console.log("set info");
      localStorage.setItem("userLocalInfo", userAuth.user);
      setUserID(userAuth.user.uid);
    }
  }, []);

  useEffect(() => {
    const userWatchListRef = ref(db, `users/${userID}/watchlist/`);
    get(userWatchListRef).then((snapshot) => {
      setWatchListStocks(snapshot.val() || {});
    });
  }, [db, userID]);

  useEffect(() => {
    const fetchNews = async () => {
      const newsData = {};

      // Sequentially fetch news data for each stock symbol
      for (const symbol in watchListStocks) {
        try {
          const response = await axios.get(
            `https://api.polygon.io/v2/reference/news?ticker=${symbol}&limit=5&apiKey=${process.env.REACT_APP_POLYGON_API_KEY}`
          );

          // Add news data to newsData object
          if (response.data && response.data.results) {
            newsData[symbol] = response.data.results;
          }
        } catch (error) {
          console.error(`Error fetching news for ${symbol}`, error);
        }
      }

      setNews(newsData);
    };

    if (Object.keys(watchListStocks).length > 0) {
      fetchNews();
    }
  }, [watchListStocks]);

  return (
    <div className="structure">
      <div className="contentcontainer">
        <div className="titlestructure">
          <h1 className="titleheading">News</h1>
        </div>

        {/* Page Subtitle Header */}
        <div className="sm:flex sm:items-center py-2">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-txtcolor-primary">
              News from Watchlist{" "}
            </h1>
            <p className="mt-2 text-sm text-txtcolor-secondary">
              Read Latest News from Watchlist{" "}
            </p>
          </div>
        </div>

        {/* Main Page Content */}

        <div className="flex flex-col items-center bg-white py-4 rounded-md">
          <div className="mx-auto max-w-xl px-4">
            <div className="mx-auto max-w-xl lg:max-w-xl">
              {Object.keys(news).length > 0 ? (
                Object.keys(news).map((symbol) => (
                  <div key={symbol} className="mt-4 space-y-4">
                    <h2 className="text-xl font-bold tracking-tight text-txtcolor-primary sm:text-3xl">
                      Latest for {symbol}
                    </h2>
                    {news[symbol].map((article, index) => (
                      <article
                        key={index}
                        className="flex flex-col gap-8 lg:flex-row border-b border-slate-300"
                      >
                        <div className="group max-w-xl">
                          <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                            <a
                              href={article.article_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {article.title}
                            </a>
                          </h3>
                          <p className="mt-5 text-sm leading-6 text-gray-600">
                            {article.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-x-4 text-xs">
                          <a
                            href={article.article_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="square-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                          >
                            ...
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                ))
              ) : (
                <p className="mt-2 text-lg leading-8 text-gray-600">
                  No news available.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
