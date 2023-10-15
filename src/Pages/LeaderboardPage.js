import React, { useState, useEffect } from "react";
import {
  getDatabase,
  ref,
  onValue,
  query,
  orderByChild,
} from "@firebase/database";
import { Link } from "react-router-dom";

/**
 * `LeaderboardPage` Component - Displays a leaderboard of users based on their realized P&L.
 *
 * @component
 * @returns {ReactElement} JSX that renders into leaderboard of users.
 */
export const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = query(ref(db, "users"), orderByChild("realizedPnL"));

    /**
     * Snapshot value event listener.
     *
     * Retrieves and organizes user data from the snapshot and updates state.
     *
     * @param {object} snapshot - Firebase snapshot object.
     */
    onValue(usersRef, (snapshot) => {
      const usersData = [];
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData && typeof userData.realizedPnL === "number") {
          usersData.unshift({
            ...userData,
            id: childSnapshot.key,
            // Using displayName or 'anon' if displayName doesn't exist
            displayName: userData.displayName || "anon",
          });
        } else {
          console.warn(
            `User ${childSnapshot.key} has invalid or undefined realizedPnL.`,
            userData
          );
        }
      });
      setUsers(usersData);
    });
  }, []);

  return (
    <div className="structure">
      <div className="contentcontainer">
        <div className="titlestructure">
          <h1 className="titleheading">Leaderboard</h1>
        </div>

        <div className="sm:flex sm:items-center pb-6">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-txtcolor-primary">
              Leaderboard with all users{" "}
            </h1>
            <p className="mt-2 text-sm text-txtcolor-secondary">
              View Rankings based on P&L{" "}
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link to="/portfolio" className="primary-cta-btn">
              View Portfolio
            </Link>
          </div>
        </div>

        <div className="table-responsive bg-gray text-black rounded-md">
          <table className="w-full border-collapse bg-white">
            <thead>
              <tr className="text-gray-800">
                <th className="py-2 px-4 border-b">Rank</th>
                <th className="py-2 px-4 border-b">User</th>
                <th className="py-2 px-4 border-b">Realized P&L</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="py-2 px-4">{index + 1}</td>
                  <td className="py-2 px-4">{user.displayName}</td>
                  <td className="py-2 px-4">
                    ${user.realizedPnL ? user.realizedPnL.toFixed(2) : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
