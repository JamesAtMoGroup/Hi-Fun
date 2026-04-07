import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import HomeStack from './stacks/HomeStack';
import DiscoverStack from './stacks/DiscoverStack';
import TicketsStack from './stacks/TicketsStack';
import ProfileStack from './stacks/ProfileStack';
import MapScreen from '@/screens/map/MapScreen';
import { colors } from '@/theme';

export type MainTabsParamList = {
  HomeTab: undefined;
  MapTab: undefined;
  DiscoverTab: undefined;
  TicketsTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabsParamList>();

export default function MainTabs() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color, size }) =>
            // Placeholder icon — replace with actual icon library
            undefined as any,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{
          tabBarLabel: t('tabs.map'),
          tabBarIcon: ({ color, size }) => undefined as any,
        }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverStack}
        options={{
          tabBarLabel: t('tabs.discover'),
          tabBarIcon: ({ color, size }) => undefined as any,
        }}
      />
      <Tab.Screen
        name="TicketsTab"
        component={TicketsStack}
        options={{
          tabBarLabel: t('tabs.tickets'),
          tabBarIcon: ({ color, size }) => undefined as any,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => undefined as any,
        }}
      />
    </Tab.Navigator>
  );
}
