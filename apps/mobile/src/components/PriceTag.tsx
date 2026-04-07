import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';

interface PriceTagProps {
  isFree: boolean;
  priceRange?: { min: number; max: number; currency: string };
}

export default function PriceTag({ isFree, priceRange }: PriceTagProps) {
  const { t } = useTranslation();

  if (isFree) {
    return (
      <View className="rounded-full bg-emerald-500 px-2 py-0.5">
        <Text className="text-xs font-semibold text-white">
          {t('common.free', 'Free')}
        </Text>
      </View>
    );
  }

  if (!priceRange) return null;

  const label =
    priceRange.min === priceRange.max
      ? `NT$ ${priceRange.min}`
      : `NT$ ${priceRange.min}–${priceRange.max}`;

  return (
    <View className="rounded-full bg-purple-100 px-2 py-0.5">
      <Text className="text-xs font-semibold text-purple-700">{label}</Text>
    </View>
  );
}
