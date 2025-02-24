import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getCustomerDetails } from '../../src/crud/cutomers';
import { useRouter } from 'expo-router';

interface CustomerDetailsProps {
  customerId: number;
}

export default function CustomerDetails({ customerId }: CustomerDetailsProps) {
  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCustomerDetails(Number(customerId));
        setCustomerData(data);
      } catch (err) {
        setError('Failed to fetch customer details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [customerId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!customerData) {
    return <Text>No customer data found</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Customer Information</Text>
        <Text>Name: {customerData.customer.name}</Text>
        <Text>Line: {customerData.customer.line}</Text>
        <Text>Balance: {customerData.customer.balance}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Bills</Text>
        {customerData.bills.map((bill: any) => (
          <View key={bill.id} style={styles.billContainer}>
            <Text>Total Cost: {bill.total_cost}</Text>
            <Text>Paid: {bill.pay}</Text>
            <Text>Old Balance: {bill.old_balance}</Text>
            <Text>New Balance: {bill.new_balance}</Text>
            <Text>Items:</Text>
            {bill.items.map((item: any) => (
              <View key={item.id} style={styles.itemContainer}>
                <Text>{item.name} - {item.quantity} x {item.price}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Payments</Text>
        {customerData.payments.map((payment: any) => (
          <View key={payment.id} style={styles.paymentContainer}>
            <Text>Amount: {payment.amount}</Text>
            <Text>Date: {payment.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  billContainer: {
    marginBottom: 15,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  itemContainer: {
    marginLeft: 10,
    marginTop: 5,
  },
  paymentContainer: {
    marginBottom: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
});
