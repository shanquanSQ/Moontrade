import { useNavigate } from "react-router-dom";

export const PositionPage = () => {
  const navigate = useNavigate();

  const handleLogIn = () => {
    // useAuth().login(user);  // Why does this not work?
    // authUser.login(user);
    navigate("home");
  };

  return (
    <>
      <div>Portfolio Page</div>
    </>
  );
};
