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
    <KeyboardAvoidingView 
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View className='flex-1 w-[100%] items-center'>
        <View className='w-[95%] bg-white shadow-slate-700 p-2 m-5 grid grid-rows-5 gap-y-3 rounded-lg'>
          <TextInput placeholder="Name" value={name} onChangeText={setName} />
          <TextInput 
            placeholder="Selling Price" 
            value={String(b_price)} 
            onChangeText={text => setBPrice(Number(text))} 
            keyboardType="numeric" 
          />
          <TextInput 
            placeholder="Buying Price" 
            value={String(s_price)} 
            onChangeText={text => setSPrice(Number(text))} 
            keyboardType="numeric" 
          />
          <TextInput 
            placeholder="Quantity" 
            value={String(quantity)} 
            onChangeText={text => setQuantity(Number(text))} 
            keyboardType="numeric" 
          />
          <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />
        </View>
        
        <View className='w-[95%] flex-1 flex-col gap-y-3 bg-white rounded-lg h-fit'>
          <View className='flex-1 flex-row max-h-8 justify-center gap-x-2'>
            <View className='w-[15%] items-center '><Text className='font-bold text-lg'>اسم المنتج</Text></View>
            <View className='w-[15%] items-center'><Text className='font-bold text-lg'> المبيع</Text></View>
            <View className='w-[16%] items-center'><Text className='font-bold text-lg'> الشراء</Text></View>
            <View className='w-[15%] items-center'><Text className='font-bold text-lg'>الكمية</Text></View>
            <View className='w-[25%] items-center'><Text className='font-bold text-lg'>تفاعل</Text></View>
          </View>
          <View className='h-0.5 bg-gray-500 w-full'></View>
          <View className=''>
            <TextInput
              className="bg-gray-200 p-2 rounded-md mb-4"
              placeholder="Search items..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <ScrollView>
            {filteredItems.map((record) => (
              <View key={record.id} className='flex-1 flex-row gap-x-2 items-center justify-center max-h-10 my-2'>
                <View className='w-[15%] items-center'><Text>{record.name}</Text></View>
                <View className='w-[15%] items-center'><Text>{record.b_price}</Text></View>
                <View className='w-[15%] items-center'><Text>{record.s_price}</Text></View>
                <View className='w-[15%] items-center'><Text>{record.quantity}</Text></View>
                <View>
                  <TouchableOpacity 
                    className='w-11 p-2 bg-[#FCa311] rounded-sm cursor-pointer h-10'
                    onPress={() => handleEdit(record)}><Text>Edit</Text></TouchableOpacity>
                </View>
                <View>
                  <TouchableOpacity className='w-15 bg-red-700 p-2 rounded-sm h-10' onPress={() => handleDelete(record.id)}>
                    <Text className='text-white font-bold'>Delete</Text></TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default Items;
