import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

import { FaChartPie, FaUser, FaHouse } from "react-icons/fa6";

export const Navbar = () => {
  return (
    <nav>
      <NavLink to="markets">
        <div>
          <FaHouse size={25} />
        </div>
      </NavLink>

      <NavLink to="portfolio">
        <div>
          <FaChartPie size={25} />
        </div>
      </NavLink>

      <NavLink to="user">
        <div>
          <FaUser size={25} />
        </div>
      </NavLink>
    </nav>
  );
};
