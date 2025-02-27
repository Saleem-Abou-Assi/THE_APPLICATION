import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../../src/crud/traders'; // Updated import
import { Traders } from '../../src/entity/Traders'; // Assuming you have a Traders entity similar to Item
import { useRouter } from 'expo-router';

const TradersComponent: React.FC = () => { // Updated component name
  const [records, setRecords] = useState<Traders[]>([]); // Updated type
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = () => {
      getRecords((data) => {
       
        setRecords(data);
      });
    };
    fetchData();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (editingId) {
      await updateRecord(editingId, name, balance); // Updated parameters
    } else {
      await createRecord(name, balance); // Updated parameters
    }
    setName('');
    setBalance(0);
    setEditingId(null);
    getRecords((data) => {
      setRecords(data);
    });
  };

  const handleEdit = (record: Traders) => { // Updated type
    setName(record.name);
    setBalance(record.balance); // Updated state
    setEditingId(record.id);
  };

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    getRecords((data) => {
      setRecords(data);
    });
  };

  const filteredItems = records.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <View className='flex-1 w-[100%] items-center'>
        <View className='w-[85%] bg-white shadow-slate-700 p-2 m-5 grid grid-rows-4 gap-y-3 rounded-lg'>
          <TextInput placeholder="Name" value={name} onChangeText={setName} />
          <TextInput 
            placeholder="Balance" 
            value={String(balance)} 
            onChangeText={text => setBalance(Number(text))} 
            keyboardType="numeric" 
          />
          <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />
        </View>

        <View className='w-[85%] flex-1 flex-col gap-y-3 bg-white rounded-lg h-fit'>
          <View className=''>
            <TextInput
              className="bg-gray-200 p-2 rounded-md mb-4"
              placeholder="Search items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View className='flex-1 flex-row max-h-8 items-end justify-center'>
            <View className='w-[25%] items-start pl-1'><Text className='font-bold text-lg'>Name</Text></View>
            <View className='w-[25%] items-start'><Text className='font-bold text-lg'>Balance</Text></View>
            <View className='w-[35%] items-center'><Text className='font-bold text-lg'>Action</Text></View>
          </View>
          <View className='h-0.5 bg-gray-500 w-full'></View>

          {filteredItems.map((record) => (
            <View key={record.id} className='flex-1 flex-row gap-x-8 items-center justify-center max-h-9 my-2'>
              <View className='w-[20%] items-start'><Text>{record.name}</Text></View>
              <View className='w-[20%]'><Text>{record.balance}</Text></View>
              <View>
                <TouchableOpacity 
                  className='w-fit h-9 p-2 bg-[#FCa311] rounded-sm cursor-pointer'
                  onPress={() => handleEdit(record)}><Text>Edit</Text></TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity className='w-fit max-w-fit h-9 bg-red-700 p-2 rounded-sm' onPress={() => handleDelete(record.id)}>
                  <Text className='text-white font-bold'>Delete</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TouchableOpacity 
                  className='w-fit h-9 p-2 bg-blue-500 rounded-sm'
                  onPress={() => {
                    router.push({
                      pathname: '/traders/details',
                      params: { traderId : record.id }
                    });
                  }}>
                  <Text className='text-white'>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default TradersComponent; // Updated export