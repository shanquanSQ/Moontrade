import { v4 as uuidv4 } from "uuid";
import { getDatabase, ref, set } from "@firebase/database";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
  signOut,
} from "firebase/auth";
import { useContext, useState } from "react";
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

  const createUser = (userInput) => {
    createUserWithEmailAndPassword(auth, userInput.email, userInput.password)
      .then((userCredential) => {
        const userUID = userCredential.user.uid;
        const db = getDatabase();
        const userRef = ref(db, "users/" + userUID);

        set(userRef, {
          credits: INITIAL_CREDITS,
          realizedPnL: INITIAL_PNL,
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
    setPersistence(auth, browserSessionPersistence)
      .then(() => {
        signInWithEmailAndPassword(auth, userInput.email, userInput.password)
          .then((userCredential) => {
            setUser(userCredential.user);
            setIsLoggedIn(true);
            navigate("markets");
          })
          .catch((error) => {
            console.error("Error signing in:", error);
          });
      })
      .catch((error) => {
        console.error("Error setting persistence:", error);
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        signInUser,
        signOutUser,
        createUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
