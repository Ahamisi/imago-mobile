import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../../theme';
import { CloseIcon } from '../../components/icons';

interface TipSlide {
  id: string;
  image?: string; // Optional - for image slides
  backgroundColor?: string; // Optional - for text-only slides
  title: string;
  content: string;
  duration?: number;
  isTextOnly?: boolean; // Flag for text-only slides
}

interface Tip {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  slides: TipSlide[];
}

interface TipStoryViewerProps {
  route: { params: { tip: Tip } };
  navigation: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds default

const TipStoryViewer: React.FC<TipStoryViewerProps> = ({ route, navigation }) => {
  const { tip } = route.params;
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  
  const progressAnimations = useRef(
    tip.slides.map(() => new Animated.Value(0))
  ).current;
  const currentAnimation = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    StatusBar.setBackgroundColor('transparent', true);
    
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  useEffect(() => {
    startProgress();
    return () => {
      if (currentAnimation.current) {
        currentAnimation.current.stop();
      }
    };
  }, [currentSlideIndex, isPaused]);

  const startProgress = () => {
    if (isPaused || isPressed) return;

    const currentSlide = tip.slides[currentSlideIndex];
    const duration = (currentSlide.duration || 5) * 1000;

    currentAnimation.current = Animated.timing(
      progressAnimations[currentSlideIndex],
      {
        toValue: 1,
        duration,
        useNativeDriver: false,
      }
    );

    currentAnimation.current.start(({ finished }) => {
      if (finished && !isPaused) {
        nextSlide();
      }
    });
  };

  const pauseProgress = () => {
    setIsPaused(true);
    if (currentAnimation.current) {
      currentAnimation.current.stop();
    }
  };

  const resumeProgress = () => {
    setIsPaused(false);
    setIsPressed(false);
  };

  const nextSlide = () => {
    if (currentSlideIndex < tip.slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
      // Reset previous progress bars
      progressAnimations.forEach((anim, index) => {
        if (index <= currentSlideIndex) {
          anim.setValue(index < currentSlideIndex ? 1 : 0);
        }
      });
    } else {
      // End of story
      navigation.goBack();
    }
  };

  const previousSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
      // Reset progress bars
      progressAnimations.forEach((anim, index) => {
        if (index >= currentSlideIndex - 1) {
          anim.setValue(index < currentSlideIndex - 1 ? 1 : 0);
        }
      });
    } else {
      navigation.goBack();
    }
  };

  const handleTapGesture = (event: any) => {
    const { x } = event.nativeEvent;
    const isLeftSide = x < SCREEN_WIDTH / 2;
    
    if (isLeftSide) {
      previousSlide();
    } else {
      nextSlide();
    }
  };

  const handlePressIn = () => {
    setIsPressed(true);
    pauseProgress();
  };

  const handlePressOut = () => {
    setIsPressed(false);
    resumeProgress();
  };

  const currentSlide = tip.slides[currentSlideIndex];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Background - Either Image or Solid Color */}
      {currentSlide.isTextOnly ? (
        <View style={[styles.backgroundSolid, { backgroundColor: currentSlide.backgroundColor || Colors.primary[500] }]} />
      ) : (
        <Image 
          source={{ uri: currentSlide.image }} 
          style={styles.backgroundImage}
        />
      )}
      
      {/* Dark Overlay - Only for image slides */}
      {!currentSlide.isTextOnly && <View style={styles.overlay} />}

      {/* Progress Bars */}
      <SafeAreaView style={styles.progressContainer}>
        <View style={styles.progressBars}>
          {tip.slides.map((_, index) => (
            <View key={index} style={styles.progressBarBackground}>
              <Animated.View
                style={[
                  styles.progressBarFill,
                  {
                    width: progressAnimations[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </View>
          ))}
        </View>
      </SafeAreaView>

      {/* Close Button - Outside SafeAreaView */}
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      >
        <CloseIcon size={24} color={Colors.white} />
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        <View style={currentSlide.isTextOnly ? styles.contentTextOnly : styles.contentGradient}>
          <Text style={currentSlide.isTextOnly ? styles.titleTextOnly : styles.title}>
            {currentSlide.title}
          </Text>
          {currentSlide.content && (
            <Text style={currentSlide.isTextOnly ? styles.descriptionTextOnly : styles.description}>
              {currentSlide.content}
            </Text>
          )}
        </View>
      </View>

      {/* Invisible Touch Areas */}
      <TouchableOpacity
        style={[styles.touchArea, styles.leftTouchArea]}
        onPress={handleTapGesture}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      />
      <TouchableOpacity
        style={[styles.touchArea, styles.rightTouchArea]}
        onPress={handleTapGesture}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backgroundSolid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  progressBars: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    gap: Spacing[1],
  },
  progressBarBackground: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.white,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 60, // Fixed position below status bar
    right: Spacing[4],
    padding: Spacing[2],
    zIndex: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  content: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  contentGradient: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: Spacing[6],
    paddingBottom: Spacing[8],
  },
  contentTextOnly: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[8],
    paddingTop: 100, // Account for progress bars and close button
    paddingBottom: Spacing[12],
  },
  title: {
    ...Typography.h2,
    color: Colors.white,
    marginBottom: Spacing[3],
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  description: {
    ...Typography.body,
    color: Colors.white,
    lineHeight: 24,
    opacity: 0.95,
  },
  titleTextOnly: {
    ...Typography.h1,
    color: Colors.white,
    marginBottom: Spacing[6],
    fontWeight: '800' as const,
    lineHeight: 40,
    textAlign: 'center',
  },
  descriptionTextOnly: {
    ...Typography.h3,
    color: Colors.white,
    lineHeight: 28,
    textAlign: 'center',
    opacity: 0.95,
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 5,
  },
  leftTouchArea: {
    left: 0,
  },
  rightTouchArea: {
    right: 0,
  },
});

export default TipStoryViewer;
