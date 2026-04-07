import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '@/screens/home/HomeScreen';
import EventDetailScreen from '@/screens/home/EventDetailScreen';
import SearchScreen from '@/screens/home/SearchScreen';
import CategoryListScreen from '@/screens/home/CategoryListScreen';

export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { eventId: string };
  Search: undefined;
  CategoryList: { category: string };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="CategoryList" component={CategoryListScreen} />
    </Stack.Navigator>
  );
}
