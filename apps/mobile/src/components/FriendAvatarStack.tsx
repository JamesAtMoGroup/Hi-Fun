import React from 'react';
import { View, Text, Image } from 'react-native';
import type { FriendAttendance } from '@fomo/shared/src/types';

interface FriendAvatarStackProps {
  friends: FriendAttendance[];
  maxVisible?: number;
  size?: number;
}

export default function FriendAvatarStack({
  friends,
  maxVisible = 3,
  size = 28,
}: FriendAvatarStackProps) {
  if (!friends || friends.length === 0) return null;

  const visible = friends.slice(0, maxVisible);
  const overflow = friends.length - maxVisible;

  return (
    <View className="flex-row items-center">
      {visible.map((friend, index) => (
        <View
          key={friend.userId}
          className="rounded-full border-2 border-white"
          style={{
            width: size,
            height: size,
            marginLeft: index > 0 ? -(size * 0.3) : 0,
            zIndex: maxVisible - index,
          }}
        >
          {friend.avatarUrl ? (
            <Image
              source={{ uri: friend.avatarUrl }}
              className="h-full w-full rounded-full"
            />
          ) : (
            <View className="h-full w-full items-center justify-center rounded-full bg-purple-200">
              <Text className="text-xs font-bold text-purple-700">
                {friend.displayName.charAt(0)}
              </Text>
            </View>
          )}
        </View>
      ))}
      {overflow > 0 && (
        <View
          className="items-center justify-center rounded-full border-2 border-white bg-gray-200"
          style={{
            width: size,
            height: size,
            marginLeft: -(size * 0.3),
          }}
        >
          <Text className="text-xs font-bold text-gray-600">+{overflow}</Text>
        </View>
      )}
    </View>
  );
}
