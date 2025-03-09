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
      transparent={false}
      visible={showModal}
      animationType="fade"
      onRequestClose={() => {
        Alert.alert('Verification Required', 'You must verify to use the app.');
      }}
    >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
          <Text>Enter Passcode</Text>
          <TextInput
            secureTextEntry={true}
            placeholder="Passcode"
            value={passcode}
            onChangeText={setPasscode}
            style={{ borderWidth: 1, padding: 10, marginVertical: 10, borderRadius: 5 }}
          />
          <TouchableOpacity onPress={handleVerification} style={{ backgroundColor: 'blue', padding: 10, borderRadius: 5, alignItems: 'center' }}>
            <Text style={{ color: 'white' }}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return { SecurityModal };
}; 