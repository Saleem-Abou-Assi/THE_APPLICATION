import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput, TouchableOpacity } from 'react-native';
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
    <View className='w-full overflow-y-scroll flex-1 flex-col items-center py-4 '>
     
      <View className='w-[85%] bg-white drop-shadow-lg rounded-lg flex-1 flex-col p-3 max-h-[35%]'>
        <View className='flex-1 flex-row max-h-14 items-center justify-end'>
          <TextInput className='w-[80%] bg-slate-100 text-center rounded-md' placeholder="...." value={name} onChangeText={setName} />
          <Text className='font-bold text-center text-lg'>اسم المنتج:</Text>
        </View>
        <View className='flex-1 flex-row max-h-14 items-center justify-end '>
        <TextInput className='w-[80%] bg-slate-100 text-center rounded-md' placeholder="مبيع" value={String(b_price)} onChangeText={text => setBPrice(Number(text))} keyboardType="numeric" />
        <Text className='font-bold text-center text-lg w-20'>سعر المبيع: </Text>
        </View>
        <View className='flex-1 flex-row max-h-14 items-center justify-end' >
         <TextInput className='w-[80%] bg-slate-100 text-center rounded-md' placeholder="شراء" value={String(s_price)} onChangeText={text => setSPrice(Number(text))} keyboardType="numeric" />
         <Text className='font-bold text-center text-lg w-20'>سعرالشراء: </Text>
        </View>
        <View className='flex-1 flex-row max-h-14 items-center justify-end'>
          <TextInput className='w-[80%] bg-slate-100 text-center rounded-md' placeholder="الكمية" value={String(quantity)} onChangeText={text => setQuantity(Number(text))} keyboardType="numeric" />
          <Text className='font-bold text-center text-lg w-20'>الكمية: </Text>
        </View>
               <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />
      </View>
      {records.filter(record => record.name.includes(searchTerm)).map((record) => (
        <View className='flex-1 flex-col w-[85%] m-2 bg-white'>
        <View key={record.id} className='flex-1 flex-row gap-x-8 items-center justify-center max-h-9 my-2 '>
          
          <View className='w-[10%] items-start'><Text>{record.name}</Text></View>
          <View className='w-[10%] items-start'><Text>{record.b_price}</Text></View>
          <View className='w-[10%] items-start'><Text>{record.s_price}</Text></View>
          <View className='w-[10dwd%] items-start'><Text>{record.quantity}</Text></View>
          <View>
            <TouchableOpacity 
              className='w-fit p-2 bg-[#FCa311] rounded-sm cursor-pointer'
              onPress={() => handleEdit(record)} >
              <Text>Edit</Text>
            </TouchableOpacity>
          </View>
          <View>
            <TouchableOpacity className='w-fit bg-red-700 p-2 rounded-sm' onPress={() => handleDelete(record.id)} >
              <Text className='text-white font-bold'>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        </View>
      ))}
    </View>
  );
};

export default Items;
