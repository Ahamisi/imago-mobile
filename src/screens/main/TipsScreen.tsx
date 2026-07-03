import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  FlatList,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { SearchIcon } from '../../components/icons';
import { getWeeklyTips, getLibraryTips } from '../../services/deliveriesService';

interface Tip {
  id: string;
  title: string;
  category: string;
  coverImage: string;
  slides: TipSlide[];
  isNew?: boolean;
}

interface TipSlide {
  id: string;
  image?: string; // Optional - for image slides
  backgroundColor?: string; // Optional - for text-only slides
  title: string;
  content: string;
  duration?: number; // in seconds
  isTextOnly?: boolean; // Flag for text-only slides
}

interface TipsScreenProps {
  navigation: any;
}

// Category ids match the backend ContentTopic.category taxonomy so tabs map to
// real, source-backed library content. 'trending' shows the weekly delivery.
const CATEGORIES = [
  { id: 'trending', label: 'Trending now' },
  { id: 'baby_dev', label: 'Baby' },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'antenatal_care', label: 'Antenatal' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'mental_health', label: 'Mental Health' },
  { id: 'wellness', label: 'Wellness' },
  { id: 'warning_signs', label: 'Warning Signs' },
];

// Mock data - will be replaced with backend data
const MOCK_TIPS: Tip[] = [
  {
    id: '1',
    title: 'Eat iron-rich foods today',
    category: 'nutrition',
    coverImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop',
    isNew: true,
    slides: [
      {
        id: '1-1',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
        title: 'Early Signs of Pregnancy & What They Mean',
        content: 'Understanding the first signs of pregnancy can help you prepare for the journey ahead.',
        duration: 5
      },
      {
        id: '1-2', 
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=600&fit=crop',
        title: 'Eat iron-rich foods today, like beans, fish or leafy greens',
        content: 'Your baby needs iron to grow strong blood. And you need it to fight tiredness and dizziness.\n\nAdd iron-rich foods to your meals today, like:\n• Beans\n• Leafy greens (like ugu or spinach)\n• Fish',
        duration: 8
      }
    ]
  },
  {
    id: '2',
    title: 'Safe pregnancy exercises',
    category: 'exercise',
    coverImage: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop',
    isNew: true,
    slides: [
      {
        id: '2-1',
        backgroundColor: '#0E5DD8', // Imago blue
        title: 'Safe Exercises During Pregnancy',
        content: 'Gentle exercises that are safe and beneficial for you and your baby throughout pregnancy.',
        duration: 6,
        isTextOnly: true
      },
      {
        id: '2-2',
        backgroundColor: '#10B981', // Green variant
        title: 'Prenatal Yoga & Stretching',
        content: 'Simple yoga poses and stretches to help:\n\n• Reduce back pain\n• Improve flexibility\n• Prepare for labor\n• Better sleep quality\n\nAlways consult your doctor before starting any exercise routine.',
        duration: 8,
        isTextOnly: true
      },
      {
        id: '2-3',
        backgroundColor: '#8B5CF6', // Purple variant
        title: 'Walking & Swimming',
        content: 'Low-impact exercises perfect for pregnancy:\n\n• Walking 30 minutes daily\n• Swimming (excellent full-body workout)\n• Water aerobics\n• Light strength training\n\nListen to your body and stay hydrated!',
        duration: 8,
        isTextOnly: true
      }
    ]
  },
  {
    id: '3',
    title: 'Managing pregnancy anxiety',
    category: 'mental-health',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    slides: [
      {
        id: '3-1',
        backgroundColor: '#6366F1', // Indigo
        title: 'Managing Pregnancy Anxiety',
        content: 'It\'s completely normal to feel anxious during pregnancy. You\'re not alone in these feelings.',
        duration: 6,
        isTextOnly: true
      },
      {
        id: '3-2',
        backgroundColor: '#EC4899', // Pink
        title: 'Breathing & Relaxation',
        content: 'Simple techniques that help:\n\n• Deep breathing (4-7-8 method)\n• Progressive muscle relaxation\n• Mindfulness meditation\n• Gentle prenatal yoga\n\nPractice daily for best results.',
        duration: 8,
        isTextOnly: true
      },
      {
        id: '3-3',
        backgroundColor: '#F59E0B', // Amber
        title: 'When to Seek Help',
        content: 'Contact your healthcare provider if you experience:\n\n• Persistent worry or fear\n• Panic attacks\n• Difficulty sleeping\n• Loss of appetite\n\nProfessional support is available and helpful.',
        duration: 8,
        isTextOnly: true
      }
    ]
  },
  {
    id: '4',
    title: 'Early pregnancy signs',
    category: 'wellness',
    coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    slides: [
      {
        id: '4-1',
        image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=600&fit=crop',
        title: 'Early Signs of Pregnancy',
        content: 'Learn about the common early signs and what they mean for your pregnancy journey.',
        duration: 6
      }
    ]
  },
  {
    id: '5',
    title: 'Staying hydrated during pregnancy',
    category: 'nutrition',
    coverImage: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=300&fit=crop',
    slides: [
      {
        id: '5-1',
        image: 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400&h=600&fit=crop',
        title: 'Hydration is Key',
        content: 'Staying properly hydrated supports your baby\'s development and helps prevent common pregnancy discomforts.',
        duration: 6
      },
      {
        id: '5-2',
        image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&h=600&fit=crop',
        title: 'How Much Water Should You Drink?',
        content: 'Aim for 8-10 glasses of water daily:\n• Helps prevent constipation\n• Reduces swelling\n• Prevents dehydration\n• Supports healthy blood pressure\n\nAdd lemon or cucumber for variety!',
        duration: 8
      }
    ]
  },
  {
    id: '6',
    title: 'Building your support network',
    category: 'mental-health',
    coverImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=300&fit=crop',
    slides: [
      {
        id: '6-1',
        image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=600&fit=crop',
        title: 'You Don\'t Have to Do This Alone',
        content: 'Building a strong support network is crucial for your mental health during pregnancy and beyond.',
        duration: 6
      }
    ]
  }
];

