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
    <div className="structure">
      <div className="contentcontainer">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold leading-6 text-white">
            User Profile
          </h1>
        </div>
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
