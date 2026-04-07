import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import { EVENT_CATEGORIES } from '@fomo/shared/src/constants';

interface CategoryChipsProps {
  selected?: string | null;
  onSelect: (categoryKey: string) => void;
}

export default function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
    >
      {EVENT_CATEGORIES.map((cat) => {
        const isActive = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            className={`flex-row items-center rounded-full px-4 py-2 ${
              isActive ? 'bg-purple-600' : 'bg-gray-100'
            }`}
          >
            <Text className="mr-1 text-sm">{cat.emoji}</Text>
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-white' : 'text-gray-700'
              }`}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
