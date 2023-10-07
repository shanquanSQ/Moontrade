import {
  Box,
  Center,
  VStack,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

export const Trade = () => {
  const navigate = useNavigate();

  const handleLogIn = () => {
    // useAuth().login(user);  // Why does this not work?
    // authUser.login(user);
    navigate("home");
  };

  return (
    <>
      <Center>
        <VStack>
          <div>This is the Login Page</div>

          <InputGroup size="sm">
            <InputLeftAddon children="Email" />
            <Input variant="outline" placeholder="Outline" />
          </InputGroup>

          <InputGroup size="sm">
            <InputLeftAddon children="Password" />
            <Input variant="outline" placeholder="Outline" />
          </InputGroup>

          <input type="button" onClick={handleLogIn} value="Log In" />
        </VStack>
      </Center>
    </>
  );
};
