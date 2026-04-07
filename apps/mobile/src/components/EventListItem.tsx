import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/stacks/HomeStack';
import type { EventSummary } from '@fomo/shared/src/types';
import PriceTag from './PriceTag';

interface EventListItemProps {
  event: EventSummary;
}

function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export default function EventListItem({ event }: EventListItemProps) {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      activeOpacity={0.7}
      className="mb-2 flex-row items-center rounded-xl bg-white p-3"
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: event.coverImageUrl }}
        className="h-16 w-16 rounded-lg"
        resizeMode="cover"
      />

      {/* Info */}
      <View className="ml-3 flex-1">
        <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
          {event.title}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-500">
          {formatDateTime(event.startTime)}
        </Text>
        <Text className="text-xs text-gray-400" numberOfLines={1}>
          {event.venueName}
        </Text>
      </View>

      {/* Price */}
      <PriceTag isFree={event.isFree} priceRange={event.priceRange} />
    </TouchableOpacity>
  );
}
