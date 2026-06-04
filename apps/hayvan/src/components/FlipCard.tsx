import React, { useRef, useEffect } from 'react';
import {
  Animated,
  TouchableOpacity,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Colors, BorderRadius, Shadows } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;
const CARD_HEIGHT = CARD_WIDTH * 1.55;

interface FlipCardProps {
  isFlipped: boolean;
  onFlip?: () => void;
  front: React.ReactNode;
  back: React.ReactNode;
  accentColor?: string;
}

export function FlipCard({ isFlipped, onFlip, front, back, accentColor = Colors.gold }: FlipCardProps) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isFlipped]);

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [1, 1, 0, 0],
  });

  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 0.5, 1],
    outputRange: [0, 0, 1, 1],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onFlip}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      disabled={isFlipped}
    >
      <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
        <Animated.View
          style={[
            styles.card,
            styles.front,
            {
              borderColor: accentColor,
              transform: [{ rotateY: frontRotate }],
              opacity: frontOpacity,
            },
          ]}
        >
          {front}
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.back,
            {
              borderColor: accentColor,
              transform: [{ rotateY: backRotate }],
              opacity: backOpacity,
            },
          ]}
        >
          {back}
        </Animated.View>

        <Animated.View
          style={[
            styles.glow,
            {
              backgroundColor: accentColor,
              opacity: flipAnim.interpolate({
                inputRange: [0, 0.3, 1],
                outputRange: [0, 0.15, 0],
              }),
            },
          ]}
          pointerEvents="none"
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  card: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    backfaceVisibility: 'hidden',
    overflow: 'hidden',
    backgroundColor: Colors.backgroundCard,
    ...Shadows.card,
  },
  front: {},
  back: {},
  glow: {
    position: 'absolute',
    width: '120%',
    height: '120%',
    top: '-10%',
    left: '-10%',
    borderRadius: BorderRadius.xl * 1.2,
    zIndex: -1,
  },
});

export { CARD_WIDTH, CARD_HEIGHT };
