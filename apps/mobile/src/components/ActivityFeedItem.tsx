import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FriendActivity } from '@fomo/shared/src/types';

interface ActivityFeedItemProps {
  activity: FriendActivity;
  onEventPress: (eventId: string) => void;
}

const TYPE_LABELS: Record<FriendActivity['type'], string> = {
  attending: 'is attending',
  interested: 'is interested in',
  want_to_go: 'wants to go to',
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function ActivityFeedItem({ activity, onEventPress }: ActivityFeedItemProps) {
  const { t } = useTranslation();
  const actionLabel = t(`activity.${activity.type}`, TYPE_LABELS[activity.type]);

  return (
    <TouchableOpacity
      onPress={() => onEventPress(activity.event.id)}
      activeOpacity={0.7}
      className="flex-row items-center border-b border-gray-100 px-4 py-3"
    >
      {/* Avatar */}
      <Image
        source={{ uri: activity.user.avatarUrl || 'https://picsum.photos/seed/default/100/100' }}
        className="h-10 w-10 rounded-full bg-gray-200"
      />

      {/* Text */}
      <View className="ml-3 flex-1">
        <Text className="text-sm text-gray-900" numberOfLines={2}>
          <Text className="font-semibold">{activity.user.displayName}</Text>
          {' '}{actionLabel}{' '}
          <Text className="font-semibold text-purple-600">{activity.event.title}</Text>
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400">
          {activity.event.venueName} · {timeAgo(activity.createdAt)}
        </Text>
      </View>

      {/* Event thumbnail */}
      <Image
        source={{ uri: activity.event.coverImageUrl }}
        className="ml-2 h-12 w-12 rounded-lg bg-gray-200"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
