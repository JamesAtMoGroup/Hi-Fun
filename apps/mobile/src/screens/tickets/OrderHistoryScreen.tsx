import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useTranslation } from 'react-i18next';

interface MockOrder {
  id: string;
  eventName: string;
  date: string;
  totalAmount: number;
  currency: string;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
}

const MOCK_ORDERS: MockOrder[] = [
  {
    id: 'o1',
    eventName: 'Neon Nights Party',
    date: '2026-03-28T14:30:00',
    totalAmount: 1500,
    currency: 'TWD',
    paymentStatus: 'paid',
  },
  {
    id: 'o2',
    eventName: 'Taipei Pride After Party',
    date: '2026-03-20T10:00:00',
    totalAmount: 800,
    currency: 'TWD',
    paymentStatus: 'paid',
  },
  {
    id: 'o3',
    eventName: 'New Year Countdown',
    date: '2025-12-15T16:45:00',
    totalAmount: 2000,
    currency: 'TWD',
    paymentStatus: 'paid',
  },
  {
    id: 'o4',
    eventName: 'Summer Music Festival',
    date: '2025-06-01T09:00:00',
    totalAmount: 3500,
    currency: 'TWD',
    paymentStatus: 'refunded',
  },
];

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  paid: { bg: 'bg-green-100', text: 'text-green-700' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  failed: { bg: 'bg-red-100', text: 'text-red-700' },
  refunded: { bg: 'bg-gray-100', text: 'text-gray-500' },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

export default function OrderHistoryScreen() {
  const { t } = useTranslation();

  const renderOrder = ({ item }: { item: MockOrder }) => {
    const style = STATUS_STYLES[item.paymentStatus] || STATUS_STYLES.paid;
    return (
      <View className="mx-4 mb-3 bg-white rounded-xl border border-gray-100 p-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-3">
            <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
              {item.eventName}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">
              {formatDate(item.date)}
            </Text>
          </View>
          <Text className="text-base font-bold text-gray-900">
            ${item.totalAmount}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mt-3">
          <Text className="text-xs text-gray-400">{item.currency}</Text>
          <View className={`px-3 py-1 rounded-full ${style.bg}`}>
            <Text className={`text-xs font-medium ${style.text}`}>
              {t(`tickets.${item.paymentStatus}`)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <Text className="text-xl font-bold text-gray-900 px-4 pt-6 pb-4">
        {t('tickets.orderHistory')}
      </Text>
      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
