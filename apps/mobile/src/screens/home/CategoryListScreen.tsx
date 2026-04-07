import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function CategoryListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>CategoryListScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 20, fontWeight: '600', color: '#111827' },
});
