import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TicketType } from '@fomo/shared/src/types';

interface TicketTypeCardProps {
  ticketType: TicketType;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
}

export default function TicketTypeCard({
  ticketType,
  quantity,
  onQuantityChange,
}: TicketTypeCardProps) {
  const { t } = useTranslation();
  const remaining = ticketType.quantity - ticketType.soldCount;
  const isSoldOut = remaining <= 0;
  const maxSelectable = Math.min(remaining, ticketType.maxPerUser);

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxSelectable) {
      onQuantityChange(quantity + 1);
    }
  };

  return (
    <View
      className={`mb-3 rounded-xl border p-4 ${
        isSoldOut ? 'border-border bg-surface' : 'border-border bg-background'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1">
          <Text
            className={`text-base font-semibold ${
              isSoldOut ? 'text-text-muted' : 'text-white'
            }`}
          >
            {ticketType.name}
          </Text>
          {ticketType.description && (
            <Text className="mt-1 text-xs text-text-muted">
              {ticketType.description}
            </Text>
          )}
        </View>
        <Text
          className={`text-base font-bold ${
            isSoldOut ? 'text-text-muted' : 'text-purple-700'
          }`}
        >
          NT$ {ticketType.price}
        </Text>
      </View>

      <View className="mt-3 flex-row items-center justify-between">
        {isSoldOut ? (
          <View className="rounded-full bg-red-100 px-3 py-1">
            <Text className="text-xs font-semibold text-red-600">
              {t('eventDetail.soldOut', 'Sold Out')}
            </Text>
          </View>
        ) : (
          <Text className="text-xs text-text-muted">
            {remaining} {t('eventDetail.remaining', 'remaining')}
          </Text>
        )}

        {!isSoldOut && (
          <View className="flex-row items-center rounded-lg bg-surface">
            <TouchableOpacity
              onPress={handleDecrement}
              className="px-3 py-2"
              disabled={quantity === 0}
              activeOpacity={0.6}
            >
              <Text
                className={`text-lg font-bold ${
                  quantity === 0 ? 'text-gray-300' : 'text-text-secondary'
                }`}
              >
                -
              </Text>
            </TouchableOpacity>
            <Text className="min-w-[24px] text-center text-base font-semibold text-white">
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={handleIncrement}
              className="px-3 py-2"
              disabled={quantity >= maxSelectable}
              activeOpacity={0.6}
            >
              <Text
                className={`text-lg font-bold ${
                  quantity >= maxSelectable ? 'text-gray-300' : 'text-text-secondary'
                }`}
              >
                +
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
