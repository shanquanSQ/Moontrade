import { useNavigate } from "react-router-dom";

export const TradePage = () => {
  const navigate = useNavigate();

  const handleLogIn = () => {
    // useAuth().login(user);  // Why does this not work?
    // authUser.login(user);
    navigate("home");
  };

  return (
    <>
      <div>Trade Page</div>
    </>
  );
};
