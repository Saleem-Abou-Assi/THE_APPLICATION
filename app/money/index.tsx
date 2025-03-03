import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Modal, TouchableWithoutFeedback, ScrollView } from 'react-native';
import { createIncome, createPayment, initMoney, useBox } from '../../src/crud/money';
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
  const box = useBox();
  const [modalVisible, setModalVisible] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [traderModalVisible, setTraderModalVisible] = useState(false);
  const [traderSearchQuery, setTraderSearchQuery] = useState<string>('');

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

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTraders = traders.filter(trader =>
    trader.name.toLowerCase().includes(traderSearchQuery.toLowerCase())
  );

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
        className="p-2 bg-gray-200 rounded-md border mb-3 "
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      {type === 'income' && (
       <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
          <Text
            className="p-2 bg-gray-200 rounded-md border mb-3 "
          >
            {customerId ? customers.find(c => c.id === customerId)?.name : 'Select Customer ▼'} 
          </Text>
        </TouchableWithoutFeedback>
      )}

      {type === 'payment' && (
        <TouchableWithoutFeedback onPress={() => setTraderModalVisible(true)}>
          <Text
            className="p-2 bg-gray-200 rounded-md border mb-3 "
          >
            {traderId ? traders.find(t => t.id === traderId)?.name : 'Select Trader ▼'}
          </Text>
        </TouchableWithoutFeedback>
      )}

      <TextInput
         className="p-2 bg-gray-200 rounded-md border mb-3 "
        placeholder="Note"
        value={note}
        onChangeText={setNote}
      />

      <Button title="Submit" onPress={handleSubmit} />

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
              <TextInput
                ref={searchInputRef}
                className="bg-gray-200 p-2 rounded-md mb-4"
                placeholder="Search Customer"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <ScrollView>
                {filteredCustomers.map(customer => (
                  <TouchableWithoutFeedback
                    key={customer.id}
                    onPress={() => {
                      setCustomerId(customer.id);
                      setModalVisible(false);
                    }}
                  >
                    <Text className='p-4'>{customer.name}</Text>
                  </TouchableWithoutFeedback>
                ))}
              </ScrollView>
              <Button
                title="Close"
                onPress={() => setModalVisible(false)}
                color='red'
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={traderModalVisible}
        onRequestClose={() => setTraderModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setTraderModalVisible(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
            <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
              <TextInput
                className="bg-gray-200 p-2 rounded-md mb-4"
                placeholder="Search Trader"
                value={traderSearchQuery}
                onChangeText={setTraderSearchQuery}
              />
              <ScrollView>
                {filteredTraders.map(trader => (
                  <TouchableWithoutFeedback
                    key={trader.id}
                    onPress={() => {
                      setTraderId(trader.id);
                      setTraderModalVisible(false);
                    }}
                  >
                    <Text className='p-4'>{trader.name}</Text>
                  </TouchableWithoutFeedback>
                ))}
              </ScrollView>
              <Button
                title="Close"
                onPress={() => setTraderModalVisible(false)}
                color='red'
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
