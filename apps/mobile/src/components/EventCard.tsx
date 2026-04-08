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
      activeOpacity={0.85}
      className={`overflow-hidden rounded-2xl bg-surface border border-border ${
        isHorizontal ? 'mr-4 w-72' : 'mb-5 w-full'
      }`}
    >
      {/* Cover Image */}
      <View className={isHorizontal ? 'h-40' : 'h-52'}>
        <Image
          source={{ uri: event.coverImageUrl }}
          className="h-full w-full"
          resizeMode="cover"
        />
        {/* Dark gradient overlay for text readability */}
        <View className="absolute inset-0 bg-background opacity-20" />

        {event.isPromoted && (
          <View className="absolute left-3 top-3 rounded-full bg-neon-yellow px-3 py-1">
            <Text className="text-[10px] font-bold uppercase tracking-wide text-background">
              ✨ {t('event.promoted', 'Promoted')}
            </Text>
          </View>
        )}
        <View className="absolute bottom-3 right-3">
          <PriceTag isFree={event.isFree} priceRange={event.priceRange} />
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        <Text className="text-base font-bold text-white" numberOfLines={1}>
          {event.title}
        </Text>
        <View className="mt-2 flex-row items-center">
          <Text className="text-xs text-neon-cyan">🕐</Text>
          <Text className="ml-1 text-xs font-medium text-text-secondary">
            {formatDateTime(event.startTime)}
          </Text>
        </View>
        <View className="mt-1 flex-row items-center">
          <Text className="text-xs text-text-muted">📍</Text>
          <Text className="ml-1 flex-1 text-xs text-text-muted" numberOfLines={1}>
            {event.venueName}
          </Text>
        </View>

        {event.friendsGoing && event.friendsGoing.length > 0 && (
          <View className="mt-3 flex-row items-center rounded-full bg-surface-elevated px-3 py-1.5 self-start">
            <FriendAvatarStack friends={event.friendsGoing} size={20} />
            <Text className="ml-2 text-xs font-semibold text-neon-green">
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
