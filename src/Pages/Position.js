import {
  Box,
  Center,
  VStack,
  Input,
  InputGroup,
  InputLeftAddon,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";

export const Position = () => {
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
          <div>This is the Position Page</div>
        </VStack>
      </Center>
    </>
  );
};
