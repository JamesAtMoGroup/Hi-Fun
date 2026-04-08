import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { Event, TicketType, FriendAttendance, Merchant } from '@fomo/shared/src/types';
import type { HomeStackParamList } from '@/navigation/stacks/HomeStack';
import InteractionButtons from '@/components/InteractionButtons';
import FriendAvatarStack from '@/components/FriendAvatarStack';
import VenueMapPreview from '@/components/VenueMapPreview';
import TicketTypeCard from '@/components/TicketTypeCard';
import TransportButtons from '@/components/TransportButtons';
import PriceTag from '@/components/PriceTag';
import { EVENT_CATEGORIES } from '@fomo/shared/src/constants';

// ─── Mock Data ────────────────────────────────────────────────

const MOCK_FRIENDS_GOING: FriendAttendance[] = [
  { userId: 'f1', displayName: 'Alice', avatarUrl: 'https://i.pravatar.cc/100?u=alice', status: 'attending' },
  { userId: 'f2', displayName: 'Bob', avatarUrl: 'https://i.pravatar.cc/100?u=bob', status: 'attending' },
  { userId: 'f3', displayName: 'Charlie', avatarUrl: 'https://i.pravatar.cc/100?u=charlie', status: 'interested' },
  { userId: 'f4', displayName: 'Diana', status: 'want_to_go' },
  { userId: 'f5', displayName: 'Eve', avatarUrl: 'https://i.pravatar.cc/100?u=eve', status: 'attending' },
];

const MOCK_ORGANIZER: Merchant = {
  id: 'org-1',
  userId: 'u-org-1',
  businessName: 'Taipei Night Events Co.',
  businessType: 'organizer',
  logoUrl: 'https://i.pravatar.cc/100?u=organizer',
  description: 'Taipei\'s premier event organizer bringing you the best nightlife, concerts, and cultural experiences.',
  contactEmail: 'events@taipeinight.tw',
  contactPhone: '+886-2-2345-6789',
  address: 'Taipei, Taiwan',
  googleRating: 4.7,
  isVerified: true,
  createdAt: '2024-01-01T00:00:00Z',
};

const MOCK_EVENT: Event = {
  id: 'evt-001',
  title: 'Neon Nights: Taipei Rooftop Party',
  description:
    'Join us for the most epic rooftop party in Taipei! Featuring world-class DJs, stunning city views from the 50th floor, craft cocktails, and an unforgettable atmosphere. Dress code: Neon & Glow.\n\nThe event will feature three stages with different music genres including techno, house, and hip-hop. VIP guests get access to the exclusive sky lounge with premium bottle service.\n\nFood trucks will be available on the ground floor, and we\'ve partnered with local restaurants to provide a curated food experience.\n\nDon\'t miss the midnight fireworks display visible from the rooftop!',
  category: 'party',
  status: 'published',
  venueName: 'W Taipei Rooftop Bar',
  address: 'No. 10, Section 5, Zhongxiao East Road, Xinyi District, Taipei',
  latitude: 25.0330,
  longitude: 121.5654,
  googlePlaceId: 'ChIJraeA2rarQjQRPBBjyR3MnGY',
  startTime: '2026-04-12T21:00:00+08:00',
  endTime: '2026-04-13T04:00:00+08:00',
  timezone: 'Asia/Taipei',
  coverImageUrl: 'https://picsum.photos/seed/neon-party/800/400',
  imageUrls: [
    'https://picsum.photos/seed/neon1/800/400',
    'https://picsum.photos/seed/neon2/800/400',
  ],
  isFree: false,
  priceRange: { min: 500, max: 2500, currency: 'TWD' },
  ticketTypes: [
    {
      id: 'tt-1',
      eventId: 'evt-001',
      name: 'Early Bird',
      price: 500,
      currency: 'TWD',
      quantity: 100,
      soldCount: 98,
      maxPerUser: 4,
      saleStart: '2026-03-01T00:00:00+08:00',
      saleEnd: '2026-04-01T00:00:00+08:00',
      description: 'Limited early bird pricing',
    },
    {
      id: 'tt-2',
      eventId: 'evt-001',
      name: 'General Admission',
      price: 800,
      currency: 'TWD',
      quantity: 500,
      soldCount: 320,
      maxPerUser: 4,
      saleStart: '2026-03-01T00:00:00+08:00',
      saleEnd: '2026-04-12T20:00:00+08:00',
      description: 'Standard entry with access to all stages',
    },
    {
      id: 'tt-3',
      eventId: 'evt-001',
      name: 'VIP',
      price: 2500,
      currency: 'TWD',
      quantity: 50,
      soldCount: 30,
      maxPerUser: 2,
      saleStart: '2026-03-01T00:00:00+08:00',
      saleEnd: '2026-04-12T20:00:00+08:00',
      description: 'VIP lounge access + premium drinks',
    },
  ],
  attendingCount: 448,
  interestedCount: 1230,
  viewCount: 8500,
  organizerId: 'org-1',
  organizer: MOCK_ORGANIZER,
  tags: ['rooftop', 'party', 'dj', 'nightlife', 'taipei'],
  isPromoted: true,
  promotionTier: 'premium',
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-04-05T00:00:00Z',
};

