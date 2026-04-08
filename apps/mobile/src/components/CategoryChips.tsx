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
      className="py-3"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {EVENT_CATEGORIES.map((cat) => {
        const isActive = selected === cat.key;
        return (
          <TouchableOpacity
            key={cat.key}
            onPress={() => onSelect(cat.key)}
            activeOpacity={0.7}
            className={`flex-row items-center rounded-full px-5 py-2.5 border ${
              isActive
                ? 'bg-primary border-primary'
                : 'bg-surface border-border'
            }`}
          >
            <Text className="mr-1.5 text-base">{cat.emoji}</Text>
            <Text
              className={`text-sm font-semibold ${
                isActive ? 'text-white' : 'text-text-secondary'
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
