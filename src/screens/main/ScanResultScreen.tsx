import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing } from '../../theme';
import { ultrasoundService, UltrasoundScan } from '../../services/ultrasoundService';
import {
  CloseIcon,
  HeartbeatIcon,
  RulerIcon,
  CalendarIcon,
  BabyIcon,
  DueDateIcon,
  DownloadIcon,
  ShareIcon,
  InfoIcon,
  RecommendationIcon,
  CheckIcon,
  MoreIcon,
} from '../../components/icons';
import Button from '../../components/ui/Button';

interface ScanResultScreenProps {
  route: { params: { scanId: string } };
  navigation: any;
}

const ScanResultScreen: React.FC<ScanResultScreenProps> = ({ route, navigation }) => {
  const { scanId } = route.params;
  const [scan, setScan] = useState<UltrasoundScan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScan = async () => {
      // Reset state on new scanId
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
    // Re-trigger the fetch
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
  const isHeartbeatNormal = analysis?.fetalHeartbeat?.status === 'normal';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={[Typography.h3, styles.title]}>Scan Result</Text>
        <TouchableOpacity style={styles.moreButton}>
          <MoreIcon />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.detailsContainer}>
          <DetailRow
            icon={<CalendarIcon />}
            label="Scan Date"
            value={analysis?.scanDate ? new Date(analysis.scanDate).toLocaleString('en-US', { 
                month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true 
            }) : 'N/A'}
          />
          <DetailRow
            icon={<HeartbeatIcon />}
            label="Fetal Heartbeat:"
            value={`${analysis?.fetalHeartbeat?.value || 'N/A'} bpm`}
            valueStyle={isHeartbeatNormal ? styles.normalText : styles.abnormalText}
            status={isHeartbeatNormal ? '(Normal)' : '(Abnormal)'}
            statusStyle={isHeartbeatNormal ? styles.normalText : styles.abnormalText}
            showCheckmark={isHeartbeatNormal}
          />
          <DetailRow
            icon={<RulerIcon />}
            label="Fetal Size:"
            value={`${analysis?.fetalSize?.value || 'N/A'} ${analysis?.fetalSize?.unit || ''}`}
          />
          <DetailRow
            icon={<BabyIcon />}
            label="Estimated Gestational Age:"
            value={analysis?.gestationalAge?.formatted || 'N/A'}
          />
          <DetailRow
            icon={<BabyIcon />}
            label="Fetal Position:"
            value={analysis?.fetalPosition || 'N/A'}
          />
          <DetailRow
            icon={<DueDateIcon />}
            label="EDD (Estimated Due Date):"
            value={analysis?.edd?.formatted || 'N/A'}
          />
        </View>

        <LinearGradient
          colors={['#E0F7FA', '#E8F5E9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.recommendationGradient}
        >
          <View style={styles.recommendationContainer}>
            <View style={styles.recommendationHeader}>
              <RecommendationIcon />
              <Text style={[Typography.body, styles.recommendationTitle]}>Recommendations</Text>
            </View>
            <Text style={[Typography.body, styles.recommendationText]}>
              {analysis?.healthStatus || 'Fetus is healthy and aligned with expected development. No anomaly detected.'}{' '}
              {analysis?.recommendations?.map(rec => `"${rec}"`).join(' ') || '"Drink plenty of water. Schedule your next scan in 2 weeks."'}
            </Text>
            <TouchableOpacity>
              <Text style={[Typography.bodySmall, styles.linkText]}>
                Click to get more recommendations
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <View style={styles.disclaimerContainer}>
          <InfoIcon />
          <Text style={[Typography.bodySmall, styles.disclaimerText]}>
            Disclaimer: Imago AI can also make mistakes, always contact your doctor
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Download Report"
          variant="secondary"
          icon={<DownloadIcon color="#1997D4" />}
          onPress={() => {
            // TODO: Implement download functionality
            console.log('Download report pressed');
          }}
        />
        <Button
          title="Share with Doctor"
          variant="primary"
          icon={<ShareIcon color={Colors.white} />}
          onPress={() => {
            // TODO: Implement share functionality
            console.log('Share with doctor pressed');
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const DetailRow = ({ icon, label, value, status, valueStyle, statusStyle, showCheckmark }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  status?: string;
  valueStyle?: object;
  statusStyle?: object;
  showCheckmark?: boolean;
}) => (
  <View style={styles.detailRow}>
    <View style={styles.detailLabel}>
      {icon}
      <Text style={[Typography.body, styles.labelText]}>{label}</Text>
    </View>
    <View style={styles.valueContainer}>
      <Text style={[Typography.body, styles.valueText, valueStyle]}>{value}</Text>
      {status && <Text style={[Typography.body, styles.statusText, statusStyle]}> {status}</Text>}
      {showCheckmark && <CheckIcon />}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  backButton: {
    paddingRight: Spacing[4],
  },
  backArrow: {
    fontSize: 24,
    color: Colors.text.primary,
  },
  title: {
    color: Colors.text.primary,
    flex: 1,
    textAlign: 'center',
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
    padding: Spacing[6],
  },
  detailsContainer: {
    marginBottom: Spacing[6],
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    // borderBottomWidth: 1,
    // borderBottomColor: Colors.gray[100],
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
  },
  labelText: {
    color: Colors.text.secondary,
  },
     valueContainer: {
     flexDirection: 'row',
     alignItems: 'center',
     gap: Spacing[2],
   },
  valueText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  statusText: {
    fontWeight: 'normal',
  },
  normalText: {
    color: '#2E7D32', // A suitable green color
  },
  abnormalText: {
    color: Colors.error,
  },
  recommendationGradient: {
    borderRadius: 16,
    padding: 2, // This creates the border effect
    marginBottom: Spacing[4],
  },
     recommendationContainer: {
     backgroundColor: '#F5FCFF',
     borderRadius: 14, // Slightly smaller to show the gradient border
     padding: Spacing[4],
   },
  recommendationHeader: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing[4],
    marginBottom: Spacing[2],

  },
  recommendationTitle: {
    color: Colors.text.primary,
  },
  recommendationText: {
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  linkText: {
    color: Colors.primary[500],
    textDecorationLine: 'underline',
    marginTop: Spacing[2],
  },
  disclaimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[2],
    padding: Spacing[4],
    backgroundColor: Colors.gray[50],
    borderRadius: 8,
  },
  disclaimerText: {
    color: Colors.text.secondary,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    padding: Spacing[6],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
    gap: Spacing[4],
  },

  moreButton: {
    paddingLeft: Spacing[4],
  },
});

export default ScanResultScreen; 