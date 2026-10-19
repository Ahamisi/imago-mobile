import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  StatusBar,
  Easing,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Colors, Typography, Spacing} from '../../theme';
import {CloseIcon} from '../../components/icons';

interface TipSlide {
  id: string;
  image?: string;
  backgroundColor?: string;
  title: string;
  content: string;
  duration?: number;
  isTextOnly?: boolean;
}

interface Tip {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  slides: TipSlide[];
}

interface TipStoryViewerProps {
  route: {params: {tip: Tip}};
  navigation: any;
}

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const DEFAULT_DURATION = 5;

const TipStoryViewer: React.FC<TipStoryViewerProps> = ({route, navigation}) => {
  const {tip} = route.params;
  const slides = tip.slides && tip.slides.length ? tip.slides : [];

  const [index, setIndex] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);
  const pausedAt = useRef(0);
  const heldRef = useRef(false);

  const durationMs = useCallback(
    (i: number) => (slides[i]?.duration || DEFAULT_DURATION) * 1000,
    [slides],
  );

  // Preload every image up front so slide transitions never flash a blank frame.
  useEffect(() => {
    slides.forEach(s => {
      if (s.image) {
        Image.prefetch(s.image).catch(() => {});
      }
    });
    StatusBar.setBarStyle('light-content');
    return () => StatusBar.setBarStyle('dark-content');
  }, [slides]);

  const goNext = useCallback(() => {
    animRef.current?.stop();
    if (index < slides.length - 1) {
      progress.setValue(0);
      setIndex(index + 1);
    } else {
      navigation.goBack();
    }
  }, [index, slides.length, navigation, progress]);

  const goPrev = useCallback(() => {
    animRef.current?.stop();
    if (index > 0) {
      progress.setValue(0);
      setIndex(index - 1);
    } else {
      progress.setValue(0);
      setIndex(0);
    }
  }, [index, progress]);

  // Play the current slide from `from` (0..1), covering the remaining time.
  const play = useCallback(
    (from: number) => {
      progress.setValue(from);
      animRef.current = Animated.timing(progress, {
        toValue: 1,
        duration: durationMs(index) * (1 - from),
        easing: Easing.linear,
        useNativeDriver: false,
      });
      animRef.current.start(({finished}) => {
        if (finished) {
          goNext();
        }
      });
    },
    [index, durationMs, progress, goNext],
  );

  useEffect(() => {
    play(0);
    return () => animRef.current?.stop();
    // Restart whenever the slide changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const handlePressIn = () => {
    heldRef.current = false;
    progress.stopAnimation(v => {
      pausedAt.current = v;
    });
  };

  const handleLongPress = () => {
    heldRef.current = true; // suppress the tap-navigation on release
  };

  const handlePressOut = () => {
    play(pausedAt.current);
  };

  const handleTap = (side: 'left' | 'right') => {
    if (heldRef.current) return; // was a hold-to-pause, not a tap
    if (side === 'left') {
      goPrev();
    } else {
      goNext();
    }
  };

  const slide = slides[index];
  if (!slide) {
    return <View style={styles.container} />;
  }
  const showImage = !!slide.image && !slide.isTextOnly;
  const isCover = index === 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Background */}
      {showImage ? (
        <Image source={{uri: slide.image}} style={styles.background} resizeMode="cover" />
      ) : (
        <View
          style={[
            styles.background,
            {backgroundColor: slide.backgroundColor || Colors.primary[500]},
          ]}
        />
      )}

      {/* Top + bottom gradients for legibility */}
      <LinearGradient
        colors={['rgba(0,0,0,0.55)', 'rgba(0,0,0,0)']}
        style={styles.topScrim}
        pointerEvents="none"
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.9)']}
        style={styles.bottomScrim}
        pointerEvents="none"
      />

      {/* Tap zones (left = prev, right = next; hold = pause) */}
      <Pressable
        style={[styles.zone, styles.leftZone]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={200}
        onPress={() => handleTap('left')}
      />
      <Pressable
        style={[styles.zone, styles.rightZone]}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={handleLongPress}
        delayLongPress={200}
        onPress={() => handleTap('right')}
      />

      {/* Progress bars */}
      <SafeAreaView style={styles.top} pointerEvents="box-none">
        <View style={styles.progressRow}>
          {slides.map((_, i) => (
            <View key={i} style={styles.barBg}>
              <Animated.View
                style={[
                  styles.barFill,
                  {
                    width:
                      i < index
                        ? '100%'
                        : i === index
                        ? progress.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0%', '100%'],
                          })
                        : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        <Pressable
          style={styles.close}
          onPress={() => navigation.goBack()}
          hitSlop={16}>
          <CloseIcon size={22} color={Colors.white} />
        </Pressable>
      </SafeAreaView>

      {/* Content */}
      <SafeAreaView style={styles.content} pointerEvents="none">
        {isCover ? (
          <>
            <Text style={styles.coverTitle}>{slide.title}</Text>
            {!!slide.content && <Text style={styles.coverSubtitle}>{slide.content}</Text>}
          </>
        ) : (
          <>
            {!!slide.title && <Text style={styles.textTitle}>{slide.title}</Text>}
            <Text style={styles.bodyText}>{slide.content}</Text>
          </>
        )}
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.black},
  background: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  topScrim: {position: 'absolute', top: 0, left: 0, right: 0, height: 160},
  bottomScrim: {position: 'absolute', left: 0, right: 0, bottom: 0, height: '55%'},
  zone: {position: 'absolute', top: 0, bottom: 0, zIndex: 5},
  leftZone: {left: 0, width: SCREEN_WIDTH * 0.35},
  rightZone: {right: 0, width: SCREEN_WIDTH * 0.65},
  top: {position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20},
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[3],
    paddingTop: Spacing[2],
    gap: 4,
  },
  barBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {height: '100%', backgroundColor: Colors.white, borderRadius: 2},
  close: {alignSelf: 'flex-end', padding: Spacing[3], marginRight: Spacing[2]},
  content: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing[6],
    paddingBottom: Spacing[10],
    zIndex: 10,
  },
  coverTitle: {
    ...Typography.h1,
    color: Colors.white,
    fontWeight: '800',
    fontSize: 30,
    lineHeight: 38,
    marginBottom: Spacing[3],
  },
  coverSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 17,
    lineHeight: 24,
  },
  textTitle: {
    ...Typography.h3,
    color: Colors.white,
    fontWeight: '700',
    marginBottom: Spacing[2],
  },
  bodyText: {
    color: Colors.white,
    fontSize: 21,
    lineHeight: 30,
    fontWeight: '500',
  },
});

export default TipStoryViewer;
