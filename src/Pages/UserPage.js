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
    <>
      <div>User Profile Goes here</div>
      <div>
        {/* Welcome{" "} */}
        {userAuth.isLoggedIn === false ? "Anonymous" : userAuth.user.email}
      </div>
      <input
        type="button"
        onClick={userAuth.signOutUser}
        value="Log Out"
        className="btn btn-neutral btn-sm"
      />
    </>
  );
};
