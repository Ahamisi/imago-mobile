/**
 * Personalization Screen for Onboarding
 * Asks for the user's last menstrual period to personalize their experience.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Picker } from '@react-native-picker/picker';
import Modal from 'react-native-modal';

import { Colors, Typography, Spacing, BorderRadius } from '../../theme';
import CalendarIcon from '../../components/icons/CalendarIcon';

interface UserData {
  fullName: string;
}

interface PersonalizationScreenProps {
  user: UserData;
  onCompleteSetup: (payload: { answerType: 'exact_date' | 'approximate_month'; answer: string | { month: number; year: number } }) => void;
}

const PersonalizationScreen: React.FC<PersonalizationScreenProps> = ({
  user,
  onCompleteSetup,
}) => {
  const [date, setDate] = useState(new Date());
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isApproximatePickerVisible, setApproximatePickerVisibility] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const formattedDate = date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).replace(/\//g, '-');

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const showApproximatePicker = () => setApproximatePickerVisibility(true);
  const hideApproximatePicker = () => setApproximatePickerVisibility(false);

  const handleConfirmDate = (selectedDate: Date) => {
    const dateToSet = selectedDate || new Date();
    hideDatePicker();
    setDate(dateToSet);
    onCompleteSetup({
      answerType: 'exact_date',
      answer: dateToSet.toISOString().split('T')[0],
    });
  };

  const handleSubmit = (type: 'exact' | 'approximate') => {
    if (type === 'approximate') {
      onCompleteSetup({
        answerType: 'approximate_month',
        answer: { month: selectedMonth, year: selectedYear },
      });
      hideApproximatePicker();
    } else {
      // This branch is now handled by onConfirm from the picker
      showDatePicker();
    }
  };
  
  const years = Array.from({length: 2}, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({length: 12}, (_, i) => i + 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[Typography.h2, styles.title]}>Let's personalize your pregnancy care.</Text>
      </View>
      
      <View style={styles.welcomeSection}>
        <Image 
          source={require('../../assets/avatar-placeholder.png')} 
          style={styles.avatar} 
        />
        <Text style={[Typography.h3, styles.welcomeText]}>Welcome, {user.fullName.split(' ')[0]} 👋</Text>
        <Text style={[Typography.body, styles.welcomeSubtext]}>
          We are happy to have you here. Kindly let us know you better
        </Text>
      </View>

      <View style={styles.form}>
        <Text style={[Typography.bodySmall, styles.label]}>When was your last period?</Text>
        <TouchableOpacity style={styles.dateInput} onPress={showDatePicker}>
          <Text style={[Typography.body, styles.dateText]}>{formattedDate}</Text>
          <CalendarIcon />
        </TouchableOpacity>
        <TouchableOpacity onPress={showApproximatePicker}>
          <Text style={[Typography.bodySmall, styles.notSureText]}>Not sure?</Text>
        </TouchableOpacity>
      </View>

      {/* Exact Date Picker Modal */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        date={date}
        onConfirm={handleConfirmDate}
        onCancel={hideDatePicker}
        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      />

      <Modal 
        isVisible={isApproximatePickerVisible}
        onBackdropPress={hideApproximatePicker}
        style={styles.bottomModal}
      >
        <View style={styles.modalContent}>
          <Text style={[Typography.h3, styles.modalTitle]}>Select a Month</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedMonth}
              style={styles.picker}
              itemStyle={[Typography.body, styles.pickerItem]}
              onValueChange={(itemValue: number) => setSelectedMonth(itemValue)}
            >
              {months.map((m) => (
                <Picker.Item key={m} label={new Date(0, m - 1).toLocaleString('default', { month: 'long' })} value={m} />
              ))}
            </Picker>
          </View>
          <TouchableOpacity style={styles.modalButton} onPress={() => handleSubmit('approximate')}>
            <Text style={[Typography.button, styles.modalButtonText]}>Continue</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.footer}>
        {/* This button is no longer needed as selection is handled in the pickers */}
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing[6],
    paddingTop: Platform.OS === 'ios' ? 60 : Spacing[10],
  },
  header: {
    marginBottom: Spacing[8],
  },
  title: {
    color: Colors.text.primary,
  },
  welcomeSection: {
    alignItems: 'center',
    marginVertical: Spacing[8],
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: Spacing[4],
  },
  welcomeText: {
    color: Colors.text.primary,
  },
  welcomeSubtext: {
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing[2],
  },
  form: {
    marginBottom: Spacing[6],
  },
  label: {
    color: Colors.text.secondary,
    marginBottom: Spacing[2],
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    paddingHorizontal: Spacing[4],
    height: 52,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  dateText: {
    color: Colors.text.primary,
  },
  notSureText: {
    color: Colors.primary[500],
    marginTop: Spacing[3],
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing[10],
  },
  // Approximate Picker Modal Styles
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: Colors.white,
    padding: Spacing[6],
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: Spacing[4],
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    // Typography.body is already applied in itemStyle
  },
  modalButton: {
    backgroundColor: Colors.primary[500],
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[4],
  },
  modalButtonText: {
    color: Colors.white,
  },
});


export default PersonalizationScreen; 