import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import CitizenDashboard from './src/screens/CitizenDashboard';
import ReportScreen from './src/screens/ReportScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import VolunteerDashboard from './src/screens/VolunteerDashboard';
import VolunteerEvents from './src/screens/VolunteerEvents';
import VehicleRegistration from './src/screens/VehicleRegistration';
import AwarenessScreen from './src/screens/AwarenessScreen';
import AuthorityDashboard from './src/screens/AuthorityDashboard';
import ReviewedReportsScreen from './src/screens/ReviewedReportsScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import ManageEventsScreen from './src/screens/ManageEventsScreen';
import DonationScreen from './src/screens/DonationScreen';
import EmergencyRequestScreen from './src/screens/EmergencyRequestScreen';
import EmergencyStatusScreen from './src/screens/EmergencyStatusScreen';
import EmergencyManagementScreen from './src/screens/EmergencyManagementScreen';
import LocateWasteScreen from './src/screens/LocateWasteScreen';
import AdminDashboard from './src/screens/AdminDashboard';

const Stack = createNativeStackNavigator();

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2E7D32', // Green for cleanliness/environment
    secondary: '#1B5E20',
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
          <Stack.Screen
            name="CitizenDashboard"
            component={CitizenDashboard}
            options={{ title: 'Madurai Smart Clean', headerLeft: () => null }}
          />
          <Stack.Screen
            name="AuthorityDashboard"
            component={AuthorityDashboard}
            options={{ title: 'Authority Panel', headerLeft: () => null }}
          />
          <Stack.Screen
            name="ReviewedReports"
            component={ReviewedReportsScreen}
            options={{ title: 'Cleanup History' }}
          />
          <Stack.Screen
            name="Report"
            component={ReportScreen}
            options={{ title: 'Report Garbage' }}
          />
          <Stack.Screen
            name="MyReports"
            component={MyReportsScreen}
            options={{ title: 'My Report History' }}
          />
          <Stack.Screen
            name="VolunteerDashboard"
            component={VolunteerDashboard}
            options={{ title: 'Volunteer Hub' }}
          />
          <Stack.Screen
            name="VolunteerEvents"
            component={VolunteerEvents}
            options={{ title: 'Upcoming Events' }}
          />
          <Stack.Screen
            name="VehicleRegistration"
            component={VehicleRegistration}
            options={{ title: 'Register Vehicle' }}
          />
          <Stack.Screen
            name="Awareness"
            component={AwarenessScreen}
            options={{ title: 'Awareness Center' }}
          />
          <Stack.Screen
            name="Leaderboard"
            component={LeaderboardScreen}
            options={{ title: 'Leaderboard' }}
          />
          <Stack.Screen
            name="ManageEvents"
            component={ManageEventsScreen}
            options={{ title: 'Manage Events' }}
          />
          <Stack.Screen
            name="Donation"
            component={DonationScreen}
            options={{ title: 'Help Madurai (Donate)' }}
          />
          <Stack.Screen
            name="EmergencyRequest"
            component={EmergencyRequestScreen}
            options={{ title: 'Request Assistance' }}
          />
          <Stack.Screen
            name="EmergencyStatus"
            component={EmergencyStatusScreen}
            options={{ title: 'Assistance Status' }}
          />
          <Stack.Screen
            name="EmergencyManagement"
            component={EmergencyManagementScreen}
            options={{ title: 'Manage Help Funds' }}
          />
          <Stack.Screen
            name="LocateWaste"
            component={LocateWasteScreen}
            options={{ title: 'Locate Nearby Waste' }}
          />
          <Stack.Screen
            name="AdminDashboard"
            component={AdminDashboard}
            options={{ title: 'Admin Panel', headerLeft: () => null }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
