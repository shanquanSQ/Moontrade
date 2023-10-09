import React, { useState } from "react";
import { PositionPage } from "./PositionPage"; // Update the import path to match your file structure

export const Position = () => {
  const [showPositions, setShowPositions] = useState(false);

  const handleButtonClick = () => {
    setShowPositions(!showPositions);
  };

  return (
    <>
      <div>This is the Position Page</div>
      <button onClick={handleButtonClick}>
        {showPositions ? "Hide Positions" : "Show Positions"}
      </button>
      {showPositions && <PositionPage />}{" "}
      {/* Render if showPositions is true */}
    </>
  );
};
