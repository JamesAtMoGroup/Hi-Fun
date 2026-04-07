import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/stacks/HomeStack';
import type { EventSummary } from '@fomo/shared/src/types';
import { useTrendingEvents, useNearbyEvents, MOCK_EVENTS } from '@/hooks/useEvents';
import EventCard from '@/components/EventCard';
import CategoryChips from '@/components/CategoryChips';
import FriendAvatarStack from '@/components/FriendAvatarStack';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: trendingEvents, isLoading: trendingLoading } = useTrendingEvents();
  const {
    data: nearbyData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useNearbyEvents(25.033, 121.5654);

  const nearbyEvents = nearbyData?.pages.flatMap((p) => p.items) ?? [];

  // Friends-going events: events where friendsGoing > 0
  const friendsGoingEvents = MOCK_EVENTS.filter(
    (e) => e.friendsGoing && e.friendsGoing.length > 0,
  );

  const handleCategorySelect = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      navigation.navigate('CategoryList', { category });
    },
    [navigation],
  );

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderNearbyItem = useCallback(
    ({ item }: { item: EventSummary }) => (
      <View className="px-4">
        <EventCard event={item} variant="vertical" />
      </View>
    ),
    [],
  );

  const ListHeader = useCallback(
    () => (
      <View>
        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Search')}
          className="mx-4 mt-4 flex-row items-center rounded-xl bg-gray-100 px-4 py-3"
        >
          <Text className="mr-2 text-gray-400">🔍</Text>
          <Text className="flex-1 text-sm text-gray-400">
            {t('home.searchPlaceholder', 'Search events, venues...')}
          </Text>
        </TouchableOpacity>

        {/* Category Chips */}
        <View className="mt-3">
          <CategoryChips selected={selectedCategory} onSelect={handleCategorySelect} />
        </View>

        {/* Hot Tonight */}
        <View className="mt-4">
          <Text className="px-4 text-xl font-bold text-gray-900">
            {t('home.hotTonight', 'Hot Tonight 🔥')}
          </Text>
          {trendingLoading ? (
            <ActivityIndicator className="py-8" color="#7C3AED" />
          ) : (
            <FlatList
              data={trendingEvents}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
              renderItem={({ item }) => <EventCard event={item} variant="horizontal" />}
            />
          )}
        </View>

        {/* Friends Are Going */}
        <View className="mt-6">
          <Text className="px-4 text-xl font-bold text-gray-900">
            {t('home.friendsAreGoing', 'Friends Are Going 👫')}
          </Text>
          <FlatList
            data={friendsGoingEvents}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
                activeOpacity={0.8}
                className="mr-4 w-60 overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <View className="h-28">
                  {/* Using a simple colored placeholder since Image might not load */}
                  <View className="h-full w-full bg-purple-100" />
                </View>
                <View className="p-3">
                  <Text className="text-sm font-semibold text-gray-900" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-xs text-gray-500">{item.venueName}</Text>
                  <View className="mt-2">
                    <FriendAvatarStack friends={item.friendsGoing} size={24} />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Nearby Section Header */}
        <Text className="mt-6 px-4 text-xl font-bold text-gray-900">
          {t('home.nearby', 'Nearby 📍')}
        </Text>
      </View>
    ),
    [
      navigation,
      t,
      selectedCategory,
      handleCategorySelect,
      trendingEvents,
      trendingLoading,
      friendsGoingEvents,
    ],
  );

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={nearbyEvents}
        keyExtractor={(item) => `nearby-${item.id}`}
        renderItem={renderNearbyItem}
        ListHeaderComponent={ListHeader}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator className="py-4" color="#7C3AED" />
          ) : null
        }
      />
    </View>
  );
}
