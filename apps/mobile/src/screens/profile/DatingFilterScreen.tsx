import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useDatingFilterStore } from '@/stores/datingFilterStore';
import type { Gender, DatingRole } from '@fomo/shared/src/types';

const GENDERS: Gender[] = ['male', 'female', 'non_binary', 'other'];
const ROLES: DatingRole[] = [
  'top',
  'bottom',
  'vers',
  'vers_top',
  'vers_bottom',
  'side',
  'other',
];

const GENDER_LABEL_KEYS: Record<Gender, string> = {
  male: 'dating.male',
  female: 'dating.female',
  non_binary: 'dating.nonBinary',
  other: 'dating.other',
};

const ROLE_LABEL_KEYS: Record<DatingRole, string> = {
  top: 'dating.top',
  bottom: 'dating.bottom',
  vers: 'dating.vers',
  vers_top: 'dating.versTop',
  vers_bottom: 'dating.versBottom',
  side: 'dating.side',
  other: 'dating.other',
};

export default function DatingFilterScreen() {
  const { t } = useTranslation();
  const { filters, setGenders, setRoles, setAgeRange, setMaxDistance, reset } =
    useDatingFilterStore();

  const toggleGender = (g: Gender) => {
    const current = filters.genders;
    if (current.includes(g)) {
      setGenders(current.filter((x) => x !== g));
    } else {
      setGenders([...current, g]);
    }
  };

  const toggleRole = (r: DatingRole) => {
    const current = filters.roles;
    if (current.includes(r)) {
      setRoles(current.filter((x) => x !== r));
    } else {
      setRoles([...current, r]);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 pt-6">
      <Text className="text-xl font-bold text-white mb-6">
        {t('dating.datingFilters')}
      </Text>

      {/* Gender multi-select */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.interestedInGenders')}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {GENDERS.map((g) => {
          const selected = filters.genders.includes(g);
          return (
            <TouchableOpacity
              key={g}
              className={`px-4 py-2 rounded-full border ${
                selected
                  ? 'bg-primary border-purple-600'
                  : 'bg-background border-border'
              }`}
              onPress={() => toggleGender(g)}
            >
              <Text
                className={`text-sm ${
                  selected ? 'text-white font-semibold' : 'text-text-secondary'
                }`}
              >
                {t(GENDER_LABEL_KEYS[g])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Role multi-select */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.interestedInRoles')}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-6">
        {ROLES.map((r) => {
          const selected = filters.roles.includes(r);
          return (
            <TouchableOpacity
              key={r}
              className={`px-4 py-2 rounded-full border ${
                selected
                  ? 'bg-primary border-purple-600'
                  : 'bg-background border-border'
              }`}
              onPress={() => toggleRole(r)}
            >
              <Text
                className={`text-sm ${
                  selected ? 'text-white font-semibold' : 'text-text-secondary'
                }`}
              >
                {t(ROLE_LABEL_KEYS[r])}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Age range */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.ageRange')}
      </Text>
      <View className="flex-row items-center gap-3 mb-6">
        <TextInput
          className="flex-1 border border-border rounded-lg px-4 py-3 text-base text-white text-center"
          value={String(filters.ageRange.min)}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            if (!isNaN(val)) setAgeRange(val, filters.ageRange.max);
          }}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text className="text-text-muted">—</Text>
        <TextInput
          className="flex-1 border border-border rounded-lg px-4 py-3 text-base text-white text-center"
          value={String(filters.ageRange.max)}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            if (!isNaN(val)) setAgeRange(filters.ageRange.min, val);
          }}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      {/* Max distance */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.maxDistance')}
      </Text>
      <View className="flex-row items-center gap-2 mb-8">
        <TextInput
          className="flex-1 border border-border rounded-lg px-4 py-3 text-base text-white"
          value={String(filters.maxDistance)}
          onChangeText={(text) => {
            const val = parseInt(text, 10);
            if (!isNaN(val)) setMaxDistance(val);
          }}
          keyboardType="number-pad"
          maxLength={3}
        />
        <Text className="text-text-muted">{t('dating.kmUnit')}</Text>
      </View>

      {/* Reset button */}
      <TouchableOpacity
        className="border border-border rounded-xl py-4 items-center mb-12"
        onPress={reset}
      >
        <Text className="text-text-secondary font-medium text-base">
          {t('common.retry')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
