import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../../src/crud/cutomers';
import { Customer } from '../../src/entity/Customers';
import { useRouter } from 'expo-router';

const Customers: React.FC = () => {
  const [records, setRecords] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  const [balance, setBalance] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchData = () => {
      getRecords((data) => {
      
        setRecords(data);
      });
    };
    fetchData();
  }, []);
useEffect(() => {
        const filtered = records.filter(records =>
            records.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredItems(filtered);
    }, [searchQuery, records]);


  const handleCreateOrUpdate = () => {
    if (editingId) {
      updateRecord(editingId, name, line, balance);
    } else {
      const s = createRecord(name, line, balance);
    
    }
    setName('');
    setLine('');
    setBalance(0);
    setEditingId(null);
    getRecords((data) => {
      setRecords(data);
    });
  };

  const handleEdit = (record: Customer) => {
    setName(record.name);
    setLine(record.line);
    setBalance(record.balance);
    setEditingId(record.id);
    
  };

  const handleDelete = (id: number) => {
    deleteRecord(id);
    getRecords((data) => {
      setRecords(data);
    });
  };

  return (
   
      <View className='flex-1 w-[100%] items-center'>
        <View className='w-[95%] bg-white shadow-slate-700 p-2 m-5 grid grid-rows-4 gap-y-3 rounded-lg'>
          <View className='flex-row-reverse items-center'>
            <Text className='w-20 text-center font-bold '>الاسم:</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} className='w-[80%] bg-gray-100 rounded-lg'/>
          </View>
          <View className='flex-row-reverse items-center'>
            <Text className='font-bold text-center w-20'>الخط:</Text>
          <TextInput placeholder="Line" value={line} onChangeText={setLine} className='w-[80%] bg-gray-100 rounded-lg'/>
          </View>
          <View className='flex-row-reverse items-center'>
              <Text className='font-bold text-center w-20'>الرصيد:</Text>
          <TextInput 
            placeholder="Balance" 
            value={String(balance)} 
            onChangeText={text => setBalance(Number(text))} 
            keyboardType="numeric" 
            className='w-[80%] bg-gray-100 rounded-lg'
          />
          </View>
          <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />
        </View>
        
            <KeyboardAvoidingView keyboardVerticalOffset={100}
            behavior="padding" className='flex-1 w-full items-center'>
        <View className='w-[95%] flex-1 flex-col gap-y-3 bg-white rounded-lg h-fit'>
          <View className=''>
            <TextInput
              className="bg-gray-200 p-2 rounded-md mb-4"
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View className='flex-1 flex-row max-h-8 items-end justify-center'>
            <View className='w-[25%] items-start pl-3'><Text className='font-bold text-lg'> الاسم</Text></View>
            <View className='w-[25%] items-start'><Text className='font-bold text-lg'> الخط</Text></View>
            <View className='w-[35%] pl-5'><Text className='font-bold text-lg'> Action</Text></View>
          </View>
          <View className='h-0.5 bg-gray-500 w-full'></View>
 <ScrollView>
          {filteredItems.map((record) => (
           
            <View key={record.id} className='flex-1 flex-row gap-x-2 items-center justify-center max-h-10 my-2 '>
              <View className='w-[20%] items-center'><Text>{record.name}</Text></View>
              <View className='w-[20%] items-center'><Text>{record.line}</Text></View>
              <View>
                <TouchableOpacity 
                  className='w-11 p-2 bg-[#FCa311] rounded-sm cursor-pointer h-10'
                  onPress={() => handleEdit(record)}><Text>Edit</Text></TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity className='w-15 bg-red-700 p-2 rounded-sm h-10' onPress={() => handleDelete(record.id)}>
                  <Text className='text-white font-bold w-12'>Delete</Text></TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity 
                  className='w-15 bg-blue-700 p-2 rounded-sm h-10' 
                  onPress={() => {
                    router.push({
                      pathname: '/customer/details',
                      params: { customerId: record.id }
                    });
                  }}
                >
                  <Text className='text-white font-bold'>Details</Text></TouchableOpacity>
              </View>
            </View>
          ))}
          </ScrollView>
        </View>
          </KeyboardAvoidingView>
      </View>
   
  );
};

export default Customers;