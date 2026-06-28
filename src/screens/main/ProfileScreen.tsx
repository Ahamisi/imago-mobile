import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import { profileService, UserProfile } from '../../services/profileService';
import { authService } from '../../services/authService';
import { handleGlobalLogout } from '../../services/navigationService';
import ProfileEditModal from './components/ProfileEditModal';
import SecurityModal from './components/SecurityModal';
import HelpModal from './components/HelpModal';
import ProfileSuccessModal from './components/ProfileSuccessModal';

import { ProfileUserIcon, SecurityIcon, HelpIcon, LogoutIcon, PregnancyStageIcon, TrimesterIcon, DueDateIcon, EditIcon } from '../../components/icons';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await profileService.getUserProfile();
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updatedData: any) => {
    try {
      await profileService.updateProfile(updatedData);
      await loadProfile(); // Reload profile data
      setShowEditModal(false);
      setSuccessMessage('Your profile has been updated');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handlePasswordChange = async (passwordData: any) => {
    try {
      await profileService.changePassword(passwordData);
      setShowSecurityModal(false);
      setSuccessMessage('Your password has been updated');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Failed to change password:', error);
      Alert.alert('Error', 'Failed to change password. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Logging out...');
              
              // Call the auth service logout (which calls the API endpoint)
              await authService.logout();
              
              // Show success message briefly
              setSuccessMessage('You have been logged out successfully');
              setShowSuccessModal(true);
              
              // After a short delay, trigger global logout navigation
              setTimeout(() => {
                setShowSuccessModal(false);
                handleGlobalLogout();
              }, 1500);
              
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load profile</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={styles.headerTitle}>My Profile</Text>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../../assets/avatar-placeholder.png')}
              style={styles.avatar}
            />
            <View style={styles.verificationBadge}>
              <Text style={styles.verificationText}>✓</Text>
            </View>
          </View>
          <Text style={styles.userName}>{profile.fullName}</Text>
        </View>

        {/* Pregnancy Info */}
        <View style={styles.pregnancySection}>
          <View style={styles.pregnancyHeader}>
            <Text style={styles.pregnancyTitle}>About your pregnancy</Text>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <View style={styles.editIcon}>
                <EditIcon size={14} color={Colors.primary[500]} />
              </View>
            </TouchableOpacity>
          </View>

          {profile.pregnancyInfo ? (
            <View style={styles.pregnancyInfo}>
              <View style={styles.pregnancyColumn}>
                <PregnancyStageIcon size={16} color={Colors.primary[500]} />
                <Text style={styles.pregnancyLabel}>Pregnancy Stage</Text>
                <Text style={styles.pregnancyValue}>{profile.pregnancyInfo.gestationalAge}</Text>
              </View>
              <View style={styles.pregnancyColumn}>
                <TrimesterIcon size={16} color={Colors.primary[500]} />
                <Text style={styles.pregnancyLabel}>Current trimester</Text>
                <Text style={styles.pregnancyValue}>{profile.pregnancyInfo.trimester}</Text>
              </View>
              <View style={styles.pregnancyColumn}>
                <DueDateIcon size={16} color={Colors.primary[500]} />
                <Text style={styles.pregnancyLabel}>Expected Due date:</Text>
                <Text style={styles.pregnancyValue}>{profile.pregnancyInfo.eddFormatted}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.noPregnancyInfo}>
              <Text style={styles.noPregnancyText}>No pregnancy information available</Text>
              <TouchableOpacity 
                style={styles.addPregnancyButton}
                onPress={() => setShowEditModal(true)}
              >
                <Text style={styles.addPregnancyButtonText}>Add Pregnancy Info</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsTitle}>Settings</Text>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowEditModal(true)}
          >
            <View style={styles.settingIcon}>
              <ProfileUserIcon size={20} color={Colors.text.secondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Profile</Text>
              <Text style={styles.settingSubtitle}>Edit your name and pregnancy details</Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowSecurityModal(true)}
          >
            <View style={styles.settingIcon}>
              <SecurityIcon size={20} color={Colors.text.secondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Security</Text>
              <Text style={styles.settingSubtitle}>Update your password</Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setShowHelpModal(true)}
          >
            <View style={styles.settingIcon}>
              <HelpIcon size={20} color={Colors.text.secondary} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Get help</Text>
              <Text style={styles.settingSubtitle}>Get support or send feedbacks</Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleLogout}
          >
            <View style={[styles.settingIcon, styles.logoutIcon]}>
              <LogoutIcon size={20} color="#FF0000" />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.logoutText]}>Log Out</Text>
              <Text style={styles.settingSubtitle}>Sign out of your account</Text>
            </View>
            <Text style={styles.settingChevron}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modals */}
      <ProfileEditModal
        visible={showEditModal}
        profile={profile}
        onClose={() => setShowEditModal(false)}
        onSave={handleProfileUpdate}
      />

      <SecurityModal
        visible={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onSave={handlePasswordChange}
      />

      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      <ProfileSuccessModal
        visible={showSuccessModal}
        title="Successful"
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing[6],
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing[4],
    paddingHorizontal: Spacing[4],
  },
  errorText: {
    ...Typography.body,
    color: Colors.error,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary[500],
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    ...Typography.button,
    color: Colors.white,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[8],
    marginTop: Spacing[4],
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: Spacing[8],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing[4],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[200],
  },
  verificationBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  verificationText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  userName: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  pregnancySection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing[6],
    marginBottom: Spacing[6],
  },
  pregnancyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  pregnancyTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
  },
  editIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pregnancyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing[2],
  },
  pregnancyColumn: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing[2],
  },
  pregnancyLabel: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  pregnancyValue: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  noPregnancyInfo: {
    alignItems: 'center',
    gap: Spacing[4],
    paddingVertical: Spacing[6],
  },
  noPregnancyText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center' as const,
  },
  addPregnancyButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
  },
  addPregnancyButtonText: {
    ...Typography.bodySmall,
    color: Colors.white,
    fontWeight: '600' as const,
  },
  settingsSection: {
    marginBottom: Spacing[8],
  },
  settingsTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing[4],
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  logoutIcon: {
    backgroundColor: '#FFDDDD',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600' as const,
    marginBottom: Spacing[1],
  },
  logoutText: {
    color: Colors.error,
  },
  settingSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  settingChevron: {
    ...Typography.h3,
    color: Colors.text.secondary,
    fontWeight: '300' as const,
  },
});

export default ProfileScreen;
