import { v4 as uuidv4 } from "uuid";
import { getDatabase, ref, set } from "@firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  signOut,
  onAuthStateChanged,
  updatePassword,
} from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { auth } from "../firebase/firebase.js";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const INITIAL_CREDITS = 100000;
  const INITIAL_PNL = 0;

  useEffect(() => {
    console.log("auth.js useEffect triggered");
    onAuthStateChanged(auth, (user) => {
      console.log("auth.js onAuthStateChange Triggered");
      if (user) {
        console.log("auth.js user logged in: ", user);
        setUser(user);
        setIsLoggedIn(true);
      } else {
        console.log("else branch");
      }
    });
  }, []);

  const createUser = (userInput) => {
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        const userUID = userCredential.user.uid;
        const db = getDatabase();
        const userRef = ref(db, "users/" + userUID);

        // Generate a random referral code
        const refCode = uuidv4();

        set(userRef, {
          credits: INITIAL_CREDITS,
          realizedPnL: INITIAL_PNL,
          refCode: refCode,
          usedRefCode: false,
        });

        setUser(userCredential.user);
        setIsLoggedIn(true);
        navigate("markets");
      })
      .catch((error) => {
        console.error("Error creating user:", error);
      });
  };

  const signInUser = (userInput) => {
    signInWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        setUser(userCredential.user);
        setIsLoggedIn(true);
        navigate("markets");
      })
      .catch((error) => {
        console.error("Error signing in:", error);
      });
  };

  const signOutUser = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setIsLoggedIn(false);
        navigate("/");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const changePassword = (newPassword) => {
    return new Promise((resolve, reject) => {
      if (user) {
        updatePassword(user, newPassword)
          .then(() => {
            console.log("Password updated successfully");
            resolve("Password updated successfully");
          })
          .catch((error) => {
            console.error("Error updating password:", error);
            reject(error);
          });
      } else {
        const error = "No user is currently logged in";
        console.log(error);
        reject(error);
      }
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        signInUser,
        signOutUser,
        createUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
