import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/stacks/HomeStack';
import type { EventSummary } from '@fomo/shared/src/types';
import PriceTag from './PriceTag';
import FriendAvatarStack from './FriendAvatarStack';

interface EventCardProps {
  event: EventSummary;
  variant?: 'horizontal' | 'vertical';
}

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export default function EventCard({ event, variant = 'horizontal' }: EventCardProps) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { t } = useTranslation();

  const isHorizontal = variant === 'horizontal';

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.8}
      className={`overflow-hidden rounded-2xl bg-white shadow-sm ${
        isHorizontal ? 'mr-4 w-72' : 'mb-4 w-full'
      }`}
    >
      {/* Cover Image */}
      <View className={isHorizontal ? 'h-36' : 'h-48'}>
        <Image
          source={{ uri: event.coverImageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {event.isPromoted && (
          <View className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5">
            <Text className="text-xs font-bold text-amber-900">
              {t('event.promoted', 'Promoted')}
            </Text>
          </View>
        )}
        <View className="absolute bottom-2 right-2">
          <PriceTag isFree={event.isFree} priceRange={event.priceRange} />
        </View>
      </View>

      {/* Content */}
      <View className="p-3">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="mt-1 text-xs text-gray-500">
          {formatDateTime(event.startTime)}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
          {event.venueName}
        </Text>

        {event.friendsGoing && event.friendsGoing.length > 0 && (
          <View className="mt-2 flex-row items-center">
            <FriendAvatarStack friends={event.friendsGoing} size={22} />
            <Text className="ml-1 text-xs text-gray-500">
              {t('event.friendsGoing', '{{count}} friends going', {
                count: event.friendsGoing.length,
              })}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
