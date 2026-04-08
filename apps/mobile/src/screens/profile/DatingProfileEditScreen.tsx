import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
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

const BIO_MAX = 500;

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

// Mock existing profile
const MOCK_PROFILE = {
  gender: 'male' as Gender,
  role: 'vers' as DatingRole,
  bio: 'Looking for fun people to hang out with at events!',
  photos: ['', '', ''] as string[],
  showOnDating: true,
  age: 28,
};

export default function DatingProfileEditScreen() {
  const { t } = useTranslation();
  const [gender, setGender] = useState<Gender>(MOCK_PROFILE.gender);
  const [role, setRole] = useState<DatingRole>(MOCK_PROFILE.role);
  const [bio, setBio] = useState(MOCK_PROFILE.bio);
  const [photos, setPhotos] = useState<string[]>(MOCK_PROFILE.photos);
  const [showOnDating, setShowOnDating] = useState(MOCK_PROFILE.showOnDating);
  const [age, setAge] = useState(String(MOCK_PROFILE.age));

  const handleAddPhoto = (index: number) => {
    Alert.alert(t('dating.addPhoto'), 'Photo picker coming soon!');
  };

  const handleSave = () => {
    Alert.alert(t('common.save'), t('profile.profileSaved'));
  };

  return (
    <ScrollView className="flex-1 bg-background px-6 pt-6">
      {/* Gender picker */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.gender')}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {GENDERS.map((g) => (
          <TouchableOpacity
            key={g}
            className={`px-4 py-2 rounded-full border ${
              gender === g
                ? 'bg-primary border-purple-600'
                : 'bg-background border-border'
            }`}
            onPress={() => setGender(g)}
          >
            <Text
              className={`text-sm ${
                gender === g ? 'text-white font-semibold' : 'text-text-secondary'
              }`}
            >
              {t(GENDER_LABEL_KEYS[g])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Role picker */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.role')}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r}
            className={`px-4 py-2 rounded-full border ${
              role === r
                ? 'bg-primary border-purple-600'
                : 'bg-background border-border'
            }`}
            onPress={() => setRole(r)}
          >
            <Text
              className={`text-sm ${
                role === r ? 'text-white font-semibold' : 'text-text-secondary'
              }`}
            >
              {t(ROLE_LABEL_KEYS[r])}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Dating bio */}
      <Text className="text-sm font-medium text-text-secondary mb-1">
        {t('dating.bio')}
      </Text>
      <TextInput
        className="border border-border rounded-lg px-4 py-3 text-base text-white mb-1"
        value={bio}
        onChangeText={(text) => {
          if (text.length <= BIO_MAX) setBio(text);
        }}
        placeholder={t('dating.bio')}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text className="text-xs text-text-muted text-right mb-4">
        {bio.length}/{BIO_MAX}
      </Text>

      {/* Photos grid 2x3 */}
      <Text className="text-sm font-medium text-text-secondary mb-2">
        {t('dating.photos')}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity
            key={index}
            className="w-[31%] aspect-square rounded-lg bg-surface border border-dashed border-border items-center justify-center"
            onPress={() => handleAddPhoto(index)}
          >
            <Text className="text-2xl text-text-muted">+</Text>
            <Text className="text-xs text-text-muted mt-1">
              {t('dating.addPhoto')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show on Discover toggle */}
      <View className="flex-row items-center justify-between py-3 mb-4">
        <Text className="text-base text-white">
          {t('dating.showOnDiscover')}
        </Text>
        <Switch
          value={showOnDating}
          onValueChange={setShowOnDating}
          trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Age input */}
      <Text className="text-sm font-medium text-text-secondary mb-1">
        {t('dating.age')}
      </Text>
      <TextInput
        className="border border-border rounded-lg px-4 py-3 text-base text-white mb-6"
        value={age}
        onChangeText={setAge}
        keyboardType="number-pad"
        placeholder={t('dating.age')}
        maxLength={2}
      />

      {/* Save button */}
      <TouchableOpacity
        className="bg-primary rounded-xl py-4 items-center mb-12"
        onPress={handleSave}
      >
        <Text className="text-white font-bold text-base">
          {t('common.save')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
