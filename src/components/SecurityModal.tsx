import * as SecureStore from 'expo-secure-store';
import { Alert, Modal, TextInput, View, Text, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';

// List of allowed passcodes
const ALLOWED_PASSCODES = [
  'ABOHADI2003',
  'EHAB2003',
];

const LAST_VERIFICATION_KEY = 'last_security_verification';

export const useSecurityCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [passcode, setPasscode] = useState('');

  useEffect(() => {
    checkSecurityVerification();
  }, []);

  const checkSecurityVerification = async () => {
    try {
      const lastVerificationStr = await SecureStore.getItemAsync(LAST_VERIFICATION_KEY);
      if (!lastVerificationStr) {
        setShowModal(true);
        return;
      }
      // ... rest of verification logic
    } catch (error) {
      console.error('Error checking security verification:', error);
      setShowModal(true);
    }
  };

  const handleVerification = async () => {
    if (ALLOWED_PASSCODES.includes(passcode)) {
      await SecureStore.setItemAsync(LAST_VERIFICATION_KEY, JSON.stringify(new Date()));
      setShowModal(false);
      setPasscode('');
    } else {
      Alert.alert('Access Denied', 'Incorrect passcode. The app will now close.');
    }
  };

  const SecurityModal = () => (
    <Modal
      transparent={true}
      visible={showModal}
      animationType="slide"
      onRequestClose={() => {
        Alert.alert('Verification Required', 'You must verify to use the app.');
      }}
    >
      {/* ... rest of modal JSX ... */}
    </Modal>
  );

  return { SecurityModal };
}; 