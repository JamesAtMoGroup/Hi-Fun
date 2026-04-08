import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DiscoverPerson } from '@fomo/shared/src/types';
import RoleBadge from './RoleBadge';

interface PersonCardProps {
  person: DiscoverPerson;
  onPress: (person: DiscoverPerson) => void;
}

export default function PersonCard({ person, onPress }: PersonCardProps) {
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      onPress={() => onPress(person)}
      activeOpacity={0.85}
      className="mb-4 overflow-hidden rounded-2xl bg-background shadow-sm"
    >
      {/* Large Photo */}
      <View className="relative h-[300px] w-full">
        <Image
          source={{ uri: person.photos[0] }}
          className="h-full w-full"
          resizeMode="cover"
        />

        {/* Overlay gradient info */}
        <View className="absolute bottom-0 left-0 right-0 bg-black/40 px-4 py-3">
          <View className="flex-row items-center">
            <Text className="mr-2 text-xl font-bold text-white">
              {person.displayName}, {person.age}
            </Text>
            <RoleBadge role={person.role} />
          </View>
          <Text className="mt-1 text-sm text-white/80">
            {person.distance} km {t('discover.away', 'away')}
          </Text>
        </View>

        {/* Events count badge */}
        {person.sharedEventCount > 0 && (
          <View className="absolute right-3 top-3 rounded-full bg-primary px-2.5 py-1">
            <Text className="text-xs font-bold text-white">
              {person.sharedEventCount} {t('discover.sharedEvents', 'shared events')}
            </Text>
          </View>
        )}
      </View>

      {/* Bio preview */}
      <View className="px-4 py-3">
        <Text className="text-sm text-text-secondary" numberOfLines={2}>
          {person.bio}
        </Text>
        {person.mutualFriendCount > 0 && (
          <Text className="mt-1 text-xs text-primary">
            {t('discover.mutualFriends', '{{count}} mutual friends', {
              count: person.mutualFriendCount,
            })}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
