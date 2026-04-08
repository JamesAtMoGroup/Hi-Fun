import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/navigation/stacks/HomeStack';
import type { EventCategory, EventSummary } from '@fomo/shared/src/types';
import { useEvents } from '@/hooks/useEvents';
import EventListItem from '@/components/EventListItem';
import EmptyState from '@/components/EmptyState';

type Nav = NativeStackNavigationProp<HomeStackParamList>;

interface ActiveFilter {
  key: string;
  label: string;
  type: 'category' | 'date' | 'price';
  value: string;
}

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState<ActiveFilter[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Build filters from active filters
  const categories = activeFilters
    .filter((f) => f.type === 'category')
    .map((f) => f.value as EventCategory);

  const isFreeFilter = activeFilters.find((f) => f.type === 'price');

  const { data: results, isLoading } = useEvents({
    search: debouncedSearch || undefined,
    categories: categories.length > 0 ? categories : undefined,
    isFree: isFreeFilter ? isFreeFilter.value === 'free' : undefined,
  });

  // Auto-focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Debounce search input
  const handleSearchChange = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(text);
      if (text.length > 0) {
        setHasSearched(true);
      }
    }, 300);
  }, []);

  const handleFilterPress = useCallback(() => {
    Alert.alert(
      t('search.filters', 'Filters'),
      t('search.filtersComingSoon', 'Filter modal coming soon'),
    );
  }, [t]);

  const removeFilter = useCallback((filterKey: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.key !== filterKey));
  }, []);

  const showResults = hasSearched || debouncedSearch.length > 0 || activeFilters.length > 0;
  const filteredResults = results ?? [];

  const renderItem = useCallback(
    ({ item }: { item: EventSummary }) => <EventListItem event={item} />,
    [],
  );

  return (
    <View className="flex-1 bg-background">
      {/* Search Bar */}
      <View className="flex-row items-center border-b border-border-light px-4 pb-3 pt-4">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
          <Text className="text-2xl text-text-secondary">{'<'}</Text>
        </TouchableOpacity>
        <View className="flex-1 flex-row items-center rounded-xl bg-surface px-3 py-2.5">
          <Text className="mr-2 text-text-muted">{'🔍'}</Text>
          <TextInput
            ref={inputRef}
            value={searchText}
            onChangeText={handleSearchChange}
            placeholder={t('search.placeholder', 'Search events, venues...')}
            placeholderTextColor="#9CA3AF"
            className="flex-1 text-sm text-white"
            returnKeyType="search"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchText('');
                setDebouncedSearch('');
              }}
            >
              <Text className="text-text-muted">{'✕'}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={handleFilterPress} className="ml-3">
          <Text className="text-xl">{'⚙️'}</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <View className="flex-row flex-wrap px-4 py-2">
          {activeFilters.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              onPress={() => removeFilter(filter.key)}
              className="mb-1 mr-2 flex-row items-center rounded-full bg-surface-elevated px-3 py-1.5"
            >
              <Text className="mr-1 text-xs text-purple-700">{filter.label}</Text>
              <Text className="text-xs text-purple-400">{'✕'}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Results */}
      {isLoading ? (
        <ActivityIndicator className="mt-12" color="#7C3AED" size="large" />
      ) : showResults ? (
        filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            message={t('search.noResults', 'No events found. Try a different search.')}
            ctaLabel={t('search.clearSearch', 'Clear search')}
            onCtaPress={() => {
              setSearchText('');
              setDebouncedSearch('');
              setActiveFilters([]);
              setHasSearched(false);
            }}
          />
        )
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-5xl mb-3">{'🎯'}</Text>
          <Text className="text-center text-base text-text-muted">
            {t('search.startSearching', 'Search for events, venues, or categories')}
          </Text>
        </View>
      )}
    </View>
  );
}
