import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';
import { useAuthStore } from '@/stores/authStore';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const [pushEnabled, setPushEnabled] = useState(true);
  const currentLang = i18n.language;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleLogout = () => {
    Alert.alert(t('settings.logOut'), t('settings.logOutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('settings.logOut'),
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(t('settings.deleteAccount'), t('settings.deleteAccountConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => {
          Alert.alert('Account deletion requested');
        },
      },
    ]);
  };

  const handleChangePassword = () => {
    Alert.alert(t('settings.changePassword'), t('settings.changePasswordMsg'));
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <Text className="text-xl font-bold text-white px-6 pt-6 pb-4">
        {t('profile.settings')}
      </Text>

      {/* Language selector */}
      <View className="px-6 py-3 border-b border-border-light">
        <Text className="text-sm font-medium text-text-secondary mb-2">
          {t('settings.language')}
        </Text>
        <View className="flex-row gap-3">
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center border ${
              currentLang === 'zh-TW'
                ? 'bg-primary border-purple-600'
                : 'bg-background border-border'
            }`}
            onPress={() => handleLanguageChange('zh-TW')}
          >
            <Text
              className={`text-sm font-medium ${
                currentLang === 'zh-TW' ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {t('settings.zhTW')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-3 rounded-lg items-center border ${
              currentLang === 'en'
                ? 'bg-primary border-purple-600'
                : 'bg-background border-border'
            }`}
            onPress={() => handleLanguageChange('en')}
          >
            <Text
              className={`text-sm font-medium ${
                currentLang === 'en' ? 'text-white' : 'text-text-secondary'
              }`}
            >
              {t('settings.english')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Push notifications */}
      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border-light">
        <Text className="text-base text-white">
          {t('settings.pushNotifications')}
        </Text>
        <Switch
          value={pushEnabled}
          onValueChange={setPushEnabled}
          trackColor={{ false: '#D1D5DB', true: '#7C3AED' }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Account section */}
      <View className="px-6 pt-4 pb-2">
        <Text className="text-sm font-medium text-text-muted uppercase mb-2">
          {t('settings.account')}
        </Text>
      </View>

      <View className="flex-row items-center justify-between px-6 py-4 border-b border-border-light">
        <Text className="text-base text-white">{t('settings.email')}</Text>
        <Text className="text-sm text-text-muted">alex@example.com</Text>
      </View>

      <TouchableOpacity
        className="flex-row items-center justify-between px-6 py-4 border-b border-border-light"
        onPress={handleChangePassword}
      >
        <Text className="text-base text-white">
          {t('settings.changePassword')}
        </Text>
        <Text className="text-text-muted text-lg">&gt;</Text>
      </TouchableOpacity>

      {/* Log Out */}
      <TouchableOpacity
        className="mx-6 mt-8 py-4 rounded-xl border border-border items-center"
        onPress={handleLogout}
      >
        <Text className="text-base font-semibold text-white">
          {t('settings.logOut')}
        </Text>
      </TouchableOpacity>

      {/* Delete Account */}
      <TouchableOpacity
        className="mx-6 mt-3 py-4 rounded-xl items-center"
        onPress={handleDeleteAccount}
      >
        <Text className="text-base font-semibold text-red-500">
          {t('settings.deleteAccount')}
        </Text>
      </TouchableOpacity>

      {/* App version */}
      <Text className="text-center text-xs text-text-muted mt-8 mb-6">
        {t('common.appVersion')} 1.0.0
      </Text>
    </ScrollView>
  );
}
