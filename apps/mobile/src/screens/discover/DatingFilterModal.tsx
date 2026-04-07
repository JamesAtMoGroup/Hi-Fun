import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { Gender, DatingRole } from '@fomo/shared/src/types';
import { useDatingFilterStore } from '@/stores/datingFilterStore';

const ALL_GENDERS: { value: Gender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-Binary' },
  { value: 'other', label: 'Other' },
];

const ALL_ROLES: { value: DatingRole; label: string }[] = [
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'vers', label: 'Vers' },
  { value: 'vers_top', label: 'Vers Top' },
  { value: 'vers_bottom', label: 'Vers Bottom' },
  { value: 'side', label: 'Side' },
  { value: 'other', label: 'Other' },
];

export default function DatingFilterModal() {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { filters, setGenders, setRoles, setAgeRange, setMaxDistance, reset } =
    useDatingFilterStore();

  const [selectedGenders, setSelectedGenders] = useState<Gender[]>(filters.genders);
  const [selectedRoles, setSelectedRoles] = useState<DatingRole[]>(filters.roles);
  const [ageMin, setAgeMin] = useState(String(filters.ageRange.min));
  const [ageMax, setAgeMax] = useState(String(filters.ageRange.max));
  const [distance, setDistance] = useState(String(filters.maxDistance));

  const toggleGender = (g: Gender) => {
    setSelectedGenders((prev) =>
      prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g],
    );
  };

  const toggleRole = (r: DatingRole) => {
    setSelectedRoles((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };

  const handleApply = () => {
    setGenders(selectedGenders);
    setRoles(selectedRoles);
    const min = Math.max(18, Math.min(99, parseInt(ageMin, 10) || 18));
    const max = Math.max(min, Math.min(99, parseInt(ageMax, 10) || 99));
    setAgeRange(min, max);
    const dist = Math.max(1, Math.min(50, parseInt(distance, 10) || 25));
    setMaxDistance(dist);
    navigation.goBack();
  };

  const handleReset = () => {
    reset();
    setSelectedGenders([]);
    setSelectedRoles([]);
    setAgeMin('18');
    setAgeMax('99');
    setDistance('25');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4 pt-4">
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-base text-purple-600">{t('common.cancel', 'Cancel')}</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-900">
            {t('datingFilter.title', 'Filters')}
          </Text>
          <TouchableOpacity onPress={handleReset}>
            <Text className="text-base text-red-500">{t('datingFilter.reset', 'Reset')}</Text>
          </TouchableOpacity>
        </View>

        {/* Gender Multi-Select */}
        <Text className="mb-2 text-base font-semibold text-gray-900">
          {t('datingFilter.gender', 'Gender')}
        </Text>
        <View className="mb-5 flex-row flex-wrap">
          {ALL_GENDERS.map((g) => {
            const selected = selectedGenders.includes(g.value);
            return (
              <TouchableOpacity
                key={g.value}
                onPress={() => toggleGender(g.value)}
                className={`mb-2 mr-2 rounded-full px-4 py-2 ${
                  selected ? 'bg-purple-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {t(`gender.${g.value}`, g.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Role Multi-Select */}
        <Text className="mb-2 text-base font-semibold text-gray-900">
          {t('datingFilter.role', 'Role')}
        </Text>
        <View className="mb-5 flex-row flex-wrap">
          {ALL_ROLES.map((r) => {
            const selected = selectedRoles.includes(r.value);
            return (
              <TouchableOpacity
                key={r.value}
                onPress={() => toggleRole(r.value)}
                className={`mb-2 mr-2 rounded-full px-4 py-2 ${
                  selected ? 'bg-purple-600' : 'bg-gray-100'
                }`}
              >
                <Text
                  className={`text-sm font-medium ${
                    selected ? 'text-white' : 'text-gray-700'
                  }`}
                >
                  {t(`dating.role_${r.value}`, r.label)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Age Range */}
        <Text className="mb-2 text-base font-semibold text-gray-900">
          {t('datingFilter.ageRange', 'Age Range')}
        </Text>
        <View className="mb-5 flex-row items-center">
          <TextInput
            value={ageMin}
            onChangeText={setAgeMin}
            keyboardType="number-pad"
            maxLength={2}
            className="h-10 w-16 rounded-lg border border-gray-300 px-3 text-center text-sm text-gray-900"
            placeholder="18"
          />
          <Text className="mx-3 text-gray-500">-</Text>
          <TextInput
            value={ageMax}
            onChangeText={setAgeMax}
            keyboardType="number-pad"
            maxLength={2}
            className="h-10 w-16 rounded-lg border border-gray-300 px-3 text-center text-sm text-gray-900"
            placeholder="99"
          />
          <Text className="ml-2 text-sm text-gray-500">
            {t('datingFilter.years', 'years')}
          </Text>
        </View>

        {/* Max Distance */}
        <Text className="mb-2 text-base font-semibold text-gray-900">
          {t('datingFilter.maxDistance', 'Max Distance')}
        </Text>
        <View className="mb-6 flex-row items-center">
          <TextInput
            value={distance}
            onChangeText={setDistance}
            keyboardType="number-pad"
            maxLength={2}
            className="h-10 w-16 rounded-lg border border-gray-300 px-3 text-center text-sm text-gray-900"
            placeholder="25"
          />
          <Text className="ml-2 text-sm text-gray-500">km</Text>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View className="border-t border-gray-100 px-4 pb-6 pt-3">
        <TouchableOpacity
          onPress={handleApply}
          className="items-center rounded-full bg-purple-600 py-3.5"
        >
          <Text className="text-base font-semibold text-white">
            {t('datingFilter.apply', 'Apply Filters')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
