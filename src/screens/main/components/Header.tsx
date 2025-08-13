import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../../theme';
import { BellIcon } from '../../../components/icons/BellIcon';

interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image 
          source={require('../../../assets/avatar-placeholder.png')}
          style={styles.avatar}
        />
        <View>
          <Text style={[Typography.body, styles.greeting]}>Hi {userName},</Text>
          <Text style={[Typography.body, styles.prompt]}>What would you like to do?</Text>
        </View>
      </View>
      <TouchableOpacity>
        <BellIcon />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[6],
    paddingTop: Spacing[10],
    paddingBottom: Spacing[4],
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: Spacing[4],
  },
  greeting: {
    color: Colors.text.secondary,
  },
  prompt: {
    color: Colors.text.primary,
  },
});

export default Header;
