import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Alert } from 'react-native';
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

  const handleEdit = (record: Traders) => {
    Alert.alert(
      "تحذير!",
      "هل حقاً تريد التعديل على هذا العنصر؟",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: () => {
            setName(record.name);
            setBalance(record.balance);
            setEditingId(record.id);
          }
        }
      ]
    );
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this record?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "OK", onPress: async () => {
            await deleteRecord(id);
            getRecords((data) => {
              setRecords(data);
            });
          }
        }
      ]
    );
  };

  const filteredItems = records.filter((record) =>
    record.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    
      <View className='flex-1 w-[100%] items-center'>
        <View className='w-[100%] bg-white shadow-slate-700 p-2 m-5 grid grid-rows-4 gap-y-3 rounded-lg'>
          <View className='flex-row-reverse items-center '>
            <Text className='text-center font-bold w-20'>الاسم:</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} className='w-[80%] h-12 bg-gray-100 rounded-lg ' />
          </View>
          <View className='flex-row-reverse items-center'>
          <Text className='text-center font-bold w-20'>الرصيد:</Text>
          <TextInput 
            placeholder="Balance" 
            value={String(balance)} 
            onChangeText={text => setBalance(Number(text))} 
            keyboardType="numeric" 
            className='w-[80%] h-12 bg-gray-100 rounded-lg '
          />
          </View>
          <Button title={editingId ? "عدّل" : "أنشئ"} onPress={handleCreateOrUpdate} />
        </View>

        <View className='w-[100%] flex-1 flex-col gap-y-3 bg-white rounded-lg h-fit'>
          <View className=''>
            <TextInput
              className="bg-gray-200 p-2 rounded-md mb-4 h-12"
              placeholder="ابحث عن تاجر..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View className='flex-1 flex-row max-h-8 items-center justify-center'>
            <View className='w-[30%] items-center'><Text className='font-bold text-lg'>الاسم</Text></View>
            <View className='w-[30%] items-center'><Text className='font-bold text-lg'>الرصيد</Text></View>
            <View className='w-[40%] items-center'><Text className='font-bold text-lg'>تفاعل</Text></View>
          </View>
          <View className='h-0.5 bg-gray-500 w-full'></View>
   <ScrollView className='flex-1 overflow-scroll'>
          {filteredItems.map((record) => (
           
            <View key={record.id} className='flex-1 flex-row  items-center justify-center max-h-9 my-1 '>
              <View className='w-[30%] items-center'><Text className='text-center'>{record.name}</Text></View>
              <View className='w-[30%] items-center'><Text className='text-center'>{record.balance}</Text></View>
              <View className='flex-row w-[40%] justify-center gap-2'>
              <View >
                <TouchableOpacity 
                  className='w-fit h-9 p-2 bg-[#FCa311] rounded-sm cursor-pointer'
                  onPress={() => handleEdit(record)}><Text>عدّل</Text></TouchableOpacity>
              </View>
              {/* <View>
                <TouchableOpacity className='w-fit max-w-fit h-9 bg-red-700 p-2 rounded-sm' onPress={() => handleDelete(record.id)}>
                  <Text className='text-white font-bold'>Delete</Text>
                </TouchableOpacity>
              </View> */}
              <View>
                <TouchableOpacity 
                  className='w-fit h-9 p-2 bg-blue-500 rounded-sm'
                  onPress={() => {
                    router.push({
                      pathname: '/traders/details',
                      params: { traderId : record.id }
                    });
                  }}>
                  <Text className='text-white font-bold'>التفاصيل</Text>
                </TouchableOpacity>
              </View>
            </View>
            </View>
          ))}
          </ScrollView>
        </View>
      </View>
   
  );
};

export default TradersComponent; // Updated export