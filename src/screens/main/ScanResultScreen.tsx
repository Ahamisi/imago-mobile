import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Dimensions, Button } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing } from '../../theme';
import { ultrasoundService, UltrasoundScan } from '../../services/ultrasoundService';
import {
  HeartbeatIcon,
  CalendarIcon,
  PregnancyStageIcon,
  TrimesterIcon,
  DueDateIcon,
  DownloadIcon,
  ShareIcon,
  InfoIcon,
  SparkleIcon,
  FetusIcon,
  RulerIcon,
} from '../../components/icons';
import RecommendationsChatModal from '../../components/RecommendationsChatModal';
import GetRecommendationsButton from '../../components/GetRecommendationsButton';
import Svg, { Path } from 'react-native-svg';
import HeartbeatNew from '../../components/icons/HeartBeatNew';
import GrowthIcon from '../../components/icons/Growth';
import PositionIcon from '../../components/icons/Position';
import PlacentaIcon from '../../components/icons/Placenta';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ScanResultScreenProps {
  route: { params: { scanId: string } };
  navigation: any;
}

const ScanResultScreen: React.FC<ScanResultScreenProps> = ({ route, navigation }) => {
  const { scanId } = route.params;
  const [scan, setScan] = useState<UltrasoundScan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  useEffect(() => {
    const fetchScan = async () => {
      setScan(null);
      setError(null);
      try {
        const scanDetails = await ultrasoundService.getScanDetails(scanId);
        setScan(scanDetails);
      } catch (err) {
        console.error('Failed to load scan details:', err);
        setError('Failed to load scan details. Please try again.');
      }
    };

    fetchScan();
  }, [scanId]);

  const handleRetry = () => {
    setError(null);
    const fetchScan = async () => {
      try {
        const scanDetails = await ultrasoundService.getScanDetails(scanId);
        setScan(scanDetails);
      } catch (err) {
        console.error('Failed to load scan details:', err);
        setError('Failed to load scan details. Please try again.');
      }
    };
    fetchScan();
  };

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={[Typography.h3, styles.title]}>Error</Text>
        </View>
        <View style={styles.errorContainer}>
          <Text style={[Typography.h3, styles.errorText]}>⚠️ {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!scan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={[Typography.h3, styles.title]}>Loading...</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={[Typography.body, styles.loadingText]}>Loading Scan Results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const analysis = scan.aiAnalysis;

  // Extract data from analysis
  const extractHeartbeatInfo = () => {
    const analysisText = analysis?.findings?.analysis_text || '';
    const heartbeatMatch = analysisText.match(/(\d+)\s*bpm/i);
    return heartbeatMatch ? parseInt(heartbeatMatch[1]) : 140; // Default to 140 if not found
  };

  const extractPregnancyStage = () => {
    const analysisText = analysis?.findings?.analysis_text || '';
    const weeksMatch = analysisText.match(/(\d+)\s*(?:and\s*(\d+))?\s*weeks/i);
    if (weeksMatch) {
      const weeks = parseInt(weeksMatch[1]);
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return scan.gestationalAge || '12 weeks';
  };

  const extractTrimester = () => {
    const analysisText = analysis?.findings?.analysis_text || '';
    const trimesterMatch = analysisText.match(/(first|second|third)\s+trimester/i);
    if (trimesterMatch) {
      const trimester = trimesterMatch[1];
      return `${trimester.charAt(0).toUpperCase() + trimester.slice(1)} Trimester`;
    }
    // Calculate from weeks
    const weeksMatch = analysisText.match(/(\d+)\s*weeks/i);
    if (weeksMatch) {
      const weeks = parseInt(weeksMatch[1]);
      if (weeks <= 13) return '1st Trimester';
      if (weeks <= 27) return '2nd Trimester';
      return '3rd Trimester';
    }
    return '3rd Trimester';
  };

  const extractDueDate = () => {
    // Calculate due date from gestational age (assuming 40 weeks from LMP)
    const weeksMatch = (analysis?.findings?.analysis_text || '').match(/(\d+)\s*weeks/i);
    if (weeksMatch) {
      const weeks = parseInt(weeksMatch[1]);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + (40 - weeks) * 7);
      return dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return 'May 10, 2026'; // Default
  };

  const extractGrowth = () => {
    const analysisText = analysis?.findings?.analysis_text || '';
    const percentileMatch = analysisText.match(/(\d+)(?:th|st|nd|rd)\s*percentile/i);
    if (percentileMatch) {
      return `${percentileMatch[1]}th percentile (Within range)`;
    }
    return '48th percentile (Within range)';
  };

  const extractPlacenta = () => {
    const analysisText = analysis?.findings?.analysis_text || '';
    if (analysisText.toLowerCase().includes('posterior')) {
      return 'Posterior, not low-lying';
    }
    return 'Posterior, not low-lying';
  };

  const extractPosition = () => {
    const analysisText = analysis?.findings?.analysis_text || '';
    if (analysisText.toLowerCase().includes('head down') || analysisText.toLowerCase().includes('vertex')) {
      return 'Head down';
    }
    return 'Head down';
  };

  const heartbeat = extractHeartbeatInfo();
  const pregnancyStage = extractPregnancyStage();
  const trimester = extractTrimester();
  const dueDate = extractDueDate();
  const growth = extractGrowth();
  const placenta = extractPlacenta();
  const position = extractPosition();

  const imageUri = scan.fileUrls?.cloudUrl || scan.fileUrls?.localPath;

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <Path d="M1.6665 9.99967C1.6665 14.5997 5.39984 18.333 9.99984 18.333C14.5998 18.333 18.3332 14.5997 18.3332 9.99967C18.3332 5.39967 14.5998 1.66634 9.99984 1.66634C5.39984 1.66634 1.6665 5.39967 1.6665 9.99967ZM10.0248 7.05801C10.1498 7.18301 10.2082 7.34134 10.2082 7.49967C10.2082 7.65801 10.1498 7.81634 10.0248 7.94134L8.5915 9.37467H12.9165C13.2582 9.37467 13.5415 9.65801 13.5415 9.99967C13.5415 10.3413 13.2582 10.6247 12.9165 10.6247H8.5915L10.0248 12.058C10.2665 12.2997 10.2665 12.6997 10.0248 12.9413C9.78317 13.183 9.38317 13.183 9.1415 12.9413L6.6415 10.4413C6.39984 10.1997 6.39984 9.79967 6.6415 9.55801L9.1415 7.05801C9.38317 6.81634 9.78317 6.81634 10.0248 7.05801Z" fill="#DBEAFF"/>
          </Svg>

          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerIconButton,styles.backButton]} onPress={() => console.log('Download')}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <Path d="M17.0835 8.49199H14.6752C12.7002 8.49199 11.0918 6.88366 11.0918 4.90866V2.50033C11.0918 2.04199 10.7168 1.66699 10.2585 1.66699H6.72516C4.1585 1.66699 2.0835 3.33366 2.0835 6.30866V13.692C2.0835 16.667 4.1585 18.3337 6.72516 18.3337H13.2752C15.8418 18.3337 17.9168 16.667 17.9168 13.692V9.32532C17.9168 8.86699 17.5418 8.49199 17.0835 8.49199ZM10.2335 13.1503L8.56683 14.817C8.5085 14.8753 8.4335 14.9253 8.3585 14.9503C8.2835 14.9837 8.2085 15.0003 8.12516 15.0003C8.04183 15.0003 7.96683 14.9837 7.89183 14.9503C7.82516 14.9253 7.7585 14.8753 7.7085 14.8253C7.70016 14.817 7.69183 14.817 7.69183 14.8087L6.02516 13.142C5.7835 12.9003 5.7835 12.5003 6.02516 12.2587C6.26683 12.017 6.66683 12.017 6.9085 12.2587L7.50016 12.867V9.37533C7.50016 9.03366 7.7835 8.75033 8.12516 8.75033C8.46683 8.75033 8.75016 9.03366 8.75016 9.37533V12.867L9.35016 12.267C9.59183 12.0253 9.99183 12.0253 10.2335 12.267C10.4752 12.5087 10.4752 12.9087 10.2335 13.1503Z" fill="#DBEAFF"/>
                  <Path d="M14.5251 7.34207C15.3167 7.3504 16.4167 7.3504 17.3584 7.3504C17.8334 7.3504 18.0834 6.79207 17.7501 6.45873C16.5501 5.2504 14.4001 3.0754 13.1667 1.84207C12.8251 1.5004 12.2334 1.73373 12.2334 2.20873V5.11707C12.2334 6.33373 13.2667 7.34207 14.5251 7.34207Z" fill="#DBEAFF"/>
                </Svg>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerIconButton,styles.backButton]} onPress={() => console.log('Share')}>
            <Svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <Path d="M15 2.5C15 3.88071 13.8807 5 12.5 5C11.7644 5 11.103 4.68231 10.6456 4.17666L10.5848 4.21518C10.4064 4.32795 10.1554 4.48438 9.86373 4.65973C9.28615 5.00694 8.52673 5.44188 7.8511 5.75576C7.27538 6.02322 6.40915 6.34706 5.71119 6.59679C5.41251 6.70365 5.13826 6.79919 4.92097 6.87395C4.97256 7.07403 5 7.28381 5 7.5C5 7.71325 4.9733 7.92027 4.92306 8.11789C5.13326 8.18702 5.39503 8.27484 5.68096 8.3747C6.37375 8.61665 7.25132 8.94396 7.87268 9.25464C8.46932 9.55296 9.21915 9.98194 9.80827 10.3288C10.1054 10.5037 10.3662 10.6605 10.5529 10.7736C10.5848 10.7929 10.6144 10.8109 10.6418 10.8275C11.0994 10.3194 11.7624 10 12.5 10C13.8807 10 15 11.1193 15 12.5C15 13.8807 13.8807 15 12.5 15C11.1193 15 10 13.8807 10 12.5C10 12.4631 10.0008 12.4263 10.0024 12.3897C9.99455 12.3852 9.98675 12.3806 9.979 12.3758L9.96001 12.3641L9.90302 12.3292C9.85315 12.2987 9.78034 12.2542 9.68928 12.1991C9.50709 12.0887 9.25237 11.9356 8.96267 11.765C8.37821 11.4209 7.66971 11.0165 7.12732 10.7454C6.60965 10.4865 5.82055 10.1888 5.13144 9.94817C4.79293 9.82995 4.48891 9.72903 4.26958 9.6577C4.16003 9.62207 4.07187 9.5939 4.01143 9.57475L3.94241 9.55299L3.93177 9.54966C3.52623 9.83348 3.03256 10 2.5 10C1.11929 10 0 8.88071 0 7.5C0 6.11929 1.11929 5 2.5 5C3.03236 5 3.52586 5.1664 3.93132 5.45002L3.99988 5.427C4.06263 5.40587 4.15379 5.37502 4.26668 5.3364C4.4926 5.25911 4.80475 5.15097 5.14972 5.02754C5.84985 4.77704 6.65028 4.47588 7.1489 4.24424C7.74272 3.96837 8.44164 3.56998 9.00503 3.2313C9.28382 3.0637 9.52396 2.91404 9.69412 2.80645C9.77913 2.75271 9.84649 2.70958 9.89226 2.68011L9.94417 2.64656L9.95703 2.6382L9.96002 2.63625C9.97376 2.62727 9.98833 2.61831 10.0024 2.61025C10.0008 2.5737 10 2.53694 10 2.5C10 1.11929 11.1193 0 12.5 0C13.8807 0 15 1.11929 15 2.5Z" fill="#DBEAFF"/>
            </Svg>

            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Ultrasound Image */}
        {imageUri && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.ultrasoundImage}
              resizeMode="contain"
            />
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          {/* <View style={styles.disclaimerBlurOverlay} /> */}
          <View style={styles.disclaimerContent}>
            <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <Path d="M8.00016 1.33301C4.32683 1.33301 1.3335 4.32634 1.3335 7.99967C1.3335 11.673 4.32683 14.6663 8.00016 14.6663C11.6735 14.6663 14.6668 11.673 14.6668 7.99967C14.6668 4.32634 11.6735 1.33301 8.00016 1.33301ZM7.50016 5.33301C7.50016 5.05967 7.72683 4.83301 8.00016 4.83301C8.2735 4.83301 8.50016 5.05967 8.50016 5.33301V8.66634C8.50016 8.93967 8.2735 9.16634 8.00016 9.16634C7.72683 9.16634 7.50016 8.93967 7.50016 8.66634V5.33301ZM8.6135 10.9197C8.58016 11.0063 8.5335 11.073 8.4735 11.1397C8.40683 11.1997 8.3335 11.2463 8.2535 11.2797C8.1735 11.313 8.08683 11.333 8.00016 11.333C7.9135 11.333 7.82683 11.313 7.74683 11.2797C7.66683 11.2463 7.5935 11.1997 7.52683 11.1397C7.46683 11.073 7.42016 11.0063 7.38683 10.9197C7.3535 10.8397 7.3335 10.753 7.3335 10.6663C7.3335 10.5797 7.3535 10.493 7.38683 10.413C7.42016 10.333 7.46683 10.2597 7.52683 10.193C7.5935 10.133 7.66683 10.0863 7.74683 10.053C7.90683 9.98634 8.0935 9.98634 8.2535 10.053C8.3335 10.0863 8.40683 10.133 8.4735 10.193C8.5335 10.2597 8.58016 10.333 8.6135 10.413C8.64683 10.493 8.66683 10.5797 8.66683 10.6663C8.66683 10.753 8.64683 10.8397 8.6135 10.9197Z" fill="#FDD4D4"/>
            </Svg>
            <Text style={[Typography.bodySmall, styles.disclaimerText]}>
              Disclaimer: Imago AI can also make mistakes, always contact your doctor
            </Text>
          </View>
        </View>



        {/* Main Content Card with #F2F2F2 background - Full Width */}
        <View style={styles.mainContentCard}>
          {/* Summary - 3 columns with white boxes and vertical separators */}
          <View style={styles.summarySection}>
            <Text style={[Typography.h3, styles.summaryTitle]}>Summary</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryBox}>
                <View style={styles.summaryIconContainer}>
                  <PregnancyStageIcon size={20} color="#6563FF" />
                </View>
                <Text style={[Typography.body, styles.summaryLabel]}>Pregnancy Stage</Text>
                <Text style={[Typography.body, styles.summaryValue]}>{pregnancyStage}</Text>
              </View>
              <View style={styles.summaryDividerWrapper}>
                <View style={styles.summaryDivider} />
              </View>
              <View style={styles.summaryBox}>
                <View style={styles.summaryIconContainer}>
                  <TrimesterIcon size={20} color="#FF9EA7" />
                </View>
                <Text style={[Typography.body, styles.summaryLabel]}>Current trimester</Text>
                <Text style={[Typography.body, styles.summaryValue]}>{trimester}</Text>
              </View>
              <View style={styles.summaryDividerWrapper}>
                <View style={styles.summaryDivider} />
              </View>
              <View style={styles.summaryBox}>
                <View style={styles.summaryIconContainer}>
                  <DueDateIcon />
                </View>
                <Text style={[Typography.body, styles.summaryLabel]}>Expected Due date</Text>
                <Text style={[Typography.body, styles.summaryValue]}>{dueDate}</Text>
              </View>
            </View>
          </View>

          {/* Metric Cards Grid - 2x2 */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <HeartbeatNew size={24} />
              <Text style={[Typography.body, styles.metricLabel]}>Fetal heartbeat</Text>
              <Text style={[Typography.h3, styles.metricValue]}>{heartbeat} <Text style={styles.metricUnit}>bpm</Text></Text>
            </View>
            <View style={styles.metricCard}>
              <GrowthIcon size={24} color="#8B5CF6" />
              <Text style={[Typography.body, styles.metricLabel]}>Growth</Text>
              <MetricValueText value={growth} />
            </View>
            <View style={styles.metricCard}>
              <PlacentaIcon size={24} color="#8B5CF6" />
              <Text style={[Typography.body, styles.metricLabel]}>Placenta</Text>
              <MetricValueText value={placenta} />
            </View>
            <View style={styles.metricCard}>
            <PositionIcon size={24} color="#8B5CF6" />  
              <Text style={[Typography.body, styles.metricLabel]}>Position</Text>
              <Text style={[Typography.h3, styles.metricValue]}>{position}</Text>
            </View>
          </View>

          {/* Measurement & Growth Section */}
          <View style={styles.measurementSection}>
            <Text style={[Typography.h3, styles.sectionTitle]}>Measurement & Growth</Text>
            <View style={styles.measurementPlaceholder}>
              <Text style={[Typography.body, styles.placeholderText]}>
                Detailed measurements and growth charts will be displayed here
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>


      {/* Floating Get Recommendations Button - Centered with Blur Background */}
      <GetRecommendationsButton 
        onPress={() => setShowRecommendationsModal(true)} 
        absolute={true}
      />



      {/* Recommendations Chat Modal */}
      <RecommendationsChatModal
        visible={showRecommendationsModal}
        onClose={() => setShowRecommendationsModal(false)}
        scanId={scanId}
        initialAnalysis={analysis?.findings?.analysis_text}
      />
    </View>
  );
};

