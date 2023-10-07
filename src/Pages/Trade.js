import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export function Trade() {
  const { Symbol } = useParams();
  const [stockData, setStockData] = useState({});

  useEffect(() => {
    // Fetch stock details using Symbol if required. E.g.:
    // axios.get(`someEndpoint/${Symbol}`).then(response => {
    //     setStockData(response.data);
    // });
  }, [Symbol]);

  return (
    <div>
      {/* Display your stock's trading information here */}
      <h1>Trading Page for {Symbol}</h1>
    </div>
  );
}
