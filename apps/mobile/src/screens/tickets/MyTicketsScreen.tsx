import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import SegmentedControl from '@/components/SegmentedControl';
import type { TicketsStackParamList } from '@/navigation/stacks/TicketsStack';

type Nav = NativeStackNavigationProp<TicketsStackParamList>;

interface MockTicket {
  id: string;
  eventTitle: string;
  venueName: string;
  date: string;
  coverImageUrl: string;
  status: 'valid' | 'used';
}

const MOCK_UPCOMING: MockTicket[] = [
  {
    id: 't1',
    eventTitle: 'Neon Nights Party',
    venueName: 'Club OMNI',
    date: '2026-04-12T21:00:00',
    coverImageUrl: '',
    status: 'valid',
  },
  {
    id: 't2',
    eventTitle: 'Taipei Pride After Party',
    venueName: 'Triangle',
    date: '2026-04-15T22:00:00',
    coverImageUrl: '',
    status: 'valid',
  },
  {
    id: 't3',
    eventTitle: 'Rooftop Beats',
    venueName: 'W Hotel Taipei',
    date: '2026-04-18T19:00:00',
    coverImageUrl: '',
    status: 'valid',
  },
];

const MOCK_PAST: MockTicket[] = [
  {
    id: 't4',
    eventTitle: 'New Year Countdown',
    venueName: 'Taipei 101',
    date: '2025-12-31T22:00:00',
    coverImageUrl: '',
    status: 'used',
  },
  {
    id: 't5',
    eventTitle: 'Winter Wonderland',
    venueName: 'ATT Show Box',
    date: '2025-12-20T20:00:00',
    coverImageUrl: '',
    status: 'used',
  },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function MyTicketsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const [activeIndex, setActiveIndex] = useState(0);

  const segments = [t('tickets.upcoming'), t('tickets.past')];
  const tickets = activeIndex === 0 ? MOCK_UPCOMING : MOCK_PAST;

  const renderTicket = ({ item }: { item: MockTicket }) => (
    <TouchableOpacity
      className="mx-4 mb-4 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
      onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
    >
      {/* Cover image placeholder */}
      <View className="h-36 bg-purple-100 items-center justify-center">
        <Text className="text-purple-600 text-3xl font-bold">
          {item.eventTitle.charAt(0)}
        </Text>
      </View>
      <View className="p-4">
        <Text className="text-base font-semibold text-gray-900" numberOfLines={1}>
          {item.eventTitle}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{formatDate(item.date)}</Text>
        <Text className="text-sm text-gray-400 mt-0.5">{item.venueName}</Text>
        <View className="flex-row items-center justify-between mt-3">
          <View
            className={`px-3 py-1 rounded-full ${
              item.status === 'valid' ? 'bg-green-100' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                item.status === 'valid' ? 'text-green-700' : 'text-gray-500'
              }`}
            >
              {t(`tickets.${item.status}`)}
            </Text>
          </View>
          {item.status === 'valid' && (
            <TouchableOpacity
              className="bg-purple-600 px-4 py-2 rounded-lg"
              onPress={() =>
                navigation.navigate('TicketDetail', { ticketId: item.id })
              }
            >
              <Text className="text-white text-sm font-semibold">
                {t('tickets.showQR')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-white">
      <View className="flex-row items-center justify-between px-4 pt-6 pb-2">
        <Text className="text-xl font-bold text-gray-900">
          {t('tickets.myTickets')}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
          <Text className="text-purple-600 text-sm font-medium">
            {t('tickets.orderHistory')}
          </Text>
        </TouchableOpacity>
      </View>
      <SegmentedControl
        segments={segments}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
      <FlatList
        data={tickets}
        keyExtractor={(item) => item.id}
        renderItem={renderTicket}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
      />
    </View>
  );
}
