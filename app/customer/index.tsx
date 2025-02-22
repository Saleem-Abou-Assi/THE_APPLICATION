import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import RecoredList from '../../components/Customer';
import Button from '@/components/Button';


export default function App() {
  
  return (
    <View style={styles.container}>
      <RecoredList />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
