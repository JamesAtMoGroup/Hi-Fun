import React from 'react';
import { View, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DatingRole } from '@fomo/shared/src/types';

interface RoleBadgeProps {
  role: DatingRole;
  size?: 'sm' | 'md';
}

const ROLE_COLORS: Record<DatingRole, { bg: string; text: string }> = {
  top: { bg: 'bg-blue-500', text: 'text-white' },
  bottom: { bg: 'bg-red-500', text: 'text-white' },
  vers: { bg: 'bg-purple-500', text: 'text-white' },
  vers_top: { bg: 'bg-blue-400', text: 'text-white' },
  vers_bottom: { bg: 'bg-red-400', text: 'text-white' },
  side: { bg: 'bg-gray-400', text: 'text-white' },
  other: { bg: 'bg-gray-300', text: 'text-gray-700' },
};

const ROLE_LABELS: Record<DatingRole, string> = {
  top: 'Top',
  bottom: 'Bottom',
  vers: 'Vers',
  vers_top: 'Vers Top',
  vers_bottom: 'Vers Bottom',
  side: 'Side',
  other: 'Other',
};

export default function RoleBadge({ role, size = 'sm' }: RoleBadgeProps) {
  const { t } = useTranslation();
  const colorConfig = ROLE_COLORS[role];
  const label = t(`dating.role_${role}`, ROLE_LABELS[role]);

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <View className={`rounded-full ${colorConfig.bg} ${sizeClasses}`}>
      <Text className={`font-semibold ${colorConfig.text} ${textSize}`}>
        {label}
      </Text>
    </View>
  );
}
