import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { initBillOut, createBillOut } from '../../src/crud/bill_out';
import { Traders } from '@/src/entity/Traders';
import { Item } from '@/src/entity/Items';

interface BillItem {
    itemId: number;
    quantity: number;
    price: number;
    name: string;
}

interface BillData {
    bill_out_id: number;
    trader_id: number;
    items_array: BillItem[];
    pay: number;
    total_cost: number;
    old_balance: number;
    new_balance: number;
}

const BillOutPage = () => {
    const [traders, setTraders] = useState<Traders[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [selectedTraderId, setSelectedTraderId] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
    const [payment, setPayment] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [itemSearch, setItemSearch] = useState<string>('');
    
    // New state for modal visibility
    const [traderModalVisible, setTraderModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);
    const [selectedTrader, setSelectedTrader] = useState<Traders | null>(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);

    // Initialize bill data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const { traders, items } = await initBillOut();
                setTraders(traders as Traders[]);
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
        setSelectedItems([...selectedItems, { itemId: 0, quantity: 1, price: 0, name: "" }]);
    };

    const updateItem = (index: number, field: keyof BillItem, value: number | string) => {
        const newItems = [...selectedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setSelectedItems(newItems);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const totalCost = selectedItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const selectedTrader = traders.find(t => t.id === selectedTraderId);
        const oldBalance = selectedTrader?.balance || 0;
        const newBalance = oldBalance - totalCost + payment - discount;
        
        return { totalCost, oldBalance, newBalance };
    };

    const handleSubmit = async () => {
        const { totalCost, oldBalance, newBalance } = calculateTotals();
        
        const billData: BillData = {
            bill_out_id: Date.now(),
            trader_id: selectedTraderId,
            items_array: selectedItems,
            pay: payment,
            total_cost: totalCost,
            old_balance: oldBalance,
            new_balance: newBalance
        };

        await handleCreateBill(billData);
    };

    const handleCreateBill = async (billData: BillData) => {
        try {
            const result = await createBillOut(billData);
            if (result.success) {
                alert('Bill created successfully!');
                // Reset form or navigate
            }
        } catch (error) {
            console.error('Error creating bill:', error);
            alert('Failed to create bill');
        }
    };

    const handleItemSearch = (text: string) => {
        setItemSearch(text);
        if (text.length > 0) {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredItems(filtered);
        } else {
            setFilteredItems([]);
        }
    };

    const handleItemSelect = (item: Item) => {
        if (selectedItemIndex !== null) {
            updateItem(selectedItemIndex, 'itemId', item.id);
            updateItem(selectedItemIndex, 'price', item.s_price);
            updateItem(selectedItemIndex, 'name', item.name);
        }
        setItemModalVisible(false);
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    const { totalCost, oldBalance, newBalance } = calculateTotals();

    return (
        <ScrollView className='flex-1 w-full overflow-y-scroll'>
            <KeyboardAvoidingView 
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
                keyboardVerticalOffset={100}
            >
                <View className='flex-1 w-[100%] items-center'>
                    <View className='w-[100%] bg-white shadow-slate-700 p-2 m-5 rounded-lg'>
                        <Text className='text-2xl font-bold mb-4 text-center'>فاتورة شراء</Text>
                        <View className='w-full flex flex-row gap-x-2 justify-center'>
                        <TouchableOpacity
                            className='bg-primary p-2 rounded-md mb-4 w-36 items-center'
                            onPress={() => setTraderModalVisible(true)}
                        >
                            <Text className='text-white font-bold'>{selectedTrader ? selectedTrader.name : "Select Trader"}</Text>
                        </TouchableOpacity>
                        <Text className='bg-gray-200 p-2 rounded-md mb-4 w-36 text-center'>الخط: {selectedTrader ? selectedTrader.balance :""} </Text>
                        </View>
                        {/* Trader Selection Modal */}
                        <Modal
                            animationType="slide"
                            transparent={true}
                            visible={traderModalVisible}
                            onRequestClose={() => setTraderModalVisible(false)}
                        >
                            <TouchableWithoutFeedback onPress={() => setTraderModalVisible(false)}>
                                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                    <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
                                        <TextInput
                                            className="bg-gray-200 p-2 rounded-md mb-4"
                                            placeholder="Search Trader"
                                            value={itemSearch}
                                            onChangeText={(text) => {
                                                setItemSearch(text);
                                                // Optionally, you can filter traders here if you want to show filtered results immediately
                                            }}
                                        />
                                        <ScrollView>
                                            {traders.filter(trader => 
                                                trader.name.toLowerCase().includes(itemSearch.toLowerCase())
                                            ).map(trader => (
                                                <TouchableOpacity
                                                    key={trader.id}
                                                    onPress={() => {
                                                        setSelectedTrader(trader);
                                                        setSelectedTraderId(trader.id);
                                                        setTraderModalVisible(false);
                                                    }}
                                                >
                                                    <Text className='p-4'>{trader.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                        <TouchableOpacity
                                            onPress={() => setTraderModalVisible(false)}
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

                        <View className='flex-1 flex-row items-center w-full bg-gray-100 p-2 mb-1 gap-1'>
                            <Text className='font-bold w-[37%] text-center'>المادة</Text>
                            <Text className='font-bold w-20 text-center'>الكمية</Text>
                            <Text className='font-bold w-20 text-center'>المبيع</Text>
                            <Text className='font-bold w-20 text-center'>المجموع</Text>
                        </View>   

                        {selectedItems.map((item, index) => (
                            <View key={index} className='felx-1 flex-col items-center'>
                                <View className='flex-row items-center gap-2 mb-4'>
                                    <View className='flex-1'>
                                        <TouchableOpacity
                                            className='bg-gray-200 p-2 rounded-md'
                                            onPress={() => {
                                                setSelectedItemIndex(index);
                                                setItemModalVisible(true);
                                            }}
                                        >
                                              <Text className='text-center'>
                                                  {item.itemId ? items.find(i => i.id === item.itemId)?.name : "Select Item"}
                                              </Text>
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
                                        value={item.price.toString()}
                                        onChangeText={(value) => updateItem(index, 'price', Number(value))}
                                        placeholder="Price"
                                    />
                                    <TextInput
                                      className="bg-gray-200 p-2 rounded-md flex-1 max-w-20 text-center"
                                      keyboardType="numeric"
                                      value={item.price > 0 ? item.price.toString() : (items.find(i => i.id === item.itemId)?.s_price.toString() || "")}
                                      onChangeText={(value) => updateItem(index, 'price', Number(value))}
                                      placeholder="Price"
                                  />
                                    <TouchableOpacity
                                        className='bg-red-500 p-1 rounded-md'
                                        onPress={() => removeItem(index)}
                                    >
                                        <Text className='text-white'> X </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}

                        {/* Item Selection Modal */}
                    

                        {/* Display Previous Balance */}
                        <View className='flex-1 flex-row w-full justify-center items-center mt-2 pl-1'>
                            <Text className='bg-gray-200 p-2 rounded-md mb-4 w-[75%] text-center'>{selectedTrader ? selectedTrader.balance : ""}</Text>
                            <Text className='font-bold w-28 text-center mb-3'>رصيد سابق:</Text>
                        </View>

                        {/* Display Total Bill Amount */}
                        <View className='flex-1 flex-row w-full justify-center items-center mt-2 pl-1'>
                            <Text className='bg-gray-200 p-2 rounded-md mb-4 w-[75%] text-center'>
                                {totalCost}
                            </Text>
                            <Text className='font-bold w-28 text-center mb-3'>مجموع الفاتورة:</Text>
                        </View>

                        {/* Discount and Payment Inputs */}
                        <View className='flex-1 flex-row w-full justify-center items-center mt-1'>
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
                                <Text className='font-bold w-36 text-center mb-3 mr-3'>المدفوعات:</Text>
                            </View>
                        </View>

                        {/* Current Balance Display */}
                        <View className='h-0.5 bg-gray-500 w-full mb-3'></View>
                        <View className='flex-1 flex-row w-full items-center'>
                            <Text className='bg-gray-200 p-2 rounded-md mb-4 w-[75%] text-center'>
                                {totalCost - discount}
                            </Text>
                            <Text className='font-bold w-28 text-center mb-3'>الرصيد الحالي:</Text>
                        </View>

                        <TouchableOpacity 
                            className='w-full bg-blue-500 p-2 rounded-md'
                            onPress={handleSubmit}
                            disabled={!selectedTraderId || selectedItems.length === 0}
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
                            <TouchableWithoutFeedback onPress={() => setItemModalVisible(false)}>
                                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                    <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
                                        <TextInput
                                            className="bg-gray-200 p-2 rounded-md mb-4"
                                            placeholder="Search Item"
                                            value={itemSearch}
                                            onChangeText={handleItemSearch}
                                        />
                                        <ScrollView>
                                            {items.filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase())).map(item => (
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

export default BillOutPage;