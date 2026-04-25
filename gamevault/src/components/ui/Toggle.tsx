/**
 * SaveState Design System — Toggle
 *
 * Animated toggle switch with spring-based thumb animation.
 * 48×28px track, 20px thumb. Off: bgTertiary. On: accentGreen.
 */

import React, { useCallback, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {
  useTheme,
  semanticRadii,
} from '@/constants/theme';

// ── Types ────────────────────────────────────────────────────────

interface ToggleProps {
  /** Current on/off state */
  value: boolean;
  /** Called with new value when toggled */
  onValueChange: (newValue: boolean) => void;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Additional style overrides for the container */
  style?: object;
}

// ── Constants ────────────────────────────────────────────────────

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 20;
const THUMB_PADDING = (TRACK_HEIGHT - THUMB_SIZE) / 2;
const ANIM_DURATION = 200;

// ── Component ────────────────────────────────────────────────────

const Toggle: React.FC<ToggleProps> = ({
  value,
  onValueChange,
  disabled = false,
  style,
}) => {
  const theme = useTheme();
  const thumbPosition = useRef(
    new Animated.Value(value ? TRACK_WIDTH - THUMB_SIZE - THUMB_PADDING : THUMB_PADDING),
  ).current;

  // ── Animate thumb on value change ─────────────────────────────
  const animateThumb = useCallback(
    (newValue: boolean) => {
      Animated.spring(thumbPosition, {
        toValue: newValue
          ? TRACK_WIDTH - THUMB_SIZE - THUMB_PADDING
          : THUMB_PADDING,
        damping: 15,
        stiffness: 200,
        mass: 0.8,
        useNativeDriver: true,
      }).start();
    },
    [thumbPosition],
  );

  const handlePress = useCallback(() => {
    if (disabled) return;
    const newValue = !value;
    animateThumb(newValue);
    onValueChange(newValue);
  }, [disabled, value, animateThumb, onValueChange]);

  // ── Sync external value changes ───────────────────────────────
  React.useEffect(() => {
    animateThumb(value);
  }, [value, animateThumb]);

  const trackColor = disabled
    ? theme.colors.bgTertiary
    : value
      ? theme.colors.accentGreen
      : theme.colors.bgTertiary;
  const thumbColor = disabled
    ? theme.colors.textDisabled
    : theme.colors.textPrimary;
  const opacity = disabled ? 0.5 : 1;

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={value ? 'Toggle on' : 'Toggle off'}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.track,
          {
            width: TRACK_WIDTH,
            height: TRACK_HEIGHT,
            backgroundColor: trackColor,
            borderRadius: TRACK_HEIGHT / 2,
            opacity,
          },
          style,
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: THUMB_SIZE,
              height: THUMB_SIZE,
              borderRadius: THUMB_SIZE / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX: thumbPosition }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
};

// ── Styles ───────────────────────────────────────────────────────

const styles = StyleSheet.create({
  track: {
    justifyContent: 'center',
    position: 'relative',
  },
  thumb: {
    position: 'absolute',
    top: THUMB_PADDING,
    left: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default React.memo(Toggle);
export type { ToggleProps };
