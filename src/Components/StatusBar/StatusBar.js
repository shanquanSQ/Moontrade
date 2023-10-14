import { useState, React, useEffect } from "react";
import {
  QuestionMarkCircleIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/solid";
import "./StatusBar.css";

import { toggleTheme } from "../../util/themeUtility";

export const StatusBar = () => {
  const [themeMode, setThemeMode] = useState(false);

  const handleToggleTheme = () => {
    setThemeMode(!themeMode);
    toggleTheme();
  };

  const LOGO_SMALL =
    "https://firebasestorage.googleapis.com/v0/b/rocketacad-trade.appspot.com/o/Eclipse_Small.png?alt=media&token=de179950-fb94-4412-9409-3544d84702a5&_gl=1*1qlk5zl*_ga*MTc3MTA5OTgxNC4xNjk2OTI0NDgx*_ga_CW55HF8NVT*MTY5NzE2ODY4Ny4xNi4xLjE2OTcxNjk1OTUuNDIuMC4w";

  return (
    <>
      <div className="flex flex-row justify-end gap-[1rem] lg:gap-[2rem] max-w-[98vw] pt-[.9rem] px-[5%] lg:px-[35%] overflow-hidden">
        <button className="theme-btn" onClick={handleToggleTheme}>
          {themeMode ? <SunIcon /> : <MoonIcon />}
        </button>
        <button onClick={() => console.log("clicked")}>
          <QuestionMarkCircleIcon className="supportbtn" />
        </button>
        <div className=" w-[2rem] lg:w-[2rem] pt-[.1rem] ">
          <img src={LOGO_SMALL} alt="moontrade logo" />
        </div>
      </div>
    </>
  );
};
