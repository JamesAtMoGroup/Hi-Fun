import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';

type InteractionType = 'attending' | 'interested' | 'want_to_go';

interface InteractionButtonsProps {
  initialCounts?: { attending: number; interested: number; wantToGo: number };
  initialActive?: InteractionType | null;
  onInteraction?: (type: InteractionType | null) => void;
}

export default function InteractionButtons({
  initialCounts = { attending: 0, interested: 0, wantToGo: 0 },
  initialActive = null,
  onInteraction,
}: InteractionButtonsProps) {
  const { t } = useTranslation();
  const [active, setActive] = useState<InteractionType | null>(initialActive);
  const [counts, setCounts] = useState(initialCounts);

  const handlePress = (type: InteractionType) => {
    if (active === type) {
      // Deselect
      setCounts((prev) => ({
        ...prev,
        [type === 'want_to_go' ? 'wantToGo' : type]:
          prev[type === 'want_to_go' ? 'wantToGo' : type] - 1,
      }));
      setActive(null);
      onInteraction?.(null);
    } else {
      // If another was active, decrement it
      if (active) {
        setCounts((prev) => ({
          ...prev,
          [active === 'want_to_go' ? 'wantToGo' : active]:
            prev[active === 'want_to_go' ? 'wantToGo' : active] - 1,
        }));
      }
      // Increment new
      setCounts((prev) => ({
        ...prev,
        [type === 'want_to_go' ? 'wantToGo' : type]:
          prev[type === 'want_to_go' ? 'wantToGo' : type] + 1,
      }));
      setActive(type);
      onInteraction?.(type);
    }
  };

  const countKey = (type: InteractionType) =>
    type === 'want_to_go' ? 'wantToGo' : type;

  const buttons: { type: InteractionType; labelKey: string; activeClass: string; inactiveClass: string }[] = [
    {
      type: 'attending',
      labelKey: 'interaction.attending',
      activeClass: 'bg-purple-600',
      inactiveClass: 'bg-gray-100',
    },
    {
      type: 'interested',
      labelKey: 'interaction.interested',
      activeClass: 'bg-pink-500',
      inactiveClass: 'bg-gray-100',
    },
    {
      type: 'want_to_go',
      labelKey: 'interaction.wantToGo',
      activeClass: 'border-2 border-purple-600 bg-purple-50',
      inactiveClass: 'bg-gray-100',
    },
  ];

  return (
    <View className="flex-row justify-between gap-2">
      {buttons.map(({ type, labelKey, activeClass, inactiveClass }) => {
        const isActive = active === type;
        return (
          <TouchableOpacity
            key={type}
            onPress={() => handlePress(type)}
            className={`flex-1 items-center rounded-xl px-2 py-3 ${isActive ? activeClass : inactiveClass}`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-semibold ${
                isActive
                  ? type === 'want_to_go'
                    ? 'text-purple-700'
                    : 'text-white'
                  : 'text-gray-600'
              }`}
            >
              {t(labelKey)}
            </Text>
            <Text
              className={`mt-0.5 text-xs ${
                isActive
                  ? type === 'want_to_go'
                    ? 'text-purple-500'
                    : 'text-white/80'
                  : 'text-gray-400'
              }`}
            >
              {counts[countKey(type)]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
