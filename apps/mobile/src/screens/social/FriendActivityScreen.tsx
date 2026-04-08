import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FriendActivity } from '@fomo/shared/src/types';
import { useFriendActivity } from '@/hooks/useDiscover';
import ActivityFeedItem from '@/components/ActivityFeedItem';

export default function FriendActivityScreen() {
  const { t } = useTranslation();
  const { data: activities, isLoading, refetch } = useFriendActivity();

  const handleEventPress = useCallback((eventId: string) => {
    // In a full app, navigate to EventDetail:
    // navigation.navigate('EventDetail', { eventId });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FriendActivity }) => (
      <ActivityFeedItem activity={item} onEventPress={handleEventPress} />
    ),
    [handleEventPress],
  );

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Header */}
      <View className="border-b border-border-light px-4 pb-3 pt-4">
        <Text className="text-xl font-bold text-white">
          {t('friendActivity.title', 'Friend Activity')}
        </Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshing={isLoading}
        onRefresh={refetch}
        contentContainerStyle={{ paddingBottom: 32 }}
        ListEmptyComponent={
          <View className="items-center py-16">
            <Text className="text-sm text-text-muted">
              {t('friendActivity.empty', 'No activity yet. Add some friends to see what they are up to!')}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
