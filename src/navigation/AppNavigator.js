import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import EmergencyInstructionsScreen from '../screens/EmergencyInstructionsScreen';
import LocationShareScreen from '../screens/LocationShareScreen';
import MedicalInfoScreen from '../screens/MedicalInfoScreen';
import DoctorConnectionScreen from '../screens/DoctorConnectionScreen';
import AuthScreen from '../screens/AuthScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CommunityScreen from '../screens/CommunityScreen';
import AiScreen from '../screens/AiScreen';
import SplashScreen from '../screens/SplashScreen';
import PermissionsLocationScreen from '../screens/PermissionsLocationScreen';
import PermissionsCallsScreen from '../screens/PermissionsCallsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="PermissionsLocation" component={PermissionsLocationScreen} />
        <Stack.Screen name="PermissionsCalls" component={PermissionsCallsScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EmergencyInstructions" component={EmergencyInstructionsScreen} />
        <Stack.Screen name="LocationShare" component={LocationShareScreen} />
        <Stack.Screen name="MedicalInfo" component={MedicalInfoScreen} />
        <Stack.Screen name="DoctorConnection" component={DoctorConnectionScreen} />
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
              <Stack.Screen 
                  name="AiScreen" 
                  component={AiScreen} 
                  options={{ 
                    title: "الحفاظ على اصحة",
                    headerShown: false
                  }} 
                />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
