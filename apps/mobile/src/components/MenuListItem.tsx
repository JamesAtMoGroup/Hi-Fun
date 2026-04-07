import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface MenuListItemProps {
  label: string;
  onPress: () => void;
  badgeCount?: number;
}

export default function MenuListItem({
  label,
  onPress,
  badgeCount,
}: MenuListItemProps) {
  return (
    <TouchableOpacity
      className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100"
      onPress={onPress}
    >
      <View className="w-8 h-8 rounded-full bg-purple-50 items-center justify-center mr-3">
        <Text className="text-purple-600 text-sm">{label.charAt(0)}</Text>
      </View>
      <Text className="flex-1 text-base text-gray-900">{label}</Text>
      {badgeCount !== undefined && badgeCount > 0 && (
        <View className="bg-red-500 rounded-full px-2 py-0.5 mr-2">
          <Text className="text-white text-xs font-bold">{badgeCount}</Text>
        </View>
      )}
      <Text className="text-gray-400 text-lg">&gt;</Text>
    </TouchableOpacity>
  );
}
