import {
  Box,
  Center,
  VStack,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

export const LogInPage = () => {
  const navigate = useNavigate();

  const handleLogIn = () => {
    // useAuth().login(user);  // Why does this not work?
    // authUser.login(user);
    navigate("home");
  };

  return (
    <>
      {/* <Center>
        <VStack> */}
      <div className="flex flex-row justify-center h-[100vh]">
        <div className="flex flex-col justify-center gap-[5rem] p-[2rem] ">
          <div className="text-center">MoonTrade</div>

          <div>
            <InputGroup size="sm">
              <InputLeftAddon children="Email" />
              <Input variant="outline" placeholder="Outline" />
            </InputGroup>

            <InputGroup size="sm">
              <InputLeftAddon children="Password" />
              <Input variant="outline" placeholder="Outline" />
            </InputGroup>
          </div>
          <input
            type="button"
            onClick={handleLogIn}
            value="Log In"
            className="bg-violet-400"
          />
        </div>
      </div>
      {/* </VStack>
      </Center> */}
    </>
  );
};
