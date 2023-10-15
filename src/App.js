import { Routes, Route, Switch } from "react-router-dom";
import React, { useState, useEffect } from "react";

// Import our custom Auth Provider
import { AuthProvider } from "./util/auth";
import { useAuth } from "./util/auth.js";

// Import Pages
import { Markets } from "./Pages/Markets";
import { LogInPage } from "./Pages/LogInPage";
import { UserPage } from "./Pages/UserPage";
import { Trade } from "./Pages/Trade";
import { PortfolioPage } from "./Pages/PortfolioPage";
import { LandingPage } from "./Pages/LandingPage";
import { NewSignUpPage } from "./Pages/NewSignUpPage";
import { News } from "./Pages/News";
import { LeaderboardPage } from "./Pages/LeaderboardPage";

// Import Components
import { Navbar } from "./Components/NavBar/Navbar.js";
import { StatusBar } from "./Components/StatusBar/StatusBar";

// Import Styling
import "./App.css";

// Import Firebase Auth
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

function App() {
  const [showNavBar, setShowNavBar] = useState(false);
  const userAuth = useAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      console.log("App.js onAuthStateChange Triggered");
      if (user) {
        console.log("user logged in: ", user);
        setShowNavBar(true);
      } else {
        setShowNavBar(false);
        console.log("user is signed out");
      }
    });
  }, []);

  return (
    <AuthProvider>
      <div className="absolute top-0 z-[99] w-full">
        <StatusBar />
      </div>
      {showNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="login" element={<LogInPage />} />
        <Route path="newsignup" element={<NewSignUpPage />} />

        <Route path="markets" element={<Markets />} />
        <Route path="user" element={<UserPage />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/trade/:Symbol" element={<Trade />} />
        <Route path="user" element={<UserPage />} />
        <Route path="news" element={<News />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
