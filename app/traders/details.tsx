import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getTraderDetails } from '../../src/crud/traders';

export default function TraderDetails() {
  const { traderId } = useLocalSearchParams();
  
  const [traderData, setTraderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBills, setExpandedBills] = useState<Record<number, boolean>>({});

  const toggleBill = (billId: number) => {
    setExpandedBills(prev => ({
      ...prev,
      [billId]: !prev[billId]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTraderDetails(Number(traderId));
        setTraderData(data);
      } catch (err) {
        setError('Failed to fetch trader details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [traderId]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>{error}</Text>;
  }

  if (!traderData) {
    return <Text>No trader data found</Text>;
  }

  return (
    <ScrollView className='flex-1 flex-col w-full bg-white'>
      <View className='flex-1 flex-col bg-primary p-2 items-center m-2 rounded-lg'>
        <Text className='text-2xl font-bold m-1 text-white'>معلومات التاجر</Text>
        <View className='bg-white w-[70%] flex-1 flex-col items-start rounded-xl p-2 m-2'>
          <Text className='font-bold w-full text-center p-1'>اسم التاجر: {traderData.trader.name}</Text>
          <Text className='font-bold w-full text-center p-1'>الرصيد: {traderData.trader.balance}</Text>
          <Text className='font-bold w-full text-center p-1'>عدد الفواتير: {traderData.bills.length}</Text>
          <Text className='font-bold w-full text-center p-1'>عدد الدفعات: {traderData.payments.length}</Text>
        </View>
      </View>

      <View className='bg-white w-full'>
        <View className='flex-1 flex-col bg-gray-200 p-2 m-2 rounded-lg'>
          <Text className='text-2xl font-bold m-1 text-[black] text-center'>
            الفواتير
          </Text>
          {traderData.bills.map((bill: any) => (
            <TouchableOpacity 
              key={bill.id} 
              onPress={() => toggleBill(bill.id)}
              className='flex-1 flex-col bg-white rounded-xl p-2 m-2'
            >
              <View className='flex-row-reverse items-center p-2 bg-gray-100'>
                <Text className='w-[50%] text-center font-bold'>التاريخ: </Text>
                <Text className='font-bold w-[50%] text-center'>{bill.created_at}</Text>
              </View>
              <View className='flex-row-reverse items-center p-2 bg-gray-100'>
                <Text className='w-[50%] text-center font-bold'>إجمالي التكلفة: </Text>
                <Text className='font-bold w-[50%] text-center'>{bill.total_cost}</Text>
              </View>

              {expandedBills[bill.id] && (
                <View>
                  <View className='flex-row-reverse items-center p-2 bg-gray-100'>
                    <Text className='w-[50%] text-center font-bold '>المدفوع: </Text>
                    <Text className='font-bold w-[50%] text-center'>{bill.pay}</Text>
                  </View>

                  <View className='flex-row-reverse items-center p-2 bg-gray-100'>
                    <Text className='w-[50%] text-center font-bold'>الرصيد القديم: </Text>
                    <Text className='font-bold w-[50%] text-center'>{bill.old_balance}</Text>
                  </View>

                  <View className='flex-row-reverse items-center p-2 bg-gray-100'>
                    <Text className='w-[50%] text-center font-bold'>الرصيد الجديد: </Text>
                    <Text className='font-bold w-[50%] text-center'>{bill.new_balance}</Text>
                  </View>

                  <Text className='font-bold text-center p-3'>المحتويات:</Text>
                  <View className='flex-row w-full bg-gray-100'>
                    <Text className='w-[34%] text-center p-2 font-bold'>اسم المادة</Text>
                    <Text className='w-[34%] text-center p-2 font-bold'>الكمية</Text>
                    <Text className='w-[34%] text-center p-2 font-bold'>السعر</Text>
                  </View>
                  {bill.items.map((item: any) => (
                    <View key={item.item_id} className='flex-1 flex-row w-full bg-gray-50'>
                      <Text className='w-[34%] text-center p-2 '>{item.name}</Text>
                      <Text className='w-[34%] text-center p-2 '>{item.quantity} </Text>
                      <Text className='w-[34%] text-center p-2 '>{item.price}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className='flex-1 flex-col bg-gray-200 p-2 m-2 rounded-lg'>
          <Text className='text-2xl font-bold m-1 text-black text-center'>
            المدفوعات 
          </Text>
          {traderData.payments.map((payment: any) => (
            <View key={payment.id} className='flex-1 flex-col bg-white rounded-xl p-2 m-1'>
              <View className='flex-1 flex-row-reverse w-full bg-gray-50 p-1'>
                <Text className='font-bold w-[50%] text-center p-1'>الدفع: </Text>
                <Text className='font-bold w-[50%] text-center p-1'>{payment.amount}</Text>
              </View>
              <View className='flex-1 flex-row-reverse w-full bg-gray-50 p-1'>
                <Text className='font-bold w-[50%] text-center p-1'>ملاحظات: </Text>
              <Text className='font-bold w-[50%] text-center p-1'>{payment.note}</Text>
              </View>
              <View className='flex-1 flex-row-reverse w-full bg-gray-50 p-1'>
                <Text className='font-bold w-[50%] text-center p-1'>بتاريخ: </Text>
              <Text className='font-bold w-[50%] text-center p-1'>{payment.created_at}</Text>
              </View>
              
            </View>
          ))}
        </View>
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
