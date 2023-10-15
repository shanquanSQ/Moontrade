import { useNavigate } from "react-router-dom";
import { useAuth } from "../util/auth.js";
import { useEffect } from "react";

/**
 * The landing page component provides an interface for navigation to either the login
 * page for existing users or the signup page for new users.
 *
 * @component
 * @returns {ReactElement} The rendered component.
 */
export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-row justify-center h-[100vh] bg-fill-bg">
        <div className="flex flex-col justify-between  p-[2rem] pt-[7rem] min-w-[30%]  ">
          <div className="flex flex-row justify-center w-[100%]  ">
            <div className="relative left-[-25%] w-[40%]">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/rocketacad-trade.appspot.com/o/Eclipse.png?alt=media&token=bbac184e-bf72-4437-9b86-bb4c63ab6297&_gl=1*lljaf*_ga*MTc3MTA5OTgxNC4xNjk2OTI0NDgx*_ga_CW55HF8NVT*MTY5NjkyNDQ4MC4xLjEuMTY5NjkyNDYwMS4zMC4wLjA."
                alt="moontrade logo"
              />
              <div className="relative top-[-45%] left-[40%] lg:left-[40%] text-center moontradelogo-primary">
                moontrade
              </div>
            </div>
          </div>

          <div className=" text-center">
            <input
              type="button"
              onClick={() => navigate("login")}
              value="EXISTING USER"
              className="primary-cta-btn"
            />
            <br />
            <input
              type="button"
              onClick={() => navigate("newsignup")}
              value="NEW USER"
              className="secondary-cta-btn"
            />
          </div>
        </div>
      </div>
    </>
  );
};
