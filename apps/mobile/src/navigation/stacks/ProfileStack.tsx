import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import EditProfileScreen from '@/screens/profile/EditProfileScreen';
import DatingProfileEditScreen from '@/screens/profile/DatingProfileEditScreen';
import DatingFilterScreen from '@/screens/profile/DatingFilterScreen';
import MyEventsScreen from '@/screens/profile/MyEventsScreen';
import NotificationsScreen from '@/screens/profile/NotificationsScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  DatingProfileEdit: undefined;
  DatingFilter: undefined;
  MyEvents: undefined;
  FriendsList: undefined;
  Notifications: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="DatingProfileEdit" component={DatingProfileEditScreen} />
      <Stack.Screen name="DatingFilter" component={DatingFilterScreen} />
      <Stack.Screen name="MyEvents" component={MyEventsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