const TipsScreen: React.FC<TipsScreenProps> = ({ navigation }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [featuredTip, setFeaturedTip] = useState<Tip | null>(null);

  useEffect(() => {
    loadContent('trending');
  }, []);

  const loadContent = async (category: string) => {
    try {
      setLoading(true);
      if (category === 'trending') {
        // "Trending" = the mother's precomputed weekly delivery (CMS spec §10).
        const weeklyTips = await getWeeklyTips();
        if (weeklyTips.length > 0) {
          setTips(weeklyTips);
          setFeaturedTip(weeklyTips[0]);
        } else {
          // No delivery yet — sample content so the screen isn't empty.
          setTips(MOCK_TIPS);
          setFeaturedTip(MOCK_TIPS[0]);
        }
      } else {
        // Category tab = browse the evergreen, source-backed library.
        const libraryTips = await getLibraryTips(category);
        setTips(libraryTips);
        setFeaturedTip(null); // no featured card when browsing a category
      }
    } catch (error) {
      console.error('Failed to load content:', error);
      if (category === 'trending') {
        setTips(MOCK_TIPS);
        setFeaturedTip(MOCK_TIPS[0]);
      } else {
        setTips([]);
        setFeaturedTip(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTipPress = (tip: Tip) => {
    navigation.navigate('TipStoryViewer', { tip });
  };

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    loadContent(categoryId);
  };

  const renderFeaturedTip = () => {
    if (!featuredTip) return null;

    return (
      <TouchableOpacity 
        style={styles.featuredCard}
        onPress={() => handleTipPress(featuredTip)}
      >
        <Image 
          source={{ uri: featuredTip.coverImage }} 
          style={styles.featuredImage}
        />
        <View style={styles.featuredOverlay}>
          <Text style={styles.featuredTitle}>{featuredTip.title}</Text>
          <Text style={styles.featuredSubtitle}>Your baby needs it</Text>
        </View>
        <View style={styles.progressDots}>
          {featuredTip.slides.map((_, index) => (
            <View 
              key={index} 
              style={[
                styles.progressDot, 
                index === 0 && styles.progressDotActive
              ]} 
            />
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategoryTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesContainer}
      contentContainerStyle={styles.categoriesContent}
    >
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryTab,
            selectedCategory === category.id && styles.categoryTabActive
          ]}
          onPress={() => handleCategoryPress(category.id)}
        >
          <Text style={[
            styles.categoryText,
            selectedCategory === category.id && styles.categoryTextActive
          ]}>
            {category.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderTipCard = ({ item }: { item: Tip }) => (
    <TouchableOpacity 
      style={styles.tipCard}
      onPress={() => handleTipPress(item)}
    >
      <Image 
        source={{ uri: item.coverImage }} 
        style={styles.tipImage}
      />
      <Text style={styles.tipTitle}>{item.title}</Text>
      {item.isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>NEW</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tips</Text>
          <TouchableOpacity>
            <SearchIcon size={24} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading tips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tips</Text>
        <TouchableOpacity>
          <SearchIcon size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderFeaturedTip()}
        {renderCategoryTabs()}
        
        <FlatList
          data={tips}
          renderItem={renderTipCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.tipsGrid}
          columnWrapperStyle={styles.tipsRow}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[2],
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.secondary,
  },
  featuredCard: {
    marginHorizontal: Spacing[6],
    marginBottom: Spacing[6],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    height: 200,
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: Spacing[4],
  },
  featuredTitle: {
    ...Typography.h3,
    color: Colors.white,
    marginBottom: Spacing[1],
  },
  featuredSubtitle: {
    ...Typography.body,
    color: Colors.white,
    opacity: 0.9,
  },
  progressDots: {
    position: 'absolute',
    top: Spacing[4],
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing[1],
  },
  progressDot: {
    width: 40,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
  },
  progressDotActive: {
    backgroundColor: '#CFDE3A', // Yellow color from your screenshots
  },
  categoriesContainer: {
    marginBottom: Spacing[4],
  },
  categoriesContent: {
    paddingHorizontal: Spacing[6],
    gap: Spacing[2],
  },
  categoryTab: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing[2],
  },
  categoryTabActive: {
    backgroundColor: Colors.primary[100],
  },
  categoryText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  categoryTextActive: {
    color: Colors.primary[600],
    fontWeight: '600' as const,
  },
  tipsGrid: {
    paddingHorizontal: Spacing[6],
  },
  tipsRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing[4],
  },
  tipCard: {
    width: '48%',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    position: 'relative',
  },
  tipImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  tipTitle: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    padding: Spacing[3],
    fontWeight: '500' as const,
  },
  newBadge: {
    position: 'absolute',
    top: Spacing[2],
    right: Spacing[2],
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: BorderRadius.sm,
  },
  newBadgeText: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600' as const,
  },
});

export default TipsScreen;
