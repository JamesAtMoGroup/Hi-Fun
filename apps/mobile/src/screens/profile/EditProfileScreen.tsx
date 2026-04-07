import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

const BIO_MAX = 300;

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState('Alex Chen');
  const [bio, setBio] = useState('Living for the weekend vibes');

  const handleChangePhoto = () => {
    Alert.alert(t('profile.changePhoto'), t('profile.changePhotoMsg'));
  };

  const handleSave = () => {
    Alert.alert(t('common.save'), t('profile.profileSaved'));
  };

  return (
    <ScrollView className="flex-1 bg-white px-6 pt-6">
      <View className="items-center mb-6">
        <TouchableOpacity
          className="w-24 h-24 rounded-full bg-purple-100 items-center justify-center"
          onPress={handleChangePhoto}
        >
          <Text className="text-3xl text-purple-600">A</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleChangePhoto} className="mt-2">
          <Text className="text-purple-600 text-sm font-medium">
            {t('profile.changePhoto')}
          </Text>
        </TouchableOpacity>
      </View>

      <Text className="text-sm font-medium text-gray-700 mb-1">
        {t('profile.displayName')}
      </Text>
      <TextInput
        className="border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 mb-4"
        value={displayName}
        onChangeText={setDisplayName}
        placeholder={t('profile.displayName')}
      />

      <Text className="text-sm font-medium text-gray-700 mb-1">
        {t('profile.bio')}
      </Text>
      <TextInput
        className="border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-900 mb-1"
        value={bio}
        onChangeText={(text) => {
          if (text.length <= BIO_MAX) setBio(text);
        }}
        placeholder={t('profile.bio')}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Text className="text-xs text-gray-400 text-right mb-6">
        {bio.length}/{BIO_MAX}
      </Text>

      <TouchableOpacity
        className="bg-purple-600 rounded-xl py-4 items-center"
        onPress={handleSave}
      >
        <Text className="text-white font-bold text-base">
          {t('common.save')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
