import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { buildGoogleMapsDeeplink } from '@/utils/deeplinks';
import { Linking } from 'react-native';

interface VenueMapPreviewProps {
  latitude: number;
  longitude: number;
  address: string;
  venueName: string;
  googlePlaceId?: string;
}

export default function VenueMapPreview({
  latitude,
  longitude,
  address,
  venueName,
  googlePlaceId,
}: VenueMapPreviewProps) {
  const handlePress = () => {
    const url = buildGoogleMapsDeeplink(latitude, longitude, googlePlaceId);
    Linking.openURL(url);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
      <View className="overflow-hidden rounded-xl">
        <MapView
          provider={PROVIDER_GOOGLE}
          style={{ width: '100%', height: 150 }}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          initialRegion={{
            latitude,
            longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={venueName}
          />
        </MapView>
      </View>
      <Text className="mt-2 text-sm text-gray-600">{address}</Text>
    </TouchableOpacity>
  );
}
