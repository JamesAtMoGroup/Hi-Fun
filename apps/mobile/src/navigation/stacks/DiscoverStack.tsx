import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen from '@/screens/discover/DiscoverScreen';
import PersonDetailScreen from '@/screens/discover/PersonDetailScreen';
import DatingFilterModal from '@/screens/discover/DatingFilterModal';

export type DiscoverStackParamList = {
  Discover: undefined;
  PersonDetail: { userId: string };
  DatingFilter: undefined;
};

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="PersonDetail" component={PersonDetailScreen} />
      <Stack.Screen
        name="DatingFilter"
        component={DatingFilterModal}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
