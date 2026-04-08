import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DEFAULT_MAP_CENTER, EVENT_CATEGORIES } from '@fomo/shared/src/constants';
import type { MapMarker, EventCategory, EventSummary } from '@fomo/shared/src/types';
import { useMapMarkers } from '@/hooks/useMapMarkers';
import EventCard from '@/components/EventCard';

// Category color mapping for markers
const CATEGORY_COLORS: Record<EventCategory, string> = {
  nightclub: '#7C3AED',
  live_music: '#EC4899',
  market: '#F59E0B',
  sports: '#10B981',
  exhibition: '#3B82F6',
  food_drink: '#EF4444',
  outdoor: '#059669',
  workshop: '#8B5CF6',
  party: '#F97316',
  other: '#6B7280',
};

// Mock event summary for bottom sheet preview
function mockEventSummaryFromMarker(marker: MapMarker): EventSummary {
  return {
    id: marker.id,
    title: marker.title,
    category: marker.category,
    venueName: marker.title,
    coverImageUrl: `https://picsum.photos/seed/${marker.id}/400/200`,
    startTime: '2026-04-12T20:00:00+08:00',
    endTime: '2026-04-12T23:00:00+08:00',
    isFree: marker.attendingCount < 100,
    priceRange: marker.attendingCount >= 100
      ? { min: 300, max: 1500, currency: 'TWD' }
      : undefined,
    attendingCount: marker.attendingCount,
    interestedCount: Math.floor(marker.attendingCount * 1.5),
    latitude: marker.latitude,
    longitude: marker.longitude,
    isPromoted: marker.isPromoted,
    friendsGoing: [],
  };
}

// Marker size based on attending count
function getMarkerSize(attendingCount: number): number {
  if (attendingCount >= 500) return 40;
  if (attendingCount >= 200) return 34;
  if (attendingCount >= 100) return 28;
  return 22;
}

type MapTabNavProp = NativeStackNavigationProp<{
  EventDetail: { eventId: string };
}>;

export default function MapScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DEFAULT_MAP_CENTER);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const { data: markers = [] } = useMapMarkers(region);

  const filteredMarkers = selectedCategory
    ? markers.filter((m) => m.category === selectedCategory)
    : markers;

  const handleRegionChangeComplete = useCallback((newRegion: Region) => {
    setRegion(newRegion);
  }, []);

  const handleLocateMe = useCallback(() => {
    // In production, use Geolocation.getCurrentPosition
    // For now, re-center to default Taipei location
    mapRef.current?.animateToRegion(DEFAULT_MAP_CENTER, 500);
  }, []);

  const handleMarkerPress = useCallback(
    (marker: MapMarker) => {
      setSelectedMarker(marker);
      mapRef.current?.animateToRegion(
        {
          latitude: marker.latitude,
          longitude: marker.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        300,
      );
    },
    [],
  );

  const handleCategorySelect = useCallback((key: string) => {
    setSelectedCategory((prev) => (prev === key ? null : key));
    setSelectedMarker(null);
  }, []);

  const handleBottomSheetDismiss = useCallback(() => {
    setSelectedMarker(null);
  }, []);

  return (
    <View className="flex-1 bg-background">
      {/* Full-screen Map */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={DEFAULT_MAP_CENTER}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleBottomSheetDismiss}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredMarkers.map((marker) => {
          const size = getMarkerSize(marker.attendingCount);
          const color = CATEGORY_COLORS[marker.category] || '#6B7280';
          const isSelected = selectedMarker?.id === marker.id;

          return (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              onPress={() => handleMarkerPress(marker)}
            >
              <View
                className={`items-center justify-center rounded-full ${
                  isSelected ? 'border-2 border-white shadow-lg' : ''
                }`}
                style={{
                  width: isSelected ? size + 8 : size,
                  height: isSelected ? size + 8 : size,
                  backgroundColor: color,
                }}
              >
                <Text
                  className="text-center font-bold text-white"
                  style={{ fontSize: size > 30 ? 11 : 9 }}
                >
                  {marker.attendingCount > 999
                    ? `${Math.floor(marker.attendingCount / 1000)}k`
                    : marker.attendingCount}
                </Text>
              </View>
              {marker.isPromoted && (
                <View className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 border border-white" />
              )}
            </Marker>
          );
        })}
      </MapView>

      {/* Category filter chips - floating top */}
      <View className="absolute left-0 right-0" style={{ top: insets.top + 8 }}>
        <View className="mx-2 flex-row flex-wrap">
          <View className="w-full">
            <View className="flex-row">
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(null);
                  setSelectedMarker(null);
                }}
                className={`mr-2 mb-2 flex-row items-center rounded-full px-3 py-2 shadow-sm ${
                  selectedCategory === null
                    ? 'bg-primary'
                    : 'bg-background'
                }`}
              >
                <Text
                  className={`text-xs font-medium ${
                    selectedCategory === null ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  {t('map.all', 'All')}
                </Text>
              </TouchableOpacity>
              {EVENT_CATEGORIES.slice(0, 5).map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => handleCategorySelect(cat.key)}
                    className={`mr-2 mb-2 flex-row items-center rounded-full px-3 py-2 shadow-sm ${
                      isActive ? 'bg-primary' : 'bg-background'
                    }`}
                  >
                    <Text className="mr-1 text-xs">{cat.emoji}</Text>
                    <Text
                      className={`text-xs font-medium ${
                        isActive ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View className="flex-row">
              {EVENT_CATEGORIES.slice(5).map((cat) => {
                const isActive = selectedCategory === cat.key;
                return (
                  <TouchableOpacity
                    key={cat.key}
                    onPress={() => handleCategorySelect(cat.key)}
                    className={`mr-2 mb-2 flex-row items-center rounded-full px-3 py-2 shadow-sm ${
                      isActive ? 'bg-primary' : 'bg-background'
                    }`}
                  >
                    <Text className="mr-1 text-xs">{cat.emoji}</Text>
                    <Text
                      className={`text-xs font-medium ${
                        isActive ? 'text-white' : 'text-text-secondary'
                      }`}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </View>

      {/* Locate me button - floating bottom-right */}
      <TouchableOpacity
        onPress={handleLocateMe}
        className="absolute bottom-32 right-4 h-12 w-12 items-center justify-center rounded-full bg-background shadow-lg"
        activeOpacity={0.7}
      >
        <Text className="text-xl">📍</Text>
      </TouchableOpacity>

      {/* Bottom sheet preview on marker tap */}
      {selectedMarker && (
        <View className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-background px-4 pb-8 pt-3 shadow-lg">
          <View className="mb-3 self-center h-1 w-10 rounded-full bg-gray-300" />
          <EventCard
            event={mockEventSummaryFromMarker(selectedMarker)}
            variant="vertical"
          />
        </View>
      )}
    </View>
  );
}
