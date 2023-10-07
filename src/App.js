import { Routes, Route } from "react-router-dom";
import { useState } from "react";

// Import our custom Auth Provider
import { AuthProvider } from "./util/auth";
import { useAuth } from "./util/auth.js";

// Import Pages
import { HomePage } from "./Pages/HomePage";
import { LogInPage } from "./Pages/LogInPage";
import { TradePage } from "./Pages/TradePage";
import { PositionPage } from "./Pages/PositionPage";
import { UserPage } from "./Pages/UserPage";
import { PortfolioPage } from "./Pages/PortfolioPage";

// Import Components
import { Navbar } from "./Components/NavBar/Navbar.js";

// Import Styling
import "./App.css";
import { ChakraProvider } from "@chakra-ui/react";

// Import Firebase Auth
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/firebase";

// Save the Firebase message folder name as a constant to avoid bugs due to misspelling
const DB_MESSAGES_KEY = "tradingdatabase"; //This corresponds to the Firebase RTDB branch/document
const STORAGE_KEY = "filestorage/"; // This corresponds to the Firebase Storage branch/document

function App() {
  const [showNavBar, setShowNavBar] = useState(false);
  const userAuth = useAuth();

  onAuthStateChanged(auth, (user) => {
    if (user) {
      const uid = user.uid;
      setShowNavBar(true);
    } else {
      // console.log("user is signed out");
    }
  });

  console.log("app.js userAuth: ", userAuth);
  console.log("navbar status: ", showNavBar);

  return (
    <>
      <AuthProvider>
        {/* <Navbar /> */}
        {showNavBar === false ? null : <Navbar />}
        {/* {userAuth.isLoggedin === false ? null : <Navbar />} */}
        {/* {userAuth === null ? null : <Navbar />} */}
        <ChakraProvider>
          <Routes>
            <Route path="/" element={<LogInPage />} />
            <Route path="home" element={<HomePage />} />
            <Route path="user" element={<UserPage />} />

            <Route path="portfolio" element={<PortfolioPage />} />

            {/* <Route path="trade" element={<TradePage />} />
          <Route path="position" element={<PositionPage />} /> */}
          </Routes>
        </ChakraProvider>
      </AuthProvider>
    </>
  );
}

export default App;
