import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { DiscoverPerson, EventSummary } from '@fomo/shared/src/types';
import RoleBadge from '@/components/RoleBadge';
import { MOCK_EVENTS, MOCK_PEOPLE } from '@/hooks/useDiscover';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type PersonDetailRouteParams = {
  PersonDetail: { userId: string };
};

// Mock: events in common (shared) and their upcoming events
const EVENTS_IN_COMMON: EventSummary[] = [
  {
    id: 'evt-1',
    title: 'Ximending Neon Night',
    category: 'nightclub',
    venueName: 'OMNI Nightclub',
    coverImageUrl: 'https://picsum.photos/seed/evt1/400/300',
    startTime: '2026-04-11T22:00:00+08:00',
    endTime: '2026-04-12T04:00:00+08:00',
    isFree: false,
    priceRange: { min: 500, max: 1500, currency: 'TWD' },
    attendingCount: 230,
    interestedCount: 540,
    latitude: 25.0424,
    longitude: 121.5081,
    isPromoted: true,
    friendsGoing: [],
  },
  {
    id: 'evt-3',
    title: 'Dadaocheng Market Walk',
    category: 'market',
    venueName: 'Dihua Street',
    coverImageUrl: 'https://picsum.photos/seed/evt3/400/300',
    startTime: '2026-04-13T10:00:00+08:00',
    endTime: '2026-04-13T17:00:00+08:00',
    isFree: true,
    attendingCount: 85,
    interestedCount: 220,
    latitude: 25.0568,
    longitude: 121.5101,
    isPromoted: false,
    friendsGoing: [],
  },
];

const THEIR_EVENTS: EventSummary[] = [
  {
    id: 'evt-2',
    title: 'Taipei 101 Rooftop Party',
    category: 'party',
    venueName: 'Taipei 101 Sky Lounge',
    coverImageUrl: 'https://picsum.photos/seed/evt2/400/300',
    startTime: '2026-04-12T20:00:00+08:00',
    endTime: '2026-04-12T23:59:00+08:00',
    isFree: false,
    priceRange: { min: 800, max: 2000, currency: 'TWD' },
    attendingCount: 150,
    interestedCount: 380,
    latitude: 25.0339,
    longitude: 121.5645,
    isPromoted: false,
    friendsGoing: [],
  },
  {
    id: 'evt-4',
    title: 'Songshan Creative Park Exhibition',
    category: 'exhibition',
    venueName: 'Songshan Cultural Park',
    coverImageUrl: 'https://picsum.photos/seed/evt4/400/300',
    startTime: '2026-04-14T11:00:00+08:00',
    endTime: '2026-04-14T20:00:00+08:00',
    isFree: false,
    priceRange: { min: 250, max: 250, currency: 'TWD' },
    attendingCount: 120,
    interestedCount: 310,
    latitude: 25.0442,
    longitude: 121.5607,
    isPromoted: false,
    friendsGoing: [],
  },
];

const GENDER_LABELS: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  non_binary: 'Non-Binary',
  other: 'Other',
};

export default function PersonDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<PersonDetailRouteParams, 'PersonDetail'>>();
  const { t } = useTranslation();
  const [photoIndex, setPhotoIndex] = useState(0);
  const [requestSent, setRequestSent] = useState(false);

  const person = MOCK_PEOPLE.find((p) => p.userId === route.params.userId) ?? MOCK_PEOPLE[0];

  const handleSendFriendRequest = () => {
    setRequestSent(true);
    Alert.alert(
      t('personDetail.requestSent', 'Friend Request Sent'),
      t('personDetail.requestSentMsg', '{{name}} will be notified.', {
        name: person.displayName,
      }),
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1">
        {/* Back button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="absolute left-4 top-4 z-10 h-9 w-9 items-center justify-center rounded-full bg-black/40"
        >
          <Text className="text-lg font-bold text-white">{'<'}</Text>
        </TouchableOpacity>

        {/* Photo Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setPhotoIndex(index);
          }}
          className="h-[400px]"
        >
          {person.photos.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={{ width: SCREEN_WIDTH, height: 400 }}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Photo dots */}
        {person.photos.length > 1 && (
          <View className="mt-2 flex-row items-center justify-center">
            {person.photos.map((_, i) => (
              <View
                key={i}
                className={`mx-1 h-2 w-2 rounded-full ${
                  i === photoIndex ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </View>
        )}

        {/* Name, age, gender, role */}
        <View className="mt-4 px-4">
          <View className="flex-row items-center">
            <Text className="mr-2 text-2xl font-bold text-white">
              {person.displayName}, {person.age}
            </Text>
            <RoleBadge role={person.role} size="md" />
          </View>
          <Text className="mt-1 text-sm text-text-muted">
            {t(`gender.${person.gender}`, GENDER_LABELS[person.gender])} ·{' '}
            {person.distance} km {t('discover.away', 'away')}
          </Text>
        </View>

        {/* Bio */}
        <View className="mt-4 px-4">
          <Text className="text-base font-semibold text-white">
            {t('personDetail.about', 'About')}
          </Text>
          <Text className="mt-1 text-sm leading-5 text-text-secondary">{person.bio}</Text>
        </View>

        {/* Events in Common */}
        <View className="mt-6 px-4">
          <Text className="mb-3 text-base font-semibold text-white">
            {t('personDetail.eventsInCommon', 'Events in Common')}
          </Text>
          {EVENTS_IN_COMMON.length === 0 ? (
            <Text className="text-sm text-text-muted">
              {t('personDetail.noCommonEvents', 'No events in common yet')}
            </Text>
          ) : (
            EVENTS_IN_COMMON.map((evt) => (
              <TouchableOpacity
                key={evt.id}
                className="mb-2 flex-row items-center rounded-xl bg-surface p-3"
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: evt.coverImageUrl }}
                  className="h-12 w-12 rounded-lg bg-surface-elevated"
                  resizeMode="cover"
                />
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                    {evt.title}
                  </Text>
                  <Text className="text-xs text-text-muted">
                    {evt.venueName} · {formatDate(evt.startTime)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Their Upcoming Events */}
        <View className="mt-6 px-4 pb-6">
          <Text className="mb-3 text-base font-semibold text-white">
            {t('personDetail.theirEvents', 'Their Upcoming Events')}
          </Text>
          {THEIR_EVENTS.map((evt) => (
            <TouchableOpacity
              key={evt.id}
              className="mb-2 flex-row items-center rounded-xl bg-surface p-3"
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: evt.coverImageUrl }}
                className="h-12 w-12 rounded-lg bg-surface-elevated"
                resizeMode="cover"
              />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-white" numberOfLines={1}>
                  {evt.title}
                </Text>
                <Text className="text-xs text-text-muted">
                  {evt.venueName} · {formatDate(evt.startTime)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Send Friend Request */}
      <View className="border-t border-border-light px-4 pb-6 pt-3">
        <TouchableOpacity
          onPress={handleSendFriendRequest}
          disabled={requestSent}
          className={`items-center rounded-full py-3.5 ${
            requestSent ? 'bg-gray-300' : 'bg-primary'
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {requestSent
              ? t('personDetail.requestSentBtn', 'Request Sent')
              : t('personDetail.sendRequest', 'Send Friend Request')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
