import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import SegmentedControl from '@/components/SegmentedControl';

interface MockEvent {
  id: string;
  title: string;
  venueName: string;
  startTime: string;
  coverImageUrl: string;
}

const MOCK_EVENTS: Record<string, MockEvent[]> = {
  attending: [
    { id: '1', title: 'Neon Nights Party', venueName: 'Club OMNI', startTime: '2026-04-12T21:00:00', coverImageUrl: '' },
    { id: '2', title: 'Taipei Pride After Party', venueName: 'Triangle', startTime: '2026-04-15T22:00:00', coverImageUrl: '' },
    { id: '3', title: 'Rooftop Beats', venueName: 'W Hotel Taipei', startTime: '2026-04-18T19:00:00', coverImageUrl: '' },
    { id: '4', title: 'Underground Techno', venueName: 'Pawnshop', startTime: '2026-04-20T23:00:00', coverImageUrl: '' },
  ],
  interested: [
    { id: '5', title: 'Art Basel Taipei', venueName: 'Songshan CPC', startTime: '2026-04-25T10:00:00', coverImageUrl: '' },
    { id: '6', title: 'Food & Wine Festival', venueName: 'Huashan 1914', startTime: '2026-05-01T11:00:00', coverImageUrl: '' },
    { id: '7', title: 'Jazz in the Park', venueName: 'Daan Park', startTime: '2026-05-05T17:00:00', coverImageUrl: '' },
  ],
  wantToGo: [
    { id: '8', title: 'Summer Music Festival', venueName: 'Fulong Beach', startTime: '2026-07-10T14:00:00', coverImageUrl: '' },
    { id: '9', title: 'LGBTQ+ Film Night', venueName: 'Spot Taipei', startTime: '2026-05-15T19:00:00', coverImageUrl: '' },
    { id: '10', title: 'Weekend Market Pop-up', venueName: 'Shilin Night Market', startTime: '2026-04-19T16:00:00', coverImageUrl: '' },
  ],
  past: [
    { id: '11', title: 'New Year Countdown', venueName: 'Taipei 101', startTime: '2025-12-31T22:00:00', coverImageUrl: '' },
    { id: '12', title: 'Winter Wonderland', venueName: 'ATT Show Box', startTime: '2025-12-20T20:00:00', coverImageUrl: '' },
    { id: '13', title: 'Halloween Bash', venueName: 'Triangle', startTime: '2025-10-31T21:00:00', coverImageUrl: '' },
    { id: '14', title: 'Mid-Autumn BBQ', venueName: 'Riverside Park', startTime: '2025-09-17T17:00:00', coverImageUrl: '' },
    { id: '15', title: 'Dragon Boat Party', venueName: 'Bitan', startTime: '2025-06-10T10:00:00', coverImageUrl: '' },
  ],
};

const SEGMENT_KEYS = ['attending', 'interested', 'wantToGo', 'past'] as const;

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export default function MyEventsScreen() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);

  const segments = [
    t('events.attending'),
    t('events.interested'),
    t('events.wantToGo'),
    t('events.past'),
  ];

  const currentKey = SEGMENT_KEYS[activeIndex];
  const events = MOCK_EVENTS[currentKey];

  const renderEvent = ({ item }: { item: MockEvent }) => (
    <TouchableOpacity className="flex-row bg-background border-b border-border-light px-4 py-3">
      <View className="w-16 h-16 rounded-lg bg-surface-elevated items-center justify-center mr-3">
        <Text className="text-primary text-lg font-bold">
          {item.title.charAt(0)}
        </Text>
      </View>
      <View className="flex-1 justify-center">
        <Text className="text-base font-semibold text-white" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="text-xs text-text-muted mt-1">{item.venueName}</Text>
        <Text className="text-xs text-text-muted mt-0.5">
          {formatDate(item.startTime)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-background">
      <Text className="text-xl font-bold text-white px-4 pt-6 pb-2">
        {t('profile.myEvents')}
      </Text>
      <SegmentedControl
        segments={segments}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}
