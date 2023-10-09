import React, { useEffect, useState } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";

const PositionPage = () => {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    const positionsRef = firebase.database().ref("positions");
    try {
      const snapshot = await positionsRef.once("value");
      const positionsData = snapshot.val();
      if (positionsData) {
        const positionsArray = Object.values(positionsData);
        setPositions(positionsArray);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching positions:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return (
    <>
      <div>
        <h1>User Positions</h1>
        {loading ? (
          <p>Loading positions...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ticker</th>
                <th>Name</th>
                <th>Timestamp</th>
                <th>Trade Price</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position, index) => (
                <tr key={index}>
                  <td>{position.ticker}</td>
                  <td>{position.name}</td>
                  <td>{position.timestamp}</td>
                  <td>{position.tradePrice}</td>
                  <td>{position.profitLoss}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
};

export default PositionPage;
