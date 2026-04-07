import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface EmptyStateProps {
  message: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
}

export default function EmptyState({ message, ctaLabel, onCtaPress }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-6xl mb-4">🔍</Text>
      <Text className="text-center text-base text-gray-500">{message}</Text>
      {ctaLabel && onCtaPress && (
        <TouchableOpacity
          onPress={onCtaPress}
          className="mt-4 rounded-full bg-purple-600 px-6 py-3"
        >
          <Text className="text-sm font-semibold text-white">{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
