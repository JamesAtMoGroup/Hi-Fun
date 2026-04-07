import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { Notification } from '@fomo/shared/src/types';

const TYPE_ICONS: Record<Notification['type'], string> = {
  event_reminder: 'R',
  friend_going: 'F',
  hot_tonight: 'H',
  ticket_confirmed: 'T',
  promotion: 'P',
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface NotificationItemProps {
  notification: Notification;
  onPress: (id: string) => void;
}

export default function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  return (
    <TouchableOpacity
      className={`flex-row px-4 py-3 border-b border-gray-100 ${
        notification.isRead ? 'bg-white' : 'bg-purple-50'
      }`}
      onPress={() => onPress(notification.id)}
    >
      <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
        <Text className="text-purple-600 font-bold">
          {TYPE_ICONS[notification.type]}
        </Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-gray-900">
          {notification.title}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          {notification.body}
        </Text>
      </View>
      <Text className="text-xs text-gray-400 ml-2">
        {timeAgo(notification.createdAt)}
      </Text>
    </TouchableOpacity>
  );
}
