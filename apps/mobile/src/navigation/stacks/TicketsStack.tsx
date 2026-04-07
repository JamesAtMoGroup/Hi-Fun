import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyTicketsScreen from '@/screens/tickets/MyTicketsScreen';
import TicketDetailScreen from '@/screens/tickets/TicketDetailScreen';
import OrderHistoryScreen from '@/screens/tickets/OrderHistoryScreen';

export type TicketsStackParamList = {
  MyTickets: undefined;
  TicketDetail: { ticketId: string };
  OrderHistory: undefined;
};

const Stack = createNativeStackNavigator<TicketsStackParamList>();

export default function TicketsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MyTickets" component={MyTicketsScreen} />
      <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
    </Stack.Navigator>
  );
}
