import { Linking, Platform } from 'react-native';
import {
  UBER_DEEPLINK,
  UBER_UNIVERSAL_LINK,
  GOOGLE_MAPS_DEEPLINK,
  APPLE_MAPS_DEEPLINK,
} from '@fomo/shared/src/constants';

/**
 * Build Uber deeplink URL for ride to a destination.
 */
export function buildUberDeeplink(lat: number, lng: number, name: string): string {
  const encodedName = encodeURIComponent(name);
  return UBER_DEEPLINK
    .replace('{lat}', String(lat))
    .replace('{lng}', String(lng))
    .replace('{name}', encodedName);
}

/**
 * Build Uber universal link (web fallback) for ride to a destination.
 */
export function buildUberUniversalLink(lat: number, lng: number, name: string): string {
  const encodedName = encodeURIComponent(name);
  return UBER_UNIVERSAL_LINK
    .replace('{lat}', String(lat))
    .replace('{lng}', String(lng))
    .replace('{name}', encodedName);
}

/**
 * Build Google Maps directions deeplink.
 */
export function buildGoogleMapsDeeplink(lat: number, lng: number, placeId?: string): string {
  let url = GOOGLE_MAPS_DEEPLINK
    .replace('{lat}', String(lat))
    .replace('{lng}', String(lng));

  if (placeId) {
    url = url.replace('{placeId}', placeId);
  } else {
    url = url.replace('&destination_place_id={placeId}', '');
  }

  return url;
}

/**
 * Build Apple Maps directions deeplink.
 */
export function buildAppleMapsDeeplink(lat: number, lng: number): string {
  return APPLE_MAPS_DEEPLINK
    .replace('{lat}', String(lat))
    .replace('{lng}', String(lng));
}

/**
 * Open a transport app with directions to the given coordinates.
 */
export async function openTransport(
  type: 'uber' | 'google_maps' | 'apple_maps',
  lat: number,
  lng: number,
  name: string,
): Promise<void> {
  let url: string;

  switch (type) {
    case 'uber': {
      const nativeUrl = buildUberDeeplink(lat, lng, name);
      const canOpen = await Linking.canOpenURL(nativeUrl);
      url = canOpen ? nativeUrl : buildUberUniversalLink(lat, lng, name);
      break;
    }
    case 'google_maps':
      url = buildGoogleMapsDeeplink(lat, lng);
      break;
    case 'apple_maps':
      url = buildAppleMapsDeeplink(lat, lng);
      break;
    default:
      url = Platform.OS === 'ios'
        ? buildAppleMapsDeeplink(lat, lng)
        : buildGoogleMapsDeeplink(lat, lng);
  }

  await Linking.openURL(url);
}
