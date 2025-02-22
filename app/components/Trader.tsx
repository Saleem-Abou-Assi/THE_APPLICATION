import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../../src/crud/traders'; // Updated import
import { Traders } from '../../src/entity/Traders'; // Assuming you have a Traders entity similar to Item

const TradersComponent: React.FC = () => { // Updated component name
  const [records, setRecords] = useState<Traders[]>([]); // Updated type
  const [name, setName] = useState('');
  const [balance, setBalance] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);

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

  return (
    <View>
      <TextInput placeholder="Name" value={name} onChangeText={setName} />
      <TextInput placeholder="Balance" value={String(balance)} onChangeText={text => setBalance(Number(text))} keyboardType="numeric" />
      <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />

      {records.map((record) => (
        <View key={record.id}>
          <Text>{record.name}</Text>
          <Text>Balance: {record.balance}</Text> // Updated display
          <Button title="Edit" onPress={() => handleEdit(record)} />
          <Button title="Delete" onPress={() => handleDelete(record.id)} />
        </View>
      ))}
    </View>
  );
};

export default TradersComponent; // Updated export