import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors, Typography, Spacing } from '../theme';

interface GetRecommendationsButtonProps {
  onPress: () => void;
  absolute?: boolean;
}

const GetRecommendationsButton: React.FC<GetRecommendationsButtonProps> = ({ onPress, absolute = false }) => {
  const containerStyle = absolute ? [styles.container, styles.absoluteContainer] : styles.container;
  
  return (
    <View style={containerStyle}>
      {absolute && <View style={styles.blurBackground} />}
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <Path d="M3.28346 6.14977C3.05788 5.47301 2.52682 4.94196 1.85006 4.71637C1.16131 4.48679 1.16131 3.51256 1.85006 3.28297C2.52682 3.05739 3.05788 2.52633 3.28346 1.84958C3.51305 1.16082 4.48728 1.16082 4.71686 1.84958C4.94245 2.52633 5.4735 3.05739 6.15026 3.28297C6.83902 3.51256 6.83902 4.48679 6.15026 4.71637C5.4735 4.94196 4.94245 5.47301 4.71686 6.14977C4.48728 6.83853 3.51305 6.83853 3.28346 6.14977Z" fill="white"/>
          <Path d="M8.74594 13.7623C8.35116 12.578 7.42182 11.6487 6.23749 11.2539C5.03216 10.8521 5.03216 9.14722 6.23749 8.74545C7.42182 8.35067 8.35116 7.42133 8.74594 6.237C9.14771 5.03168 10.8526 5.03168 11.2544 6.237C11.6492 7.42133 12.5785 8.35067 13.7628 8.74545C14.9682 9.14722 14.9682 10.8521 13.7628 11.2539C12.5785 11.6487 11.6492 12.578 11.2544 13.7623C10.8526 14.9677 9.14771 14.9677 8.74594 13.7623Z" fill="white"/>
        </Svg>
        <Text style={styles.buttonText}>Get Recommendations</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    width: '100%',
  },
  absoluteContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacing[6],
    paddingTop: Spacing[4],
    zIndex: 1000,
    elevation: 1000,
  },
  blurBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(242, 242, 242, 0.9)',
  },
  button: {
    borderRadius: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing[2],
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[5],
    backgroundColor: '#1177A8', // Using the lighter gradient color as solid background
  },
  buttonText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 16,
  },
});

export default GetRecommendationsButton;

