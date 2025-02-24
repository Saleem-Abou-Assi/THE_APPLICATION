import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, TextInput } from 'react-native-paper';
import { initBill, createBill } from '../../src/crud/bill_in';
import { Customer } from '@/src/entity/Customers';
import { Item } from '@/src/entity/Items';
import { useRouter } from 'expo-router';
import { white } from 'react-native-paper/lib/typescript/styles/themes/v2/colors';

interface BillItem {
    itemId: number;
    quantity: number;
    price: number;
}

interface BillData {
    bill_in_id: number;
    customer_id: number;
    items_array: BillItem[];
    pay: number;
    total_cost: number;
    old_balance: number;
    new_balance: number;
}

const BillInPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [selectedCustomerId, setSelectedCustomerId] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
    const [payment, setPayment] = useState<number>(0);

    // New state for search query
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Filtered customers based on search query
    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // New state for modal visibility
    const [modalVisible, setModalVisible] = useState(false);

    // New state for selected customer
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Create a ref for the TextInput
    const searchInputRef = useRef<TextInput>(null);

    // New state for item selection modal visibility
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

    // Effect to focus on the TextInput when the modal opens
    useEffect(() => {
        if (modalVisible) {
            searchInputRef.current?.focus();
        }
    }, [modalVisible]);

    // Initialize bill data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { customers, items } = await initBill();
                setCustomers(customers as Customer[]);
                setItems(items as Item[]);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const addItemToBill = () => {
        setSelectedItems([...selectedItems, { itemId: 0, quantity: 1, price: 0 }]);
    };

    const updateItem = (index: number, field: keyof BillItem, value: number) => {
        const newItems = [...selectedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setSelectedItems(newItems);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const totalCost = selectedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        const oldBalance = selectedCustomer?.balance || 0;
        const newBalance = oldBalance + totalCost - payment;
        
        return { totalCost, oldBalance, newBalance };
    };

    const handleSubmit = async () => {
        const { totalCost, oldBalance, newBalance } = calculateTotals();
        
        const billData: BillData = {
            bill_in_id: Date.now(), // or generate from your backend
            customer_id: selectedCustomerId,
            items_array: selectedItems,
            pay: payment,
            total_cost: totalCost,
            old_balance: oldBalance,
            new_balance: newBalance
        };

        await handleCreateBill(billData);
    };

    // Handle bill submission
    const handleCreateBill = async (billData: BillData) => {
        try {
            const result = await createBill(billData);
            if (result.success) {
                alert('Bill created successfully!');
                // You might want to navigate to another page or reset the form
            }
        } catch (error) {
            console.error('Error creating bill:', error);
            alert('Failed to create bill');
        }
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View className='flex-1 w-[100%] items-center'>
                <View className='w-[95%] bg-white shadow-slate-700 p-2 m-5 rounded-lg'>
                    <Text className='text-2xl font-bold mb-4 text-center'>فاتورة مبيع</Text>
                    <View className='w-full flex flex-row gap-x-2 justify-center'>
                    <TouchableOpacity
                        className='bg-primary p-2 rounded-md mb-4 w-36 items-center felx flex-row justify-center'
                        onPress={() => setModalVisible(true)}
                    >
                        <Text className='text-white font-bold'>{selectedCustomer ? selectedCustomer.name : "العميل"}</Text>
                        <Text style={{ marginLeft: 5,color:'white' }}>▼</Text>
                    </TouchableOpacity>
                    <Text className='bg-gray-200 p-2 rounded-md mb-4 w-36 text-center'>{selectedCustomer ? selectedCustomer.line :"الخط"}</Text>
                    
                    </View>
                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <View className='flex-1 justify-center'>
                            <View className='bg-white rounded-t-lg p-4 shadow-lg'>
                                <TextInput
                                    ref={searchInputRef}
                                    className="bg-gray-200 p-2 rounded-md mb-4"
                                    placeholder="Search Customer"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                />

                                <ScrollView>
                                    {filteredCustomers.map(customer => (
                                        <TouchableOpacity
                                            key={customer.id}
                                            onPress={() => {
                                                setSelectedCustomer(customer);
                                                setSelectedCustomerId(customer.id);
                                                setModalVisible(false);
                                            }}
                                        >
                                            <Text className='p-4'>{customer.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

                                <TouchableOpacity
                                    onPress={() => setModalVisible(false)}
                                    className='mt-4 bg-red-500 p-2 rounded-md'
                                >
                                    <Text className='text-white text-center'>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <TouchableOpacity
                        className='w-32 self-center bg-[#FCa311] p-2 rounded-md mb-4'
                        onPress={addItemToBill}
                    >
                        <Text className='text-center font-bold'>Add Item</Text>
                    </TouchableOpacity>

                    {selectedItems.map((item, index) => (
                        <View key={index} className='flex-row items-center gap-2 mb-4'>
                            <View className='flex-1'>
                                <TouchableOpacity
                                    className='bg-gray-200 p-2 rounded-md'
                                    onPress={() => {
                                        setSelectedItemIndex(index);
                                        setItemModalVisible(true);
                                    }}
                                >
                                    <Text>{item.itemId ? items.find(i => i.id === item.itemId)?.name : "Select Item"}</Text>
                                </TouchableOpacity>
                                
                            </View>

                            <TextInput
                                className="bg-gray-200 p-2 rounded-md flex-1"
                                keyboardType="numeric"
                                value={item.quantity.toString()}
                                onChangeText={(value) => updateItem(index, 'quantity', Number(value))}
                                placeholder="Qty"
                            />

                            <TextInput
                                className="bg-gray-200 p-2 rounded-md flex-1"
                                keyboardType="numeric"
                                value={item.price.toString()}
                                onChangeText={(value) => updateItem(index, 'price', Number(value))}
                                placeholder="Price"
                            />

                            <TouchableOpacity
                                className='bg-red-500 p-2 rounded-md'
                                onPress={() => removeItem(index)}
                            >
                                <Text className='text-white'>Remove</Text>
                            </TouchableOpacity>
                            
                        </View>
                    ))}

                    <TextInput
                        className="bg-gray-200 p-2 rounded-md mb-4"
                        placeholder="Payment"
                        keyboardType="numeric"
                        value={payment.toString()}
                        onChangeText={(value) => setPayment(Number(value))}
                    />

                    <TouchableOpacity
                        className='w-full bg-blue-500 p-2 rounded-md'
                        onPress={handleSubmit}
                        disabled={!selectedCustomerId || selectedItems.length === 0}
                    >
                        <Text className='text-center text-white font-bold'>Create Bill</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                animationType="slide"
                transparent={true}
                visible={itemModalVisible}
                onRequestClose={() => setItemModalVisible(false)}
            >
                <View className='flex-1 justify-center'>
                    <View className='bg-white rounded-t-lg p-4 shadow-lg'>
                        <ScrollView>
                            {items.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        if (selectedItemIndex !== null) {
                                            updateItem(selectedItemIndex, 'itemId', item.id);
                                        }
                                        setItemModalVisible(false);
                                    }}
                                >
                                    <Text className='p-4'>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={() => setItemModalVisible(false)}
                            className='mt-4 bg-red-500 p-2 rounded-md'
                        >
                            <Text className='text-white text-center'>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
};

export default BillInPage;
