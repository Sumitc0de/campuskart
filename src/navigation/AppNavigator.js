import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import MainTabNavigator from './MainTabNavigator';
import SellItemScreen from '../screens/SellItemScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SellerProfileScreen from '../screens/SellerProfileScreen';
import MessageDetailScreen from '../screens/MessageDetailScreen';
import BidDetailsScreen from '../screens/BidDetailsScreen';
import ManageListingsScreen from '../screens/ManageListingsScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#f5f7f9' },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen 
        name="SellItem" 
        component={SellItemScreen} 
        options={{ 
          presentation: 'modal',
          animation: 'slide_from_bottom' 
        }} 
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen} 
      />
      <Stack.Screen 
        name="SellerProfile" 
        component={SellerProfileScreen} 
      />
      <Stack.Screen 
        name="MessageDetail" 
        component={MessageDetailScreen} 
      />
      <Stack.Screen 
        name="BidDetails" 
        component={BidDetailsScreen} 
      />
      <Stack.Screen 
        name="ManageListings" 
        component={ManageListingsScreen} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
