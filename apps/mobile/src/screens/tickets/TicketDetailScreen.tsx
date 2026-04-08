import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import TransportButtons from '@/components/TransportButtons';
import type { TicketsStackParamList } from '@/navigation/stacks/TicketsStack';

type Route = RouteProp<TicketsStackParamList, 'TicketDetail'>;

// Mock ticket detail data
const MOCK_TICKET = {
  id: 't1',
  eventTitle: 'Neon Nights Party',
  venueName: 'Club OMNI',
  address: 'No. 123, Xinyi Rd, Taipei',
  date: '2026-04-12T21:00:00',
  ticketType: 'VIP',
  price: 1500,
  currency: 'TWD',
  purchaseDate: '2026-03-28T14:30:00',
  status: 'valid' as const,
  latitude: 25.0330,
  longitude: 121.5654,
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  valid: { bg: 'bg-green-100', text: 'text-green-700' },
  used: { bg: 'bg-surface', text: 'text-text-muted' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700' },
  refunded: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
};

export default function TicketDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<Route>();
  const ticket = MOCK_TICKET;
  const statusStyle = STATUS_STYLES[ticket.status] || STATUS_STYLES.valid;

  return (
    <ScrollView className="flex-1 bg-background">
      {/* Event info summary */}
      <View className="px-6 pt-6 pb-4 border-b border-border-light">
        <Text className="text-xl font-bold text-white">
          {ticket.eventTitle}
        </Text>
        <Text className="text-sm text-text-muted mt-1">
          {formatDate(ticket.date)}
        </Text>
        <Text className="text-sm text-text-muted mt-0.5">
          {ticket.venueName} - {ticket.address}
        </Text>
      </View>

      {/* QR Code placeholder */}
      <View className="items-center py-8 px-6">
        <View className="w-64 h-64 border-2 border-dashed border-border rounded-2xl items-center justify-center bg-surface">
          <Text className="text-4xl text-gray-300 mb-2">[ ]</Text>
          <Text className="text-lg font-semibold text-text-muted">
            {t('tickets.qrCode')}
          </Text>
        </View>
        <Text className="text-xs text-text-muted mt-3 text-center">
          {t('tickets.brightnessNote')}
        </Text>
      </View>

      {/* Ticket info */}
      <View className="px-6 py-4 bg-surface mx-4 rounded-xl mb-4">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-text-muted">{t('tickets.ticketType')}</Text>
          <Text className="text-sm font-semibold text-white">
            {ticket.ticketType}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-text-muted">{t('tickets.price')}</Text>
          <Text className="text-sm font-semibold text-white">
            {ticket.currency} ${ticket.price}
          </Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-text-muted">
            {t('tickets.purchaseDate')}
          </Text>
          <Text className="text-sm font-semibold text-white">
            {formatDate(ticket.purchaseDate)}
          </Text>
        </View>
        <View className="flex-row justify-between items-center">
          <Text className="text-sm text-text-muted">{t('tickets.status')}</Text>
          <View className={`px-3 py-1 rounded-full ${statusStyle.bg}`}>
            <Text className={`text-xs font-medium ${statusStyle.text}`}>
              {t(`tickets.${ticket.status}`)}
            </Text>
          </View>
        </View>
      </View>

      {/* Navigate to venue */}
      <View className="px-4 pb-8">
        <TransportButtons
          latitude={ticket.latitude}
          longitude={ticket.longitude}
          venueName={ticket.venueName}
        />
      </View>
    </ScrollView>
  );
}
