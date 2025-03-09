import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { initBillOut, createBillOut } from '../../src/crud/bill_out';
import { Traders } from '@/src/entity/Traders';
import { Item } from '@/src/entity/Items';

interface BillItem {
    itemId: number;
    quantity: number;
    s_price: number;
    b_price: number;
    name: string;
    total: number;
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
    const [newItemName, setNewItemName] = useState('');
    const [newItemBuyPrice, setNewItemBuyPrice] = useState(0);
    const [newItemSellPrice, setNewItemSellPrice] = useState(0);

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
        setSelectedItems([...selectedItems, { 
            itemId: 0, 
            quantity: 1, 
            s_price: 0, 
            b_price: 0, 
            name: "", 
            total: 0 
        }]);
    };

    const updateItem = (index: number, field: keyof BillItem, value: number | string) => {
        const newItems = [...selectedItems];
        newItems[index] = { ...newItems[index], [field]: value };
        
        // Update total when quantity or s_price changes
        if (field === 'quantity' || field === 's_price') {
            newItems[index].total = newItems[index].quantity * newItems[index].s_price;
        }
        
        setSelectedItems(newItems);
    };

    const removeItem = (index: number) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const calculateTotals = () => {
        const totalCost = selectedItems.reduce((sum, item) => sum + (item.quantity * item.s_price), 0);
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
            const updatedItems = [...selectedItems];
            updatedItems[selectedItemIndex] = {
                ...updatedItems[selectedItemIndex],
                itemId: item.id,
                name: item.name,
                s_price: item.s_price,
                b_price: item.b_price,
                total: item.s_price * updatedItems[selectedItemIndex].quantity
            };
            setSelectedItems(updatedItems);
        }
        setItemModalVisible(false);
    };

    const handleCreateAndAddItem = async () => {
        if (!newItemName || !newItemBuyPrice || !newItemSellPrice) {
            alert('Please fill all fields');
            return;
        }

        try {
            // Create new item object
            const newItem= {
                id: Date.now(), // Temporary ID until saved to database
                name: newItemName,
                b_price: newItemBuyPrice,
                s_price: newItemSellPrice,
                // Add other required fields as needed
            };

            // Add to items list
            // setItems([...items, newItem]);

            // Add to selected items
            if (selectedItemIndex !== null) {
                const updatedItems = [...selectedItems];
                updatedItems[selectedItemIndex] = {
                    itemId: newItem.id,
                    name: newItem.name,
                    s_price: newItem.s_price,
                    b_price: newItem.b_price,
                    quantity: 1,
                    total: newItem.s_price * 1
                };
                setSelectedItems(updatedItems);
            }

            // Clear new item fields
            setNewItemName('');
            setNewItemBuyPrice(0);
            setNewItemSellPrice(0);

            // Close modal
            setItemModalVisible(false);

            // TODO: Save new item to database
            // await yourApiCallToSaveItem(newItem);

        } catch (error) {
            console.error('Error creating item:', error);
            alert('Failed to create item');
        }
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
                        </View>
                        {/* Trader Selection Modal */}
                        <Modal
                            animationType="fade"
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

                        <View className='flex-1 flex-row items-center w-full bg-gray-100 p-2 mb-1 '>
                            <Text className='font-bold w-16 text-center'>المادة</Text>
                            <Text className='font-bold w-20 text-center'>الكمية</Text>
                            <Text className='font-bold w-20 text-center'>المبيع</Text>
                            <Text className='font-bold w-20 text-center'>الشراء</Text>
                            <Text className='font-bold w-20 text-center'>المجموع</Text>
                        </View>   

                        {selectedItems.map((item, index) => (
                            <View key={index} className='felx-1 flex-col items-center'>
                                <View className='flex-row items-center gap-1 mb-4'>
                                    <View className='flex-1 '>
                                        <TouchableOpacity
                                            className='bg-gray-200 p-2 rounded-md '
                                            onPress={() => {
                                                setSelectedItemIndex(index);
                                                setItemModalVisible(true);
                                            }}
                                        >
                                            <Text className='text-center'>
                                                {item.name || "المادة"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <TextInput
                                        className="bg-gray-200 p-2 rounded-md flex-1 max-w-14 text-center"
                                        keyboardType="numeric"
                                        value={item.quantity.toString()}
                                        onChangeText={(value) => updateItem(index, 'quantity', Number(value))}
                                        placeholder="Qty"
                                    />
                                    <TextInput
                                        className="bg-gray-200 p-2 rounded-md flex-1 max-w-20 text-center"
                                        keyboardType="numeric"
                                        value={item.s_price.toString()}
                                        onChangeText={(value) => updateItem(index, 's_price', Number(value))}
                                        placeholder="S Price"
                                    />
                                    <TextInput
                                        className="bg-gray-200 p-2 rounded-md flex-1 max-w-20 text-center"
                                        keyboardType="numeric"
                                        value={item.b_price.toString()}
                                        onChangeText={(value) => updateItem(index, 'b_price', Number(value))}
                                        placeholder="B Price"
                                    />
                                    <TextInput
                                        className="bg-gray-200 p-2 rounded-md flex-1 max-w-20 text-center"
                                        keyboardType="numeric"
                                        value={item.total.toString()}
                                        editable={false}
                                        placeholder="Total"
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
                                {  oldBalance + totalCost - payment - discount}
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
                            animationType="fade"
                            transparent={true}
                            visible={itemModalVisible}
                            onRequestClose={() => setItemModalVisible(false)}
                        >
                            <TouchableWithoutFeedback onPress={() => setItemModalVisible(false)}>
                                <ScrollView>
                                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' }}>
                                    <View className='bg-white rounded-lg p-4 shadow-lg w-[85%]'>
                                        <TextInput
                                            className="bg-gray-200 p-2 rounded-md mb-4"
                                            placeholder="Search Item"
                                            value={itemSearch}
                                            onChangeText={handleItemSearch}
                                        />
                                        
                                        {/* New Item Creation Fields */}
                                        <View className='mb-4'>
                                            <Text className='font-bold mb-2'>Create New Item:</Text>
                                            <View className='flex-row w-full items-center'>
                                            <TextInput
                                                className="bg-gray-200 p-2 rounded-md mb-2 w-[75%] text-center"
                                                placeholder="Item Name"
                                                value={newItemName}
                                                onChangeText={setNewItemName}
                                            />
                                                <Text className='text-center w-[25%] font-bold'>اسم المادة</Text>
                                            </View>
                                            <View className='flex-row w-full items-center'>
                                            <TextInput
                                                className="bg-gray-200 p-2 rounded-md mb-2 w-[75%] text-center"
                                                placeholder="Buying Price"
                                                keyboardType="numeric"
                                                value={newItemBuyPrice.toString()}
                                                onChangeText={(value) => setNewItemBuyPrice(Number(value))}
                                            />
                                                <Text className='text-center w-[25%] font-bold'>سعر الشراء:</Text>
                                            </View>
                                            <View className='flex-row w-full items-center'>
                                            <TextInput
                                                className="bg-gray-200 p-2 rounded-md mb-2 w-[75%] text-center"
                                                placeholder="Selling Price"
                                                keyboardType="numeric"
                                                value={newItemSellPrice.toString()}
                                                onChangeText={(value) => setNewItemSellPrice(Number(value))}
                                            />
                                                <Text className='text-center w-[25%] font-bold'>سعر المبيع:</Text>
                                            </View>
                                            <TouchableOpacity
                                                className='bg-green-500 p-2 rounded-md'
                                                onPress={handleCreateAndAddItem}
                                            >
                                                <Text className='text-white text-center'>اضف مادة جديدة</Text>
                                            </TouchableOpacity>
                                        </View>
                                        
                                        <ScrollView>
                                            {items.filter(item => item.name.toLowerCase().includes(itemSearch.toLowerCase())).map(item => (
                                                <TouchableOpacity
                                                    key={item.id}
                                                    onPress={() => handleItemSelect(item)}
                                                >
                                                    <View className='p-4'>
                                                        <Text>{item.name}</Text>
                                                        <Text className='text-sm text-gray-500'>Buy: {item.b_price} | Sell: {item.s_price}</Text>
                                                    </View>
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
                                </ScrollView>
                            </TouchableWithoutFeedback>
                        </Modal>
            </KeyboardAvoidingView>
        </ScrollView>
    );
};

export default BillOutPage;