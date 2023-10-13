import { useState, React } from "react";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import "./StatusBar.css";

export const StatusBar = () => {
  const [themeMode, setThemeMode] = useState(false);

  const handleToggleTheme = () => {
    setThemeMode(!themeMode);
    // This needs to affect context provider.
    // Maybe create a Theme provider.
  };

  const LOGO_SMALL =
    "https://firebasestorage.googleapis.com/v0/b/rocketacad-trade.appspot.com/o/Eclipse_Small.png?alt=media&token=de179950-fb94-4412-9409-3544d84702a5&_gl=1*1qlk5zl*_ga*MTc3MTA5OTgxNC4xNjk2OTI0NDgx*_ga_CW55HF8NVT*MTY5NzE2ODY4Ny4xNi4xLjE2OTcxNjk1OTUuNDIuMC4w";

  return (
    <>
      <div className="flex flex-row justify-end gap-[1rem] w-[100vw] h-[4rem] pt-[1.2rem] px-[5%] lg:px-[35%] overflow-hidden ">
        <input
          type="button"
          className="theme-btn"
          value={themeMode ? "Light" : "Dark"}
          onClick={handleToggleTheme}
        />
        <QuestionMarkCircleIcon className="supportbtn" />
        <div className=" w-[1.3rem] pt-[.1rem]">
          <img src={LOGO_SMALL} alt="moontrade logo" />
        </div>
      </div>
    </>
  );
};
