import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTranslation } from 'react-i18next';

interface ProfileHeaderProps {
  avatarUrl?: string;
  displayName: string;
  bio?: string;
  eventsAttended: number;
  friendCount: number;
  eventsWantToGo: number;
}

export default function ProfileHeader({
  avatarUrl,
  displayName,
  bio,
  eventsAttended,
  friendCount,
  eventsWantToGo,
}: ProfileHeaderProps) {
  const { t } = useTranslation();

  return (
    <View className="items-center px-6 pt-6 pb-4">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          className="w-24 h-24 rounded-full bg-gray-200"
        />
      ) : (
        <View className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center">
          <Text className="text-3xl text-purple-600">
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}
      <Text className="text-xl font-bold text-gray-900 mt-3">
        {displayName}
      </Text>
      {bio ? (
        <Text className="text-sm text-gray-500 mt-1 text-center">{bio}</Text>
      ) : null}

      <View className="flex-row mt-4 w-full justify-around">
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">
            {eventsAttended}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('profile.eventsAttended')}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">
            {friendCount}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('profile.friends')}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-lg font-bold text-gray-900">
            {eventsWantToGo}
          </Text>
          <Text className="text-xs text-gray-500">
            {t('profile.wantToGo')}
          </Text>
        </View>
      </View>
    </View>
  );
}
