import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFriends } from '@/hooks/useDiscover';

export default function FriendsListScreen() {
  const { t } = useTranslation();
  const { data: friends, isLoading, refetch } = useFriends();
  const [search, setSearch] = useState('');
  const [handledRequests, setHandledRequests] = useState<Set<string>>(new Set());

  const accepted = useMemo(
    () =>
      (friends ?? [])
        .filter((f) => f.status === 'accepted')
        .filter((f) => f.displayName.toLowerCase().includes(search.toLowerCase())),
    [friends, search],
  );

  const pending = useMemo(
    () =>
      (friends ?? [])
        .filter((f) => f.status === 'pending')
        .filter((f) => !handledRequests.has(f.id)),
    [friends, handledRequests],
  );

  const handleAccept = (id: string, name: string) => {
    setHandledRequests((prev) => new Set(prev).add(id));
    Alert.alert(
      t('friends.accepted', 'Accepted'),
      t('friends.acceptedMsg', '{{name}} is now your friend.', { name }),
    );
  };

  const handleReject = (id: string) => {
    setHandledRequests((prev) => new Set(prev).add(id));
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border-light px-4 pb-3 pt-4">
        <Text className="text-xl font-bold text-white">
          {t('friends.title', 'Friends')}
        </Text>
      </View>

      {/* Search Bar */}
      <View className="mx-4 mt-3 flex-row items-center rounded-xl bg-surface px-4 py-2.5">
        <Text className="mr-2 text-text-muted">🔍</Text>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('friends.searchPlaceholder', 'Search friends...')}
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-sm text-white"
        />
      </View>

      <FlatList
        data={accepted}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshing={isLoading}
        onRefresh={refetch}
        ListHeaderComponent={
          pending.length > 0 ? (
            <View className="mx-4 mt-4">
              <Text className="mb-2 text-base font-semibold text-white">
                {t('friends.pendingRequests', 'Pending Requests')} ({pending.length})
              </Text>
              {pending.map((friend) => (
                <View
                  key={friend.id}
                  className="mb-2 flex-row items-center rounded-xl bg-surface-elevated p-3"
                >
                  <Image
                    source={{ uri: friend.avatarUrl }}
                    className="h-10 w-10 rounded-full bg-surface-elevated"
                  />
                  <Text className="ml-3 flex-1 text-sm font-medium text-white">
                    {friend.displayName}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleAccept(friend.id, friend.displayName)}
                    className="mr-2 rounded-full bg-primary px-4 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-white">
                      {t('friends.accept', 'Accept')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReject(friend.id)}
                    className="rounded-full bg-surface-elevated px-4 py-1.5"
                  >
                    <Text className="text-xs font-semibold text-text-secondary">
                      {t('friends.reject', 'Reject')}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
              <View className="mb-2 mt-4 border-b border-border-light" />
              <Text className="mb-2 text-base font-semibold text-white">
                {t('friends.allFriends', 'All Friends')} ({accepted.length})
              </Text>
            </View>
          ) : (
            <View className="mx-4 mt-4">
              <Text className="mb-2 text-base font-semibold text-white">
                {t('friends.allFriends', 'All Friends')} ({accepted.length})
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            className="mx-4 flex-row items-center border-b border-gray-50 py-3"
          >
            <Image
              source={{ uri: item.avatarUrl }}
              className="h-11 w-11 rounded-full bg-surface-elevated"
            />
            <Text className="ml-3 flex-1 text-sm font-medium text-white">
              {item.displayName}
            </Text>
            <Text className="text-xs text-text-muted">{'>'}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-text-muted">
              {search
                ? t('friends.noResults', 'No friends match your search')
                : t('friends.empty', 'No friends yet')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
