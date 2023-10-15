import { useState } from "react";
import { useAuth } from "../util/auth.js";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";

/**
 * `LogInPage` Component - Allows a user to log in using their credentials.
 *
 * @component
 * @returns {ReactElement} JSX to render the login page.
 */
export const LogInPage = () => {
  const [user, setUser] = useState({ user: "", password: "" });
  const navigate = useNavigate();
  const userAuth = useAuth();

  /**
   * Handles the change of input fields and updates the state accordingly.
   *
   * @function
   * @param {Event} ev - The event object related to the change of input field.
   */
  const handleChange = (ev) => {
    let name = ev.target.name;
    let value = ev.target.value;

    setUser((prevState) => {
      return { ...prevState, [name]: value };
    });
    console.log("yay");
  };

  /**
   * Handles the user login upon form submission.
   *
   * @function
   */
  const handleLogIn = () => {
    userAuth.signInUser(user);
  };

  return (
    <>
      <div className="flex flex-row justify-center h-[100vh] bg-fill-bg">
        <div className="relative flex flex-col justify-start p-[2rem] pt-[5rem] min-w-[30%]">
          <button
            className="absolute top-[1rem] left-[1rem] z-[100]"
            onClick={() => navigate("/")}
          >
            <ChevronLeftIcon className="closebtn" />
          </button>
          <div className="flex flex-row justify-center w-[100%] pb-[2rem] lg:pb-[3rem]">
            <div className=" w-[40%]">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/rocketacad-trade.appspot.com/o/Eclipse.png?alt=media&token=bbac184e-bf72-4437-9b86-bb4c63ab6297&_gl=1*lljaf*_ga*MTc3MTA5OTgxNC4xNjk2OTI0NDgx*_ga_CW55HF8NVT*MTY5NjkyNDQ4MC4xLjEuMTY5NjkyNDYwMS4zMC4wLjA."
                alt="moontrade logo"
              />
            </div>
          </div>
          <p className="text-[#5D5FEF] font-bold pb-[1rem]">Log In</p>
          <form className="flex flex-col justify-between  h-[80vh] ">
            <div>
              <label className="text-sm font-semibold lg:text-[1rem] leading-[2rem] lg:leading-[2rem]">
                Email
              </label>
              <br />
              <input
                type="text"
                name="email"
                onChange={handleChange}
                value={user.email}
                autoComplete="off"
                placeholder="Insert your registered email"
                className=" w-full h-[2rem] lg:h-[2.5rem] rounded-md border border-slate-400 bg-white/5  text-txtcolor-secondary shadow-sm ring-1 ring-inset ring-white/10  focus:ring-indigo-500 text-[1rem] mb-[1rem] "
              />
              <br />

              <label className="text-sm font-semibold lg:text-[1rem] leading-[2rem] lg:leading-[2rem]">
                Password
              </label>
              <br />
              <input
                type="password"
                name="password"
                onChange={handleChange}
                value={user.password}
                autoComplete="off"
                placeholder="Insert your passsword"
                className=" w-full h-[2rem] lg:h-[2.5rem] rounded-md border border-slate-400 bg-white/5  text-txtcolor-secondary shadow-sm ring-1 ring-inset ring-white/10  focus:ring-indigo-500 text-[1rem] "
              />
            </div>
            <div className="">
              <input
                type="button"
                onClick={handleLogIn}
                value="LOG IN"
                className="primary-cta-btn"
              />
              <input
                type="button"
                onClick={() => navigate("/newsignup")}
                value="NEW USER?"
                className="neutral-btn-one"
              />
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
