import { Routes, Route, Switch } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Import our custom Auth Provider
import { AuthProvider } from "./util/auth";
import { useAuth } from "./util/auth.js";

// Import Pages
import { Markets } from "./Pages/Markets";
import { LogInPage } from "./Pages/LogInPage";
import { PositionPage } from "./Pages/PositionPage";
import { UserPage } from "./Pages/UserPage";
import { Trade } from "./Pages/Trade";
import { PortfolioPage } from "./Pages/PortfolioPage";
import { LandingPage } from "./Pages/LandingPage";
import { NewSignUpPage } from "./Pages/NewSignUpPage";

// Import Components
import { Navbar } from "./Components/NavBar/Navbar.js";
import { TradingView } from "./Components/TradingView/TradingView.js";

// Import Styling
import "./App.css";

// Import Firebase Auth
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "tradingdatabase"; //This corresponds to the Firebase RTDB branch/document
const STORAGE_KEY = "filestorage/"; // This corresponds to the Firebase Storage branch/document

function App() {
  const [showNavBar, setShowNavBar] = useState(false);
  const userAuth = useAuth();

  useEffect(() => {
    console.log("App.js useEffect is triggered");
    // console.log("userauth context is: ", userAuth); // Not sure why this is null even when it is in useEffect.
    onAuthStateChanged(auth, (user) => {
      console.log("App.js onAuthStateChangeTriggered");
      if (user) {
        const uid = user.uid;
        console.log("user logged in: ", user);
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
        console.log("user is signed out");
      }
    });
  }, []);

  // useEffect(() => {
  //   setShowNavBar(!!(userAuth && userAuth.user));
  // }, [userAuth]);

  console.log("app.js userAuth: ", userAuth);
  console.log("navbar status: ", showNavBar);

  return (
    <AuthProvider>
      {showNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="login" element={<LogInPage />} />
        <Route path="newsignup" element={<NewSignUpPage />} />

        <Route path="markets" element={<Markets />} />
        <Route path="user" element={<UserPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="/trade/:Symbol" element={<Trade />} />
        <Route path="user" element={<UserPage />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
