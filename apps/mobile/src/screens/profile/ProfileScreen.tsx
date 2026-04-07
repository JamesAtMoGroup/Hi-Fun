import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProfileHeader from '@/components/ProfileHeader';
import MenuListItem from '@/components/MenuListItem';
import type { ProfileStackParamList } from '@/navigation/stacks/ProfileStack';

type Nav = NativeStackNavigationProp<ProfileStackParamList>;

const MOCK_USER = {
  displayName: 'Alex Chen',
  bio: 'Living for the weekend vibes',
  avatarUrl: undefined,
  eventsAttended: 42,
  friendCount: 128,
  eventsWantToGo: 7,
};

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();

  const menuItems = [
    { label: t('profile.myEvents'), screen: 'MyEvents' as const },
    { label: t('profile.friends'), screen: 'FriendsList' as const },
    { label: t('profile.datingProfile'), screen: 'DatingProfileEdit' as const },
    { label: t('profile.datingFilters'), screen: 'DatingFilter' as const },
    {
      label: t('profile.notifications'),
      screen: 'Notifications' as const,
      badge: 3,
    },
    { label: t('profile.settings'), screen: 'Settings' as const },
  ];

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Editable profile header area */}
        <TouchableOpacity
          className="absolute right-4 top-4 z-10"
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Text className="text-purple-600 text-sm font-medium">
            {t('common.edit')}
          </Text>
        </TouchableOpacity>

        <ProfileHeader
          avatarUrl={MOCK_USER.avatarUrl}
          displayName={MOCK_USER.displayName}
          bio={MOCK_USER.bio}
          eventsAttended={MOCK_USER.eventsAttended}
          friendCount={MOCK_USER.friendCount}
          eventsWantToGo={MOCK_USER.eventsWantToGo}
        />

        <View className="mt-4">
          {menuItems.map((item) => (
            <MenuListItem
              key={item.screen}
              label={item.label}
              badgeCount={(item as any).badge}
              onPress={() => navigation.navigate(item.screen as any)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
