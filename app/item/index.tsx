import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../../src/crud/items';
import { Item } from '../../src/entity/Items'; // Assuming you have an Item entity similar to Customer

const Items: React.FC = () => {
  const [records, setRecords] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  const [balance, setBalance] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [b_price, setBPrice] = useState(0);
  const [s_price, setSPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  useEffect(() => {
    const fetchData = () => {
      getRecords((data) => {
        setRecords(data);
      });
    };
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = records.filter(record => 
      record.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchTerm, records]);

  const handleCreateOrUpdate = async () => {
    if (editingId) {
      await updateRecord(editingId, name, b_price, s_price, quantity);
    } else {
      await createRecord(name, b_price, s_price, quantity);
    }
    setName('');
    setBPrice(0);
    setSPrice(0);
    setQuantity(0);
    setEditingId(null);
    getRecords((data) => {
      setRecords(data);
    });
  };

  const handleEdit = (record: Item) => {
    setName(record.name);
    setBPrice(record.b_price);
    setSPrice(record.s_price);
    setQuantity(record.quantity);
    setEditingId(record.id);
  };

  const handleDelete = async (id: number) => {
    await deleteRecord(id);
    getRecords((data) => {
      setRecords(data);
    });
  };

  return (
   
      <ScrollView className='flex-1 w-[100%]  overflow-y-scroll'>
        <View className='flex-1 items-center'>
        <View className='w-[100%] bg-white shadow-slate-700 p-3 m-5 grid grid-rows-5 gap-y-3 rounded-lg'>
          <View className='flex-1 flex-row-reverse w-full items-center p-1 justify-center'>
            <Text className='font-bold w-20 text-end'>اسم المنتج:</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} className='bg-gray-100 w-[80%] rounded-md'/>
          </View>
          <View className='flex-1 flex-row-reverse w-full items-center p-1'>
          <Text className='font-bold w-20'> سعر الشراء:</Text>
          <TextInput 
            placeholder="Selling Price" 
            value={String(b_price)} 
            onChangeText={text => setBPrice(Number(text))} 
            keyboardType="numeric" 
            className='bg-gray-100 w-[80%] rounded-md'
          />
          </View>
          <View className='flex-1 flex-row-reverse w-full items-center p-1'>
          <Text className='font-bold w-20'>سعر المبيع:</Text>
          <TextInput 
            placeholder="Buying Price" 
            value={String(s_price)} 
            onChangeText={text => setSPrice(Number(text))} 
            keyboardType="numeric" 
            className='bg-gray-100 w-[80%] rounded-md'
          />
          </View>
          <View className='flex-1 flex-row-reverse w-full items-center p-1'>
          <Text className='font-bold w-20'>الكمية:</Text>
          <TextInput 
            placeholder="Quantity" 
            value={String(quantity)} 
            onChangeText={text => setQuantity(Number(text))} 
            keyboardType="numeric" 
            className='bg-gray-100 w-[80%] rounded-md'
          />
          </View>
          <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />
        </View>
        
        <View className='w-[100%] flex-1 flex-col gap-y-3 bg-white rounded-lg h-fit'>
          <View className='p-2 '>
            <TextInput
              className="bg-gray-200 p-2 rounded-md "
              placeholder="Search items..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>


       
          <View className='flex-1 flex-row max-h-9 justify-center gap-x-3 m-2'>
            <View className='w-[15%] items-center '><Text className='font-bold text-lg'> المنتج</Text></View>
            <View className='w-[16%] items-center'><Text className='font-bold text-lg'> الشراء</Text></View>
            <View className='w-[15%] items-center'><Text className='font-bold text-lg'> المبيع</Text></View>
            <View className='w-[15%] items-center'><Text className='font-bold text-lg mx-1'>الكمية</Text></View>
            <View className='w-[28%] items-center '><Text className='font-bold text-lg '>تفاعل</Text></View>
          </View>
          <View className='h-0.5 bg-gray-500 w-full'></View>
           <KeyboardAvoidingView keyboardVerticalOffset={-100}
            behavior="padding" className='flex-1 w-full items-center'>
          <ScrollView>
            {filteredItems.map((record) => (
              <View key={record.id} className='flex-1 flex-row gap-x-2 items-center justify-center max-h-10 my-3'>
                <View className='w-[15%] items-center'><Text>{record.name}</Text></View>
                <View className='w-[15%] items-center'><Text>{record.b_price}</Text></View>
                <View className='w-[15%] items-center'><Text>{record.s_price}</Text></View>
                <View className='w-[15%] items-center'><Text>{record.quantity}</Text></View>
                <View>
                  <TouchableOpacity 
                    className='w-11 p-2 mx-1 bg-[#FCa311] rounded-sm cursor-pointer h-10'
                    onPress={() => handleEdit(record)}><Text>Edit</Text></TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity className='w-15 bg-red-700 p-2 rounded-sm h-10' onPress={() => handleDelete(record.id)}>
                    <Text className='text-white font-bold'>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </KeyboardAvoidingView>
        </View>
        </View>
      </ScrollView>
    
  );
};

export default Items;
