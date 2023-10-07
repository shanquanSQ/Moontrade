import { Routes, Route } from "react-router-dom";

// Import Pages
import { HomePage } from "./Pages/HomePage";
import { LogInPage } from "./Pages/LogInPage";
import { Trade } from "./Pages/Trade";

// Import Components

// Import Styling
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "tradingdatabase"; //This corresponds to the Firebase RTDB branch/document
const STORAGE_KEY = "filestorage/"; // This corresponds to the Firebase Storage branch/document

function App() {
  return (
    <>
      <ChakraProvider>
        <Routes>
          <Route path="/" element={<LogInPage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="trade" element={<Trade />} />
        </Routes>
      </ChakraProvider>
    </>
  );
}

export default App;
