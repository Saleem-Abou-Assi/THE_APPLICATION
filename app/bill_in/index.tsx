import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Button, TextInput } from 'react-native-paper';
import { initBill, createBill } from '../../src/crud/bill_in';
import { Customer } from '@/src/entity/Customers';
import { Item } from '@/src/entity/Items';

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
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Create Invoice</Text>

            <Picker
                selectedValue={selectedCustomerId}
                onValueChange={(value) => setSelectedCustomerId(Number(value))}
            >
                <Picker.Item label="Select Customer" value={0} />
                {customers.map(customer => (
                    <Picker.Item 
                        key={customer.id} 
                        label={customer.name} 
                        value={customer.id} 
                    />
                ))}
            </Picker>

            <Button mode="contained" onPress={addItemToBill} style={styles.button}>
                Add Item
            </Button>

            {selectedItems.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                    <Picker
                        selectedValue={item.itemId}
                        onValueChange={(value) => updateItem(index, 'itemId', Number(value))}
                        style={styles.itemPicker}
                    >
                        <Picker.Item label="Select Item" value={0} />
                        {items.map(item => (
                            <Picker.Item 
                                key={item.id} 
                                label={item.name} 
                                value={item.id} 
                            />
                        ))}
                    </Picker>

                    <TextInput
                        keyboardType="numeric"
                        value={item.quantity.toString()}
                        onChangeText={(value) => updateItem(index, 'quantity', Number(value))}
                        style={styles.input}
                        label="Qty"
                    />

                    <TextInput
                        keyboardType="numeric"
                        value={item.price.toString()}
                        onChangeText={(value) => updateItem(index, 'price', Number(value))}
                        style={styles.input}
                        label="Price"
                    />

                    <Button onPress={() => removeItem(index)}>Remove</Button>
                </View>
            ))}

            <TextInput
                label="Payment"
                keyboardType="numeric"
                value={payment.toString()}
                onChangeText={(value) => setPayment(Number(value))}
                style={styles.paymentInput}
            />

            <Button 
                mode="contained" 
                onPress={handleSubmit}
                disabled={!selectedCustomerId || selectedItems.length === 0}
                style={styles.submitButton}
            >
                Create Bill
            </Button>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    itemPicker: {
        flex: 2,
    },
    input: {
        flex: 1,
        marginHorizontal: 5,
    },
    button: {
        marginVertical: 10,
    },
    paymentInput: {
        marginVertical: 10,
    },
    submitButton: {
        marginVertical: 20,
    },
});

export default BillInPage;
