import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getCustomerDetails } from '../../src/crud/cutomers';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function CustomerDetails() {
  const { customerId } = useLocalSearchParams();
  

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
    <ScrollView className='flex-1 flex-col w-full bg-white'>
      <View className='flex-1 flex-col bg-primary p-2 items-center m-2 rounded-lg'>
        <Text className='text-2xl font-bold m-1 text-white'>معلومات العميل</Text>
        <View className='bg-white w-[70%] flex-1 flex-col items-start rounded-xl p-2 m-2'>

          <View className='flex-1 flex-row-reverse w-full p-1'>
             <Text className='font-bold w-[50%] text-center p-1'>الاسم:</Text>
             <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{customerData.customer.name}</Text>
          </View>

          <View className='flex-1 flex-row-reverse w-full  p-1'>
            <Text className='font-bold w-[50%] text-center p-1' >الخط:</Text>
             <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{customerData.customer.line}</Text>
          </View>

          <View className='flex-1 flex-row-reverse w-full  p-1'>
            <Text className='font-bold w-[50%] text-center p-1'>الرصيد:</Text>
            <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{customerData.customer.balance}</Text>
          </View>

          <View className='flex-1 flex-row-reverse w-full  p-1'>
            <Text className='font-bold w-[50%] text-center p-1'>عدد الفواتير:</Text>
            <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{customerData.totalBills}</Text>
          </View>

          <View className='flex-1 flex-row-reverse w-full  p-1'>
            <Text className='font-bold w-[50%] text-center p-1'>عدد الدفعات:</Text>
            <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{customerData.totalPayments}</Text>
          </View>
        </View>
      </View>
      <View className='bg-white w-full'>
      <View className='flex-1 flex-col bg-gray-200 p-2 m-2 rounded-lg'>
        <Text className='text-2xl font-bold m-1 text-[black] text-center'>الفواتير</Text>
        {customerData.bills.map((bill: any) => (
          <View key={bill.id} className='flex-1 flex-col bg-white rounded-xl p-2 m-2'>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-2'>تاريخ الاصدار:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-2'>{bill.created_at}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-2'>قيمة الفاتورة:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-2'>{bill.total_cost}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-2'>المدفوعات:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-2'>{bill.pay}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-2'>الرصيد السابق:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-2'>{bill.old_balance}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-2'>الرصيد الحالي:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-2'>{bill.new_balance}</Text>
            </View>
            <View className='w-full h-0.5 bg-gray-200 mt-1'></View>
            <Text className='font-bold w-full text-center p-2'>محتويات الفاتورة:</Text>
            <View className='felx-1 flex-row w-full'>
              <Text>اسم المادة</Text>
              <Text>الكمية المباعة</Text>
              <Text>سعر المبيع</Text>
            </View>
            {bill.items.map((item: any) => (
              <View key={item.item_id} className='flex-1 flex-row w-full'>
                <Text className='w-[50%] text-center p-2'>{item.name} - {item.sold_quantity} x {item.sold_price}</Text>
              </View>
            ))}
          </View>
        ))} 
      </View>

      <View>
        <Text className='text-2xl font-bold m-1 text-white'>Payments</Text>
        {customerData.payments.map((payment: any) => (
          <View key={payment.id} className='flex-1 flex-col bg-white rounded-xl p-2 m-2'>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-1'>Amount:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{payment.amount}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full '>
              <Text className='font-bold w-[50%] text-center p-1'>Date:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{payment.created_at}</Text>
            </View>
          </View>
        ))}
      </View>
      </View>
    </ScrollView>
  );
}


