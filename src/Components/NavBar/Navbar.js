import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

import {
  ChartBarSquareIcon,
  BuildingLibraryIcon,
  UserCircleIcon,
} from "@heroicons/react/24/solid";

export const Navbar = () => {
  return (
    <nav>
      <NavLink to="markets">
        <div>
          <ChartBarSquareIcon className="h-6 w-6" />
        </div>
      </NavLink>

      <NavLink to="portfolio">
        <div>
          <BuildingLibraryIcon className="h-6 w-6" />
        </div>
      </NavLink>

      <NavLink to="user">
        <div>
          <UserCircleIcon className="h-6 w-6" />
        </div>
      </NavLink>
    </nav>
  );
};
