import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { openTransport } from '@/utils/deeplinks';

interface TransportButtonsProps {
  latitude: number;
  longitude: number;
  venueName: string;
}

export default function TransportButtons({
  latitude,
  longitude,
  venueName,
}: TransportButtonsProps) {
  const { t } = useTranslation();

  const handleUber = () => {
    openTransport('uber', latitude, longitude, venueName);
  };

  const handleNavigate = () => {
    openTransport('google_maps', latitude, longitude, venueName);
  };

  return (
    <View className="flex-row gap-3">
      <TouchableOpacity
        onPress={handleUber}
        className="flex-1 flex-row items-center justify-center rounded-xl bg-black px-4 py-3"
        activeOpacity={0.7}
      >
        <Text className="mr-2 text-lg">🚗</Text>
        <Text className="text-sm font-semibold text-white">
          {t('eventDetail.uber', 'Uber')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleNavigate}
        className="flex-1 flex-row items-center justify-center rounded-xl bg-blue-500 px-4 py-3"
        activeOpacity={0.7}
      >
        <Text className="mr-2 text-lg">📍</Text>
        <Text className="text-sm font-semibold text-white">
          {t('eventDetail.navigate', 'Navigate')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
