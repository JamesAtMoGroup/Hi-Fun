import React from 'react';
import { View, ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Edge = 'top' | 'bottom' | 'left' | 'right';

interface SafeScreenProps extends ViewProps {
  edges?: Edge[];
  backgroundColor?: string;
}

/**
 * SafeScreen — wraps content with proper safe area insets for
 * iPhone Dynamic Island, notch, and bottom gesture bar.
 *
 * Default edges: ['top', 'left', 'right'] (bottom handled by tab bar)
 *
 * Usage:
 *   <SafeScreen>
 *     <YourContent />
 *   </SafeScreen>
 */
export default function SafeScreen({
  children,
  edges = ['top', 'left', 'right'],
  backgroundColor = '#FFFFFF',
  style,
  ...rest
}: SafeScreenProps) {
  const insets = useSafeAreaInsets();

  const paddingStyle = {
    paddingTop: edges.includes('top') ? insets.top : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  return (
    <View
      style={[{ flex: 1, backgroundColor }, paddingStyle, style]}
      {...rest}
    >
      {children}
    </View>
  );
}
