import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../src/crud/items';
import { Item } from '../src/entity/Items'; // Assuming you have an Item entity similar to Customer

const Items: React.FC = () => {
  const [records, setRecords] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
  const [balance, setBalance] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [b_price, setBPrice] = useState(0);
  const [s_price, setSPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    const fetchData = () => {
      getRecords((data) => {
        console.log(data);
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
 // ... existing code ...

    <View>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="B Price" value={String(b_price)} onChangeText={text => setBPrice(Number(text))} keyboardType="numeric" />
      <TextInput placeholder="S Price" value={String(s_price)} onChangeText={text => setSPrice(Number(text))} keyboardType="numeric" />
      <TextInput placeholder="Quantity" value={String(quantity)} onChangeText={text => setQuantity(Number(text))} keyboardType="numeric" />
      <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />

      {records.map((record) => (
        <View key={record.id}>
          <Text>{record.name}</Text>
          <Text>B Price: {record.b_price}</Text>
          <Text>S Price: {record.s_price}</Text>
          <Text>Quantity: {record.quantity}</Text>
          <Button title="Edit" onPress={() => handleEdit(record)} />
          <Button title="Delete" onPress={() => handleDelete(record.id)} />
        </View>
      ))}
    </View>
  );

// ... existing code ...
};

export default Items;
