import { Box, Flex, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { RegisterForm } from '../components/RegisterForm';

export const LoginPage = () => {
  return (
    <Flex justifyContent="center" align="center" bg="blue.900" h="100vh">
      <Box bg="blue.800" w="500px" p={3} boxShadow="lg" borderRadius="lg">
        <Tabs variant="soft-rounded" isFitted>
          <TabList mx={4}>
            <Tab fontWeight={'bold'} color="blue.100" _focus={{ boxShadow: 0 }}>
              Login
            </Tab>
            <Tab fontWeight={'bold'} color="blue.100" _focus={{ boxShadow: 0 }}>
              Register
            </Tab>
            {/* <Tab fontWeight={'bold'} color="blue.100" _focus={{ boxShadow: 0 }}>
              Forgot Password
            </Tab> */}
          </TabList>
          <TabPanels>
            <TabPanel>
              <LoginForm />
            </TabPanel>
            <TabPanel>
              <RegisterForm />
            </TabPanel>
            {/* <TabPanel></TabPanel> */}
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};
