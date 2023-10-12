import { useAuth } from "../util/auth";

import { useNavigate } from "react-router-dom";

export const UserPage = () => {
  const userAuth = useAuth();

  // check the logs, this will contain all the STATES and FUNCTIONS exported from auth.js as context to app.js (effectively the entire project)
  console.log(userAuth);
  // this is specifically the user information from firebase. It is a Firebase Auth object, not the state called user.
  // console.log(userAuth.user);
  // Hence if we want to get the information of the user, we need: userAuth.user.<key name>
  // console.log(userAuth.user.email);

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen font-sans bg-gray-800 text-white">
      <div className="w-full max-w-6xl px-4 text-center">
        <h1>User Profile</h1>

        <div className="my-4">
          {userAuth.isLoggedIn === false ? "Anonymous" : userAuth.user.email}
        </div>

        <button onClick={userAuth.signOutUser} className="primary-cta-btn mt-4">
          Log Out
        </button>
      </div>
    </div>
  );
};
