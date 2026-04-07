import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OnboardingDatingScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>OnboardingDatingScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  text: { fontSize: 20, fontWeight: '600', color: '#111827' },
});
