import { useState } from "react";
import { createContext } from "react";
import { useAuth } from "../util/auth.js";

// Firebase Auth
// import {
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   setPersistence,
//   browserSessionPersistence,
// } from "firebase/auth";

export const LogInPage = () => {
  const [user, setUser] = useState({ user: "", password: "" });

  // this will allow access to the auth functions from our custom auth.js in util
  // similar to userObject in Sam's video
  const userAuth = useAuth();

  const handleChange = (ev) => {
    let name = ev.target.name;
    let value = ev.target.value;

    setUser((prevState) => {
      return { ...prevState, [name]: value };
    });
    console.log("yay");
  };

  const handleLogIn = () => {
    userAuth.signInUser(user);
  };

  ////////// This function has been moved to auth.js
  // const signInUser = () => {
  //   setPersistence(auth, browserSessionPersistence)
  //     .then(() =>
  //       signInWithEmailAndPassword(auth, user.email, user.password).then(
  //         (userCredential) => {
  //           const user = userCredential.user;
  //           // console.log(userCredential);
  //           // console.log(user);
  //           // pass this user to Global Variable Context

  //           alert("successful log in!");
  //           navigate("home");
  //           // handleLogin();
  //         }
  //       )
  //     )
  //     .catch((error) => {
  //       const errorCode = error.code;
  //       const errorMessage = error.message;

  //       alert("Account not Found!");

  //       // console.log("sign in error code is: ", errorCode);
  //       // console.log("sign in error message is: ", errorMessage);
  //     });
  // };

  return (
    <>
      <div className="flex flex-row justify-center h-[100vh]">
        <div className="flex flex-col justify-center gap-[1rem] p-[2rem] ">
          <div className="text-center">MoonTrade</div>

          <div>
            <label>Email:</label>
            <input
              type="text"
              name="email"
              onChange={handleChange}
              value={user.email}
              autoComplete="off"
              placeholder="Insert your registered email"
              className="input input-bordered w-full max-w-xs"
            />
          </div>
          <div>
            <label>Password:</label>
            <input
              type="text"
              name="password"
              onChange={handleChange}
              value={user.password}
              autoComplete="off"
              placeholder="Insert your passsword"
              className="input input-bordered w-full max-w-xs"
            />
          </div>
          <input
            type="button"
            onClick={handleLogIn}
            value="Log In"
            className="btn btn-accent"
          />
        </div>
      </div>
    </>
  );
};
