import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import NotificationItem from '@/components/NotificationItem';
import type { Notification } from '@fomo/shared/src/types';

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    userId: 'u1',
    type: 'event_reminder',
    title: 'Event Starting Soon',
    body: 'Neon Nights Party starts in 2 hours!',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString(),
  },
  {
    id: '2',
    userId: 'u1',
    type: 'friend_going',
    title: 'Friend Update',
    body: 'Jamie is attending Rooftop Beats this Saturday',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: '3',
    userId: 'u1',
    type: 'hot_tonight',
    title: 'Hot Tonight',
    body: '5 trending events near you right now!',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
  },
  {
    id: '4',
    userId: 'u1',
    type: 'ticket_confirmed',
    title: 'Ticket Confirmed',
    body: 'Your ticket for Taipei Pride After Party is confirmed.',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
  {
    id: '5',
    userId: 'u1',
    type: 'promotion',
    title: 'Special Offer',
    body: '20% off VIP tickets for Summer Music Festival!',
    isRead: true,
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
  },
  {
    id: '6',
    userId: 'u1',
    type: 'friend_going',
    title: 'Friend Update',
    body: 'Chris and 3 others are interested in Art Basel Taipei',
    isRead: true,
    createdAt: new Date(Date.now() - 72 * 3600000).toISOString(),
  },
  {
    id: '7',
    userId: 'u1',
    type: 'event_reminder',
    title: 'Don\'t Forget!',
    body: 'Food & Wine Festival is tomorrow',
    isRead: true,
    createdAt: new Date(Date.now() - 96 * 3600000).toISOString(),
  },
  {
    id: '8',
    userId: 'u1',
    type: 'hot_tonight',
    title: 'Weekend Picks',
    body: 'Check out the hottest events this weekend!',
    isRead: true,
    createdAt: new Date(Date.now() - 120 * 3600000).toISOString(),
  },
];

export default function NotificationsScreen() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pt-6 pb-2">
        <Text className="text-xl font-bold text-gray-900">
          {t('notifications.title')}
        </Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text className="text-purple-600 text-sm font-medium">
            {t('notifications.markAllRead')}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={markAsRead} />
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
