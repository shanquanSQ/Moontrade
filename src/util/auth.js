// Firebase Auth
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from "firebase/auth";

import { useContext, useState } from "react";
import { createContext } from "react";

import { auth } from "../firebase/firebase.js";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const createUser = (user) => {
    createUserWithEmailAndPassword(auth, user.email, user.password)
      .then((userCredential) => {
        // When this promise runs, the user is Signed Up.
        // userCredential (name is whatever) is a firebase object.
        const user = userCredential.user;

        setUser(user);
        setIsLoggedIn(true);

        console.log("user is: ", user);
        console.log("user credentials is: ", userCredential);
        navigate("home");
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        console.log("error code is: ", errorCode);
        console.log("error message is: ", errorMessage);
      });
  };

  // important to put in user state as props here!
  const signInUser = (user) => {
    setPersistence(auth, browserSessionPersistence)
      .then(() =>
        signInWithEmailAndPassword(auth, user.email, user.password).then(
          (userCredential) => {
            const user = userCredential.user;
            setUser(user);
            setIsLoggedIn(true);

            alert("successful log in!");
            navigate("home");
          }
        )
      )
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;

        alert("Account not Found!");

        // console.log("sign in error code is: ", errorCode);
        // console.log("sign in error message is: ", errorMessage);
      });
  };

  const signOutUser = (user) => {
    signOut(auth)
      .then(() => {
        setUser(null);
        setIsLoggedIn(false);
        console.log("Sign out Successful");

        alert("Sign Out Successful!");
        navigate("/");
      })
      .catch((error) => {
        console.log("Error occured while signing out");
        alert("Error when signing out");
      });
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoggedIn, signInUser, signOutUser, createUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
