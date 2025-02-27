import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Button, TextInput, Searchbar } from 'react-native-paper';
import { initBillOut, createBillOut, createItem } from '../../src/crud/bill_out';
import { Traders } from '@/src/entity/Traders';
import { Item } from '@/src/entity/Items';

interface BillItem {
    itemId: number;
    quantity: number;
    price: number;
    note?: string;
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

interface ItemSuggestion {
    id: number;
    name: string;
}

const BillOutPage = () => {
    const [traders, setTraders] = useState<Traders[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Form state
    const [selectedTraderId, setSelectedTraderId] = useState<number>(0);
    const [selectedItems, setSelectedItems] = useState<BillItem[]>([]);
    const [payment, setPayment] = useState<number>(0);
    const [newItemName, setNewItemName] = useState('');
    const [itemSearch, setItemSearch] = useState<string>('');
    const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
    const [filteredItems, setFilteredItems] = useState<ItemSuggestion[]>([]);
    
    // Modal visibility states
    const [traderModalVisible, setTraderModalVisible] = useState(false);
    const [itemModalVisible, setItemModalVisible] = useState(false);

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
        setSelectedItems([...selectedItems, { itemId: 0, quantity: 1, price: 0 }]);
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
        const newBalance = oldBalance - totalCost + payment;
        
        return { totalCost, oldBalance, newBalance };
    };

    const handleAddNewItem = async (itemData: BillItem) => {
        try {
            // Create new item in database
            const newItem = await createItem({
                name: newItemName,
                b_price: itemData.price,
                s_price: itemData.price,
                quantity: 0 // Initial quantity is 0 since it's a new item
            });
            
            // Update items list
            const updatedItems = await initBillOut();
            setItems(updatedItems.items as Item[]);
            
            // Update selected item with new ID
            return newItem.id;
        } catch (error) {
            console.error('Error adding new item:', error);
            alert('Failed to add new item');
            return null;
        }
    };

    const handleSubmit = async () => {
        // Check for new items and create them
        const updatedItems = await Promise.all(selectedItems.map(async (item) => {
            if (item.itemId === 0 && newItemName) {
                const newId = await handleAddNewItem(item);
                if (newId) {
                    return { ...item, itemId: newId };
                }
            }
            return item;
        }));
        
        setSelectedItems(updatedItems);

        const { totalCost, oldBalance, newBalance } = calculateTotals();
        
        const billData: BillData = {
            bill_out_id: Date.now(),
            trader_id: selectedTraderId,
            items_array: updatedItems,
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

    const handleItemSearch = (text: string, index: number) => {
        setItemSearch(text);
        if (text.length > 0) {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(text.toLowerCase())
            );
            setFilteredItems(filtered);
            setShowSuggestions(true);
        } else {
            setFilteredItems([]);
            setShowSuggestions(false);
        }
    };

    const handleItemSelect = (index: number, suggestion: ItemSuggestion) => {
        const selectedItem = items.find(item => item.id === suggestion.id);
        if (selectedItem) {
            updateItem(index, 'itemId', selectedItem.id);
            setItemSearch(selectedItem.name);
            setShowSuggestions(false);
        }
    };

    const openTraderModal = () => {
        setTraderModalVisible(true);
    };

    const closeTraderModal = () => {
        setTraderModalVisible(false);
    };

    const openItemModal = () => {
        setItemModalVisible(true);
    };

    const closeItemModal = () => {
        setItemModalVisible(false);
    };

    if (loading) {
        return <Text>Loading...</Text>;
    }

    return (
        <ScrollView className='flex-1 w-full overflow-y-scroll'>
            <View className='flex-1 w-[100%] items-center'>
                <View className='w-[100%] bg-white shadow-slate-700 p-2 m-5 rounded-lg'>
                    <Text className='text-2xl font-bold mb-4 text-center'>فاتورة مبيع</Text>

                    <Button mode="contained" onPress={openTraderModal} style={{ marginVertical: 10 }}>
                        Select Trader
                    </Button>

                    <Text className='text-center mb-2'>Selected Trader: {selectedTraderId ? traders.find(t => t.id === selectedTraderId)?.name : "None"}</Text>

                    <Button mode="contained" onPress={addItemToBill} style={{ marginVertical: 10 }}>
                        Add Item
                    </Button>

                    {selectedItems.map((item, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 10 }}>
                            <View style={{ flex: 2, position: 'relative' }}>
                                <Searchbar
                                    placeholder="Search item"
                                    onChangeText={(text) => handleItemSearch(text, index)}
                                    value={itemSearch}
                                    style={{ elevation: 0, backgroundColor: '#f5f5f5' }}
                                />
                                {showSuggestions && (
                                    <View style={{
                                        position: 'absolute',
                                        top: 60,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'white',
                                        borderRadius: 4,
                                        elevation: 4,
                                        zIndex: 1000,
                                        maxHeight: 200,
                                    }}>
                                        <ScrollView nestedScrollEnabled={true} style={{ padding: 10 }}>
                                            {filteredItems.map((suggestion) => (
                                                <TouchableOpacity
                                                    key={suggestion.id}
                                                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                                    onPress={() => handleItemSelect(index, suggestion)}
                                                >
                                                    <Text>{suggestion.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>

                            <TextInput
                                keyboardType="numeric"
                                value={item.quantity.toString()}
                                onChangeText={(value) => updateItem(index, 'quantity', Number(value))}
                                style={{ flex: 1, marginHorizontal: 5 }}
                                label="Qty"
                            />

                            <TextInput
                                keyboardType="numeric"
                                value={item.price.toString()}
                                onChangeText={(value) => updateItem(index, 'price', Number(value))}
                                style={{ flex: 1, marginHorizontal: 5 }}
                                label="Price"
                            />

                            <TextInput
                                value={item.note || ''}
                                onChangeText={(value) => updateItem(index, 'note', value)}
                                style={{ flex: 1, marginHorizontal: 5 }}
                                label="Note"
                            />

                            <Button onPress={() => removeItem(index)}>Remove</Button>
                        </View>
                    ))}

                    <TextInput
                        label="Payment"
                        keyboardType="numeric"
                        value={payment.toString()}
                        onChangeText={(value) => setPayment(Number(value))}
                        style={{ marginVertical: 10 }}
                    />

                    <Button 
                        mode="contained" 
                        onPress={handleSubmit}
                        disabled={!selectedTraderId || selectedItems.length === 0}
                        style={{ marginVertical: 20 }}
                    >
                        Create Bill
                    </Button>
                </View>
            </View>

            {/* Trader Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={traderModalVisible}
                onRequestClose={closeTraderModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Trader</Text>
                        <ScrollView>
                            {traders.map(trader => (
                                <TouchableOpacity
                                    key={trader.id}
                                    onPress={() => {
                                        setSelectedTraderId(trader.id);
                                        closeTraderModal();
                                    }}
                                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                >
                                    <Text>{trader.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Button onPress={closeTraderModal} style={{ marginTop: 10 }}>Close</Button>
                    </View>
                </View>
            </Modal>

            {/* Item Selection Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={itemModalVisible}
                onRequestClose={closeItemModal}
            >
                <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: 'white', margin: 20, borderRadius: 10, padding: 20 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select Item</Text>
                        <ScrollView>
                            {items.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => {
                                        // Handle item selection logic here
                                        closeItemModal();
                                    }}
                                    style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}
                                >
                                    <Text>{item.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <Button onPress={closeItemModal} style={{ marginTop: 10 }}>Close</Button>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    // You can keep or modify styles as needed
});

export default BillOutPage;