// ─── Helpers ──────────────────────────────────────────────────

function formatDate(isoDate: string): string {
  const d = new Date(isoDate);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(isoDate: string): string {
  const d = new Date(isoDate);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

function getCategoryInfo(category: string) {
  return EVENT_CATEGORIES.find((c) => c.key === category);
}

// ─── Component ────────────────────────────────────────────────

export default function EventDetailScreen() {
  const { t } = useTranslation();
  const route = useRoute<RouteProp<HomeStackParamList, 'EventDetail'>>();
  const { eventId } = route.params;

  // In production, use useEvent(eventId) React Query hook
  const event = MOCK_EVENT;
  const friendsGoing = MOCK_FRIENDS_GOING;

  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});

  const categoryInfo = getCategoryInfo(event.category);

  const handleTicketQuantityChange = (ticketTypeId: string, quantity: number) => {
    setTicketQuantities((prev) => ({ ...prev, [ticketTypeId]: quantity }));
  };

  const totalPrice = event.ticketTypes.reduce((sum, tt) => {
    const qty = ticketQuantities[tt.id] || 0;
    return sum + tt.price * qty;
  }, 0);

  const totalTickets = Object.values(ticketQuantities).reduce((a, b) => a + b, 0);

  const handleBuyTickets = () => {
    if (event.externalTicketUrl) {
      Linking.openURL(event.externalTicketUrl);
    } else {
      // In production, open TicketPurchaseModal
      console.log('Open TicketPurchaseModal', { ticketQuantities, totalPrice });
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* 1. Cover Image */}
        <Image
          source={{ uri: event.coverImageUrl }}
          className="w-full"
          style={{ height: 250 }}
          resizeMode="cover"
        />

        <View className="px-4 pt-4 pb-32">
          {/* 2. Title + Category Badge + Date/Time */}
          <View className="mb-4">
            {categoryInfo && (
              <View className="mb-2 flex-row">
                <View className="flex-row items-center rounded-full bg-surface-elevated px-3 py-1">
                  <Text className="mr-1 text-sm">{categoryInfo.emoji}</Text>
                  <Text className="text-xs font-semibold text-purple-700">
                    {categoryInfo.label}
                  </Text>
                </View>
                {event.isPromoted && (
                  <View className="ml-2 rounded-full bg-amber-100 px-3 py-1">
                    <Text className="text-xs font-semibold text-amber-700">
                      {t('event.promoted', 'Promoted')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text className="text-2xl font-bold text-white">{event.title}</Text>

            <View className="mt-2 flex-row items-center">
              <Text className="text-sm text-text-muted">
                {formatDate(event.startTime)} {' \u00B7 '} {formatTime(event.startTime)} - {formatTime(event.endTime)}
              </Text>
            </View>

            <View className="mt-2 flex-row items-center">
              <PriceTag isFree={event.isFree} priceRange={event.priceRange} />
              <Text className="ml-3 text-xs text-text-muted">
                {event.attendingCount} {t('event.attending', 'attending')} {' \u00B7 '}{' '}
                {event.interestedCount} {t('event.interested', 'interested')}
              </Text>
            </View>
          </View>

          {/* 3. Interaction Buttons */}
          <View className="mb-6">
            <InteractionButtons
              initialCounts={{
                attending: event.attendingCount,
                interested: event.interestedCount,
                wantToGo: 85,
              }}
            />
          </View>

          {/* 4. Friends Going */}
          {friendsGoing.length > 0 && (
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-white">
                {t('eventDetail.friendsGoing', 'Friends Going')}
              </Text>
              <View className="flex-row items-center rounded-xl bg-surface p-3">
                <FriendAvatarStack friends={friendsGoing} maxVisible={4} size={36} />
                <Text className="ml-3 flex-1 text-sm text-text-secondary">
                  {friendsGoing[0].displayName}
                  {friendsGoing.length > 1 &&
                    ` ${t('eventDetail.andOthers', 'and {{count}} others', {
                      count: friendsGoing.length - 1,
                    })}`}
                </Text>
              </View>
            </View>
          )}

          {/* 5. Venue Info with Mini Map */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-white">
              {t('eventDetail.venue', 'Venue')}
            </Text>
            <Text className="mb-1 text-base font-medium text-white">
              {event.venueName}
            </Text>
            <VenueMapPreview
              latitude={event.latitude}
              longitude={event.longitude}
              address={event.address}
              venueName={event.venueName}
              googlePlaceId={event.googlePlaceId}
            />
          </View>

          {/* Transport Buttons */}
          <View className="mb-6">
            <TransportButtons
              latitude={event.latitude}
              longitude={event.longitude}
              venueName={event.venueName}
            />
          </View>

          {/* 6. Description (expandable) */}
          <View className="mb-6">
            <Text className="mb-2 text-lg font-semibold text-white">
              {t('eventDetail.about', 'About')}
            </Text>
            <Text
              className="text-sm leading-5 text-text-secondary"
              numberOfLines={descriptionExpanded ? undefined : 4}
            >
              {event.description}
            </Text>
            {event.description.length > 200 && (
              <TouchableOpacity
                onPress={() => setDescriptionExpanded(!descriptionExpanded)}
                className="mt-1"
              >
                <Text className="text-sm font-semibold text-primary">
                  {descriptionExpanded
                    ? t('eventDetail.readLess', 'Read less')
                    : t('eventDetail.readMore', 'Read more')}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 7. Ticket Types */}
          <View className="mb-6">
            <Text className="mb-3 text-lg font-semibold text-white">
              {t('eventDetail.tickets', 'Tickets')}
            </Text>
            {event.ticketTypes.map((tt) => (
              <TicketTypeCard
                key={tt.id}
                ticketType={tt}
                quantity={ticketQuantities[tt.id] || 0}
                onQuantityChange={(qty) => handleTicketQuantityChange(tt.id, qty)}
              />
            ))}
          </View>

          {/* 8. Organizer Info Card */}
          {event.organizer && (
            <View className="mb-6">
              <Text className="mb-2 text-lg font-semibold text-white">
                {t('eventDetail.organizer', 'Organizer')}
              </Text>
              <TouchableOpacity
                className="flex-row items-center rounded-xl border border-border bg-background p-4"
                activeOpacity={0.7}
              >
                {event.organizer.logoUrl ? (
                  <Image
                    source={{ uri: event.organizer.logoUrl }}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-surface-elevated">
                    <Text className="text-lg font-bold text-primary">
                      {event.organizer.businessName.charAt(0)}
                    </Text>
                  </View>
                )}
                <View className="ml-3 flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-base font-semibold text-white">
                      {event.organizer.businessName}
                    </Text>
                    {event.organizer.isVerified && (
                      <Text className="ml-1 text-sm text-blue-500">✓</Text>
                    )}
                  </View>
                  {event.organizer.googleRating && (
                    <Text className="mt-0.5 text-xs text-text-muted">
                      ★ {event.organizer.googleRating} {t('eventDetail.rating', 'rating')}
                    </Text>
                  )}
                  {event.organizer.description && (
                    <Text className="mt-1 text-xs text-text-muted" numberOfLines={2}>
                      {event.organizer.description}
                    </Text>
                  )}
                </View>
                <Text className="text-text-muted">›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tags */}
          {event.tags.length > 0 && (
            <View className="mb-6 flex-row flex-wrap">
              {event.tags.map((tag) => (
                <View key={tag} className="mb-2 mr-2 rounded-full bg-surface px-3 py-1">
                  <Text className="text-xs text-text-secondary">#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border-light bg-background px-4 pb-8 pt-3">
        {event.externalTicketUrl ? (
          <TouchableOpacity
            onPress={handleBuyTickets}
            className="items-center rounded-xl bg-primary py-4"
            activeOpacity={0.8}
          >
            <Text className="text-base font-bold text-white">
              {t('eventDetail.visitTicketSite', 'Visit Ticket Site')}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleBuyTickets}
            className={`items-center rounded-xl py-4 ${
              totalTickets > 0 ? 'bg-primary' : 'bg-gray-300'
            }`}
            activeOpacity={0.8}
            disabled={totalTickets === 0}
          >
            <Text className="text-base font-bold text-white">
              {totalTickets > 0
                ? `${t('eventDetail.buyTickets', 'Buy Tickets')} — NT$${totalPrice}`
                : t('eventDetail.selectTickets', 'Select Tickets')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
