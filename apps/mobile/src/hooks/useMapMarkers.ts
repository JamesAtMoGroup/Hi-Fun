import { useQuery } from '@tanstack/react-query';
import type { MapMarker, EventCategory } from '@fomo/shared/src/types';

interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Mock markers around Taipei
const MOCK_MARKERS: MapMarker[] = [
  {
    id: '1',
    latitude: 25.0330,
    longitude: 121.5654,
    title: 'Taipei 101 NYE Party',
    category: 'party',
    attendingCount: 450,
    isPromoted: true,
  },
  {
    id: '2',
    latitude: 25.0478,
    longitude: 121.5170,
    title: 'WAVE Club Night',
    category: 'nightclub',
    attendingCount: 280,
    isPromoted: false,
  },
  {
    id: '3',
    latitude: 25.0375,
    longitude: 121.5637,
    title: 'Elephant Mountain Hike',
    category: 'outdoor',
    attendingCount: 65,
    isPromoted: false,
  },
  {
    id: '4',
    latitude: 25.0550,
    longitude: 121.5250,
    title: 'Taipei Arena Live Concert',
    category: 'live_music',
    attendingCount: 1200,
    isPromoted: true,
  },
  {
    id: '5',
    latitude: 25.0392,
    longitude: 121.5083,
    title: 'Yongkang Street Food Tour',
    category: 'food_drink',
    attendingCount: 95,
    isPromoted: false,
  },
  {
    id: '6',
    latitude: 25.0360,
    longitude: 121.5680,
    title: 'Taipei Art Exhibition',
    category: 'exhibition',
    attendingCount: 120,
    isPromoted: false,
  },
  {
    id: '7',
    latitude: 25.0615,
    longitude: 121.5225,
    title: 'Shilin Night Market Fest',
    category: 'market',
    attendingCount: 340,
    isPromoted: true,
  },
  {
    id: '8',
    latitude: 25.0173,
    longitude: 121.5313,
    title: 'Riverside Sports Day',
    category: 'sports',
    attendingCount: 75,
    isPromoted: false,
  },
  {
    id: '9',
    latitude: 25.0425,
    longitude: 121.5430,
    title: 'Pottery Workshop',
    category: 'workshop',
    attendingCount: 25,
    isPromoted: false,
  },
  {
    id: '10',
    latitude: 25.0277,
    longitude: 121.5583,
    title: 'Rooftop Pool Party',
    category: 'party',
    attendingCount: 180,
    isPromoted: false,
  },
  {
    id: '11',
    latitude: 25.0525,
    longitude: 121.5450,
    title: 'Songshan Creative Park Market',
    category: 'market',
    attendingCount: 210,
    isPromoted: false,
  },
  {
    id: '12',
    latitude: 25.0450,
    longitude: 121.5350,
    title: 'Underground Techno Night',
    category: 'nightclub',
    attendingCount: 150,
    isPromoted: false,
  },
];

async function fetchMapMarkers(_region: MapRegion): Promise<MapMarker[]> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_MARKERS;
}

export const useMapMarkers = (region: MapRegion) =>
  useQuery<MapMarker[]>({
    queryKey: ['mapMarkers', region.latitude, region.longitude, region.latitudeDelta, region.longitudeDelta],
    queryFn: () => fetchMapMarkers(region),
    staleTime: 30_000,
  });
