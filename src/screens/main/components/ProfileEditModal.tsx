import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Colors, Typography, Spacing, BorderRadius } from '../../../theme';
import { CalendarIcon } from '../../../components/icons';
import { UserProfile } from '../../../services/profileService';

interface ProfileEditModalProps {
  visible: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSave: (data: { fullName: string; phoneNumber: string; lastPeriodDate?: string }) => void;
}

const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  visible,
  profile,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [lastPeriodDate, setLastPeriodDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && profile) {
      console.log('Pre-filling profile data:', profile);
      console.log('Full name from profile:', profile.fullName);
      console.log('Phone number from profile:', profile.phoneNumber);
      console.log('Email from profile:', profile.email);
      
      setFullName(profile.fullName || '');
      setPhoneNumber(profile.phoneNumber || '');
      setEmail(profile.email || '');

      
      if (profile.pregnancyInfo?.lmpDate) {
        // Parse the date string properly to avoid timezone issues
        const dateStr = profile.pregnancyInfo.lmpDate;
        const [year, month, day] = dateStr.split('-').map(Number);
        const parsedDate = new Date(year, month - 1, day); // month is 0-indexed
        setLastPeriodDate(parsedDate);
      } else {
        setLastPeriodDate(new Date());
      }
      
      console.log('State after setting:', {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        email: profile.email
      });
    }
  }, [visible, profile]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        lastPeriodDate: lastPeriodDate.toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).replace(/\//g, '-');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Profile</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.field}>
              <Text style={styles.label}>Full name</Text>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Phone number</Text>
              <TextInput
                style={styles.input}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={email}
                editable={false}
                placeholder="Email address"
                keyboardType="email-address"
              />
              <Text style={styles.helperText}>Email cannot be changed</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>When was your last period?</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(lastPeriodDate)}</Text>
                <CalendarIcon size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, loading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          date={lastPeriodDate}
          onConfirm={(date) => {
            setLastPeriodDate(date);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
          maximumDate={new Date()}
        />
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
  cancelButton: {
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
  },
  form: {
    paddingTop: Spacing[6],
    gap: Spacing[6],
  },
  field: {
    gap: Spacing[2],
  },
  label: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    fontWeight: '600' as const,
  },
  input: {
    ...Typography.body,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.white,
  },
  disabledInput: {
    backgroundColor: Colors.gray[50],
    color: Colors.text.secondary,
  },
  helperText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray[300],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    backgroundColor: Colors.white,
  },
  dateText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  footer: {
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  saveButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    ...Typography.button,
    color: Colors.white,
    fontWeight: '600' as const,
  },
});

export default ProfileEditModal;
