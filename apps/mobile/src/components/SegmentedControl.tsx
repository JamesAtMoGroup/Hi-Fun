import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SegmentedControlProps {
  segments: string[];
  activeIndex: number;
  onChange: (index: number) => void;
}

export default function SegmentedControl({
  segments,
  activeIndex,
  onChange,
}: SegmentedControlProps) {
  return (
    <View className="flex-row bg-gray-100 rounded-xl p-1 mx-4 my-2">
      {segments.map((label, index) => {
        const isActive = index === activeIndex;
        return (
          <TouchableOpacity
            key={label}
            className={`flex-1 py-2 rounded-lg items-center ${
              isActive ? 'bg-white shadow-sm' : ''
            }`}
            onPress={() => onChange(index)}
          >
            <Text
              className={`text-sm font-medium ${
                isActive ? 'text-purple-600' : 'text-gray-500'
              }`}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
