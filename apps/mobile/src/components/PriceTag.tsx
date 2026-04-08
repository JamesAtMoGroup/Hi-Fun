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
      <View className="rounded-full bg-neon-green px-3 py-1">
        <Text className="text-[11px] font-bold uppercase tracking-wide text-background">
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
    <View className="rounded-full bg-background/80 px-3 py-1 border border-primary">
      <Text className="text-[11px] font-bold text-primary-light">{label}</Text>
    </View>
  );
}
