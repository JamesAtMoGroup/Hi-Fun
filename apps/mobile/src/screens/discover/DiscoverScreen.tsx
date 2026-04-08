import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DiscoverPerson } from '@fomo/shared/src/types';
import type { DiscoverStackParamList } from '@/navigation/stacks/DiscoverStack';
import { useDiscoverPeople } from '@/hooks/useDiscover';
import PersonCard from '@/components/PersonCard';
import EmptyState from '@/components/EmptyState';

type Nav = NativeStackNavigationProp<DiscoverStackParamList>;

export default function DiscoverScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { data: people, isLoading } = useDiscoverPeople(1);

  const handlePersonPress = (person: DiscoverPerson) => {
    navigation.navigate('PersonDetail', { userId: person.userId });
  };

  const handleFilterPress = () => {
    navigation.navigate('DatingFilter');
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-border-light px-4 pb-3 pt-4">
        <Text className="text-xl font-bold text-white">
          {t('discover.title', 'Discover')}
        </Text>
        <TouchableOpacity
          onPress={handleFilterPress}
          className="rounded-full bg-surface-elevated px-4 py-2"
        >
          <Text className="text-sm font-semibold text-primary">
            {t('discover.filters', 'Filters')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Person Cards */}
      <FlatList
        data={people}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <PersonCard person={item} onPress={handlePersonPress} />
        )}
        ListEmptyComponent={
          <EmptyState
            message={t(
              'discover.empty',
              'No matches found. Try adjusting your filters.',
            )}
            ctaLabel={t('discover.adjustFilters', 'Adjust Filters')}
            onCtaPress={handleFilterPress}
          />
        }
      />
    </SafeAreaView>
  );
}
