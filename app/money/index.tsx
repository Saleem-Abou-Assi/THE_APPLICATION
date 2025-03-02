import React, { useState ,useEffect } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import { createIncome, createPayment, initMoney } from '../../src/crud/money';
import { Customer } from '@/src/entity/Customers';
import {Traders} from '@/src/entity/Traders';


const MoneyPage = () => {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'payment'>('income');
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [traderId, setTraderId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [traders, setTraders] = useState<Traders[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
        try {
            const { customers, traders } = await initMoney();
            setCustomers(customers as Customer[]);
            setTraders(traders as Traders[]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);


  const handleSubmit = async () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      if (type === 'income') {
        await createIncome(numericAmount, customerId, note);
        alert('Income added successfully!');
      } else {
        await createPayment(numericAmount, traderId, note);
        alert('Payment added successfully!');
      }
      // Clear form
      setAmount('');
      setNote('');
      setCustomerId(null);
      setTraderId(null);
    } catch (error) {
      alert('Error occurred while saving');
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Money Management</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Income"
          onPress={() => setType('income')}
          color={type === 'income' ? 'green' : 'gray'}
        />
        <View style={styles.buttonSpacer} />
        <Button
          title="Payment"
          onPress={() => setType('payment')}
          color={type === 'payment' ? 'red' : 'gray'}
        />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {type === 'income' && (
        
        <TextInput
          style={styles.input}
          placeholder="Customer ID (optional)"
          keyboardType="numeric"
          value={customerId?.toString() || ''}
          onChangeText={(text) => setCustomerId(text ? parseInt(text) : null)}
        />
      )}

      {type === 'payment' && (
        // display the modal of the search to show Traders
        <TextInput
          style={styles.input}
          placeholder="Trader ID (optional)"
          keyboardType="numeric"
          value={traderId?.toString() || ''}
          onChangeText={(text) => setTraderId(text ? parseInt(text) : null)}
        />
      )}

      <TextInput
        style={styles.input}
        placeholder="Note"
        value={note}
        onChangeText={setNote}
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  buttonSpacer: {
    width: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
});

export default MoneyPage;
