import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView,TextInput, Platform, Modal, TouchableWithoutFeedback } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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
    const [discount, setDiscount] = useState<number>(0);
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

    // New state for item search query
    const [itemSearchQuery, setItemSearchQuery] = useState<string>('');

    // Filtered items based on search query
    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(itemSearchQuery.toLowerCase())
    );

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
        const totalCost = selectedItems.reduce((sum, item) => {
            const itemPrice = item.price > 0 ? item.price : (items.find(i => i.id === item.itemId)?.s_price || 0);
            return sum + (item.quantity * itemPrice);
        }, 0);
        
        const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
        const oldBalance = selectedCustomer?.balance || 0;
        const newBalance = oldBalance + totalCost - payment;
        
        return { totalCost, oldBalance, newBalance };
    };

    const handleSubmit = async () => {
        const { totalCost, oldBalance, newBalance } = calculateTotals();
        
        // Ensure items have correct prices
        const itemsWithPrices = selectedItems.map(item => {
            const itemPrice = item.price > 0 ? item.price : (items.find(i => i.id === item.itemId)?.s_price || 0);
            return {
                ...item,
                price: itemPrice
            };
        });

        const billData: BillData = {
            bill_in_id: Date.now(),
            customer_id: selectedCustomerId,
            items_array: itemsWithPrices,
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
        <ScrollView className='flex-1 w-full overflow-y-scroll'>
        <KeyboardAvoidingView 
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={100}
        >
            <View className='flex-1 w-[100%] items-center'>
                <View className='w-[100%] bg-white shadow-slate-700 p-2 m-5 rounded-lg'>
                    <Text className='text-2xl font-bold mb-4 text-center'>فاتورة مبيع</Text>
                    <View className='w-full flex flex-row gap-x-2 justify-center'>
                    <TouchableOpacity
                        className='bg-primary p-2 rounded-md mb-4 w-36 items-center felx flex-row justify-center'
                        onPress={() => setModalVisible(true)}
                    >
                        <Text className='text-white font-bold'>{selectedCustomer ? selectedCustomer.name : "العميل"}</Text>
                        <Text style={{ marginLeft: 5,color:'white' }}>▼</Text>
                    </TouchableOpacity>
                    <View>
                    <Text className='bg-gray-200 p-2 rounded-md mb-4 w-36 text-center'>الخط: {selectedCustomer ? selectedCustomer.line :""} </Text>
                    </View>
                    </View>
                    <Modal
                        animationType="fade"
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => setModalVisible(false)}
                    >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                            <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
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
                        </TouchableWithoutFeedback>
                    </Modal>

                    <TouchableOpacity
                        className='w-32 self-center bg-[#FCa311] p-2 rounded-md mb-4'
                        onPress={addItemToBill}
                    >
                        <Text className='text-center font-bold'>Add Item</Text>
                    </TouchableOpacity>
                    <View className='h-0.5 bg-gray-300 w-full mb-3'></View>
                    <View className='felx-1 flex-row items-center w-full bg-gray-100 p-2 mb-1 gap-1'>
                        <Text className='font-bold w-[32%] text-center'>المادة</Text>
                        <Text className='font-bold w-20 text-center'>الكمية</Text>
                        <Text className='font-bold w-20 text-center'>المبيع</Text>
                        <Text className='font-bold w-20 text-center'>المجموع</Text>
                        </View>  
                                      
                    {selectedItems.map((item, index) => (
                        <View className='bg-gray-100' key={`item-container-${index}`}>
                        <View key={`item-row-${index}`} className='flex-row items-center gap-2 m-2'>
                            <View className='flex-1 w-[25%]'>
                                <TouchableOpacity
                                    className='bg-gray-200 p-2 rounded-md'
                                    onPress={() => {
                                        setSelectedItemIndex(index);
                                        setItemModalVisible(true);
                                    }}
                                >
                                    <Text className='text-center'>{item.itemId ? items.find(i => i.id === item.itemId)?.name : "Select Item"}</Text>
                                </TouchableOpacity>
                                
                            </View>

                            <TextInput
                                className="bg-gray-200 p-2 rounded-md flex-1 max-w-16 text-center"
                                keyboardType="numeric"
                                value={item.quantity.toString()}
                                onChangeText={(value) => updateItem(index, 'quantity', Number(value))}
                                placeholder="Qty"
                            />
                            

                            <TextInput
                                className="bg-gray-200 p-2 rounded-md flex-1 max-w-20 text-center"
                                keyboardType="numeric"
                                value={item.price > 0 ? item.price.toString() : (items.find(i => i.id === item.itemId)?.s_price.toString() || "")}
                                onChangeText={(value) => updateItem(index, 'price', Number(value))}
                                placeholder="Price"
                            />

                           <Text className="bg-gray-200 p-2 rounded-md flex-1 max-w-20 text-center">
                               {item.itemId ? (items.find(i => i.id === item.itemId)?.s_price || 0) * item.quantity : 0}
                           </Text>
                            <TouchableOpacity
                                className='bg-red-500 p-1 rounded-md'
                                onPress={() => removeItem(index)}
                            >
                                <Text className='text-white'> X </Text>
                            </TouchableOpacity>
                            
                        </View>
                        </View>
                    ))}
                    <View className='flex-1 flex-row w-full justify-center items-center mt-2'>
                   <Text className='bg-gray-200 p-2 rounded-md mb-4 w-[75%] text-center'>{selectedCustomer ? selectedCustomer.balance :""}</Text>
                        <Text className='font-bold w-28 text-center mb-3'>رصيد سابق:</Text>
                    </View>
                    <View className='flex-1 flex-row w-full justify-center items-center mt-2'>
                        <Text className='bg-gray-200 p-2 rounded-md mb-4 w-[75%] text-center'>
                            {selectedItems.reduce((total, item) => {
                                const price = item.itemId ? items.find(i => i.id === item.itemId)?.s_price || 0 : 0;
                                return total + (price * item.quantity);
                            }, 0)}
                        </Text>
                        <Text className='font-bold w-28 text-center mb-3'>مجموع الفاتورة:</Text>
                    </View>
                    <View className='flex-1 flex-row w-full justify-center items-center mt-1 pr-1'>
                    <View className='flex-1 flex-row w-[45%] items-center'>
                        <TextInput
                        className="bg-orange-200 p-2 rounded-md mb-4 w-[50%] text-center"
                        placeholder="Discount"
                        keyboardType="numeric"
                        value={discount.toString()}
                        onChangeText={(value) => {
                            const numericValue = Number(value);
                            if (!isNaN(numericValue) && numericValue >= 0) {
                                setDiscount(numericValue);
                            }
                        }}
                         />
                            <Text className='font-bold w-20 text-end p-1  mb-3'>خصم:</Text>
                    </View>
                    <View className='flex-1 flex-row w-[45%] items-center justify-center'>
                    <TextInput
                        className="bg-orange-200 p-2 rounded-md mb-4 w-[70%] text-center"
                        placeholder="Payment"
                        keyboardType="numeric"
                        value={payment.toString()}
                        onChangeText={(value) => setPayment(Number(value))}
                    />
                        <Text className='font-bold w-36 text-center mb-3'>   المدفوعات:</Text>
                    </View>
                    
                    </View>
                    <View className='h-0.5 bg-gray-500 w-full mb-3'></View>
                    <View className='flex-1 flex-row w-full items-center'>
                        <Text className='bg-gray-200 p-2 rounded-md mb-4 w-[80%] text-center'>
                            {selectedItems.reduce((total, item) => {
                                const price = item.itemId ? items.find(i => i.id === item.itemId)?.s_price || 0 : 0;
                                return total + (price * item.quantity);
                            }, 0) - discount}
                        </Text>
                        <Text className='font-bold w-28 text-center mb-3'>الرصيد الحالي:</Text>
                    </View>
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
                animationType="fade"
                transparent={true}
                visible={itemModalVisible}
                onRequestClose={() => setItemModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setItemModalVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
                        <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
                            <TextInput
                                className="bg-gray-200 p-2 rounded-md mb-4"
                                placeholder="Search Item"
                                value={itemSearchQuery}
                                onChangeText={setItemSearchQuery}
                            />
                            <ScrollView>
                                {filteredItems.map(item => (
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
                </TouchableWithoutFeedback>
            </Modal>
        </KeyboardAvoidingView>
        </ScrollView>
    );
};

export default BillInPage;
