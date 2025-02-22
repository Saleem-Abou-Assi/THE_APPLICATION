import React, { useEffect, useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';
import { getRecords, createRecord, updateRecord, deleteRecord } from '../src/crud/cutomers';
import { Customer } from '../src/entity/Customers';

const RecoredList: React.FC = () => {
  const [records, setRecords] = useState<Customer[]>([]);
  const [name, setName] = useState('');
  const [line, setLine] = useState('');
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
    <View>
      <TextInput placeholder="Namwdade" value={name} onChangeText={setName} />
      <TextInput placeholder="Line" value={line} onChangeText={setLine} />
      <TextInput 
        placeholder="Balance" 
        value={String(balance)} 
        onChangeText={text => setBalance(Number(text))} 
        keyboardType="numeric" 
      />
      <Button title={editingId ? "Update Record" : "Create Record"} onPress={handleCreateOrUpdate} />
      {/* <Button title={"fatchData"} onPress={} /> */}

      {records.map((record) => (
        <View key={record.id}>
          <Text>{record.name}</Text>
          <Text>{record.line}</Text>
          <Button title="Edit" onPress={() => handleEdit(record)} />
          <Button title="Delete" onPress={() => handleDelete(record.id)} />
        </View>
      ))}
    </View>
  );
};

export default RecoredList;