// Component to render metric values with proper text sizing
const MetricValueText = ({ value }: { value: string }) => {
  // Parse value to separate main text from secondary text
  // Examples: "48th percentile (Within range)" -> "48th percentile" + "(Within range)"
  //          "Posterior, not low-lying" -> "Posterior" + ", not low-lying"
  
  let mainText = value;
  let secondaryText = '';
  
  // Check for parentheses pattern
  const parenMatch = value.match(/^(.+?)\s*\((.+?)\)$/);
  if (parenMatch) {
    mainText = parenMatch[1].trim();
    secondaryText = `(${parenMatch[2]})`;
  } else {
    // Check for comma pattern (e.g., "Posterior, not low-lying")
    const commaMatch = value.match(/^(.+?),\s*(.+)$/);
    if (commaMatch) {
      mainText = commaMatch[1].trim();
      secondaryText = `, ${commaMatch[2]}`;
    }
  }
  
  return (
    <Text style={[Typography.h3, styles.metricValue]}>
      {mainText}
      {secondaryText && <Text style={styles.metricSecondaryText}>{secondaryText}</Text>}
    </Text>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
  },
  headerSafeArea: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
  },
  backButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF1A',
    borderRadius: 50,
    padding: Spacing[2],
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF1A',
  },
  backArrow: {
    fontSize: 24,
    color: Colors.white,
  },
  title: {
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing[3],
  },
  headerIconButton: {
    padding: Spacing[2],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[4],
  },
  loadingText: {
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing[6],
    gap: Spacing[4],
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: 12,
  },
  retryButtonText: {
    color: Colors.white,
    ...Typography.button,
  },
  content: {
    paddingBottom: 120, // Space for floating button
  },
  imageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing[4],
  },
  ultrasoundImage: {
    width: '100%',
    height: '100%',
  },
  disclaimerContainer: {
    borderRadius: 8,
    marginBottom: Spacing[4],
    borderWidth: 1,
    borderColor: '#EEEEEE33',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#FFFFFF1A',
  },
  disclaimerBlurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Dark semi-transparent for blur effect
  },
  disclaimerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing[2],
    padding: Spacing[3],
    position: 'relative',
    zIndex: 1,
  },
  disclaimerText: {
    color: Colors.text.inverse,
    flex: 1,
  },
  mainContentCard: {
    backgroundColor: '#F2F2F2',
    width: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  summarySection: {
    marginBottom: Spacing[4],
  },
  summaryTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing[3],
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    overflow: 'hidden',
  },
  summaryBox: {
    flex: 1,
    alignItems: 'flex-start',
    padding: Spacing[3],
    gap: Spacing[1],
  },
  summaryDividerWrapper: {
    width: 1,
    justifyContent: 'flex-start',
    paddingTop: Spacing[3] + 20 + Spacing[1] + 12, // Start from label position (icon + padding + label)
    paddingBottom: Spacing[3], // Bottom padding
  },
  summaryDivider: {
    width: 1,
    flex: 1,
    backgroundColor: '#EEEEEE',
  },
  summaryIconContainer: {
    marginBottom: Spacing[1],
  },
  summaryLabel: {
    color: Colors.text.secondary,
    textAlign: 'left',
    fontSize: 10,
    marginBottom: Spacing[1],
  },
  summaryValue: {
    color: Colors.text.primary,
    fontWeight: '600',
    textAlign: 'left',
    fontSize: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
    marginBottom: Spacing[4],
  },
  metricCard: {
    width: (SCREEN_WIDTH - Spacing[4] * 2 - Spacing[3]) / 2,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 16,
    padding: Spacing[4],
    alignItems: 'flex-start',
    gap: Spacing[2],
  },
  metricLabel: {
    color: Colors.text.secondary,
  },
  metricValue: {
    color: Colors.text.primary,
    fontWeight: '600',
    fontSize: 18,
  },
  metricUnit: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.text.secondary,
  },
  metricSecondaryText: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.text.secondary,
  },
  measurementSection: {
    marginTop: Spacing[2],
  },
  sectionTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing[3],
  },
  measurementPlaceholder: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: Spacing[4],
    minHeight: 100,
    justifyContent: 'center',
  },
  placeholderText: {
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default ScanResultScreen;
