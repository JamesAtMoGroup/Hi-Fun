import React, { useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/stacks/HomeStack';
import type { EventSummary, EventCategory } from '@fomo/shared/src/types';
import { EVENT_CATEGORIES } from '@fomo/shared/src/constants';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import EmptyState from '@/components/EmptyState';
import { TouchableOpacity } from 'react-native';

type CategoryListRoute = RouteProp<HomeStackParamList, 'CategoryList'>;
type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function CategoryListScreen() {
  const route = useRoute<CategoryListRoute>();
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const { category } = route.params;

  const categoryInfo = EVENT_CATEGORIES.find((c) => c.key === category);
  const emoji = categoryInfo?.emoji ?? '';
  const label = categoryInfo?.label ?? category;

  const { data: events, isLoading } = useEvents({
    categories: [category as EventCategory],
  });

  const renderItem = useCallback(
    ({ item }: { item: EventSummary }) => (
      <View className="px-4">
        <EventCard event={item} variant="vertical" />
      </View>
    ),
    [],
  );

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View className="flex-row items-center border-b border-border-light px-4 pb-3 pt-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Text className="text-2xl text-text-secondary">{'<'}</Text>
        </TouchableOpacity>
        <Text className="text-2xl mr-2">{emoji}</Text>
        <Text className="text-xl font-bold text-white">{label}</Text>
      </View>

      {/* Event List */}
      {isLoading ? (
        <ActivityIndicator className="mt-12" color="#7C3AED" size="large" />
      ) : events && events.length > 0 ? (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <EmptyState
          message={t('category.noEvents', 'No events in this category yet.')}
          ctaLabel={t('category.goBack', 'Go back')}
          onCtaPress={() => navigation.goBack()}
        />
      )}
    </View>
  );
}
