import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';

interface HelpModalProps {
  visible: boolean;
  onClose: () => void;
}

const EmailIcon = () => (
  <View style={styles.helpIcon}>
    <Text style={styles.helpIconText}>📧</Text>
  </View>
);

const WhatsAppIcon = () => (
  <View style={[styles.helpIcon, styles.whatsappIcon]}>
    <Text style={styles.helpIconText}>💬</Text>
  </View>
);

const HelpModal: React.FC<HelpModalProps> = ({ visible, onClose }) => {
  const handleEmailPress = async () => {
    const email = 'support@imagomum.com';
    const subject = 'Support Request';
    const body = 'Hi Imago Team,\n\nI need help with:\n\n';
    
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onClose();
      } else {
        Alert.alert(
          'Email Not Available', 
          'Please send an email to support@imagomum.com manually.'
        );
      }
    } catch (error) {
      console.error('Failed to open email:', error);
      Alert.alert('Error', 'Failed to open email app');
    }
  };

  const handleWhatsAppPress = async () => {
    const phoneNumber = '+2348012345678'; // Replace with actual support number
    const message = 'Hi Imago Team, I need help with the app.';
    
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        onClose();
      } else {
        // Try web WhatsApp
        const webSupported = await Linking.canOpenURL(webUrl);
        if (webSupported) {
          await Linking.openURL(webUrl);
          onClose();
        } else {
          Alert.alert(
            'WhatsApp Not Available', 
            'Please install WhatsApp or contact us via email.'
          );
        }
      }
    } catch (error) {
      console.error('Failed to open WhatsApp:', error);
      Alert.alert('Error', 'Failed to open WhatsApp');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Get Help</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.subtitle}>
            We're here to help! Choose how you'd like to contact us:
          </Text>

          <View style={styles.options}>
            <TouchableOpacity style={styles.option} onPress={handleEmailPress}>
              <EmailIcon />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Send us an Email</Text>
                <Text style={styles.optionSubtitle}>
                  Get detailed support via email
                </Text>
              </View>
              <Text style={styles.optionChevron}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={handleWhatsAppPress}>
              <WhatsAppIcon />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Message us on WhatsApp</Text>
                <Text style={styles.optionSubtitle}>
                  Quick support via WhatsApp chat
                </Text>
              </View>
              <Text style={styles.optionChevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Support Hours</Text>
            <Text style={styles.infoText}>
              Monday - Friday: 9:00 AM - 6:00 PM (WAT)
            </Text>
            <Text style={styles.infoText}>
              Saturday: 10:00 AM - 4:00 PM (WAT)
            </Text>
            <Text style={styles.infoText}>
              Sunday: Closed
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>What to Include</Text>
            <Text style={styles.infoText}>
              • Your account email address
            </Text>
            <Text style={styles.infoText}>
              • Description of the issue
            </Text>
            <Text style={styles.infoText}>
              • Screenshots (if applicable)
            </Text>
            <Text style={styles.infoText}>
              • Steps to reproduce the problem
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  closeButton: {
    ...Typography.body,
    color: Colors.primary[500],
  },
  title: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[6],
  },
  subtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing[8],
    lineHeight: 24,
  },
  options: {
    gap: Spacing[4],
    marginBottom: Spacing[8],
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
  },
  helpIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  whatsappIcon: {
    backgroundColor: Colors.secondary[100],
  },
  helpIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: Spacing[1],
  },
  optionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  optionChevron: {
    ...Typography.h3,
    color: Colors.text.secondary,
    fontWeight: '300' as const,
  },
  infoSection: {
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.md,
    padding: Spacing[4],
    marginBottom: Spacing[4],
  },
  infoTitle: {
    ...Typography.bodySmall,
    color: Colors.text.primary,
    fontWeight: '700' as const,
    marginBottom: Spacing[2],
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: Spacing[1],
  },
});

export default HelpModal;
