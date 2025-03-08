import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getCustomerDetails } from '../../src/crud/cutomers';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Print from 'expo-print';

export default function CustomerDetails() {
  const { customerId } = useLocalSearchParams();
  

  const [customerData, setCustomerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedBills, setExpandedBills] = useState<Record<number, boolean>>({});
  const [printing, setPrinting] = useState(false);

  const toggleBill = (billId: number) => {
    setExpandedBills(prev => ({
      ...prev,
      [billId]: !prev[billId]
    }));
  };

  const printBill = async (bill: any) => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; direction: rtl; }
              .bill-container { max-width: 800px; margin: 0 auto; padding: 20px; }
              .bill-header { text-align: center; margin-bottom: 20px; }
              .bill-details { margin-bottom: 20px; }
              .bill-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              .bill-table th { background-color: #f2f2f2; }
              .bill-table th, .bill-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
              .total-row { font-weight: bold; background-color: #f8f8f8; }
            </style>
          </head>
          <body>
            <div class="bill-container">
              <div class="bill-header">
                <h1>فاتورة #${bill.id}</h1>
                <p>تاريخ الإصدار: ${bill.created_at}</p>
              </div>
              <div class="bill-details">
                <p>العميل: ${customerData.customer.name}</p>
                <p>قيمة الفاتورة: ${bill.total_cost}</p>
                <p>المدفوعات: ${bill.pay}</p>
                <p>الرصيد السابق: ${bill.old_balance}</p>
                <p>الرصيد الحالي: ${bill.new_balance}</p>
              </div>
              <table class="bill-table">
                <thead>
                  <tr>
                    <th>اسم المادة</th>
                    <th>الكمية المباعة</th>
                    <th>سعر المبيع</th>
                    <th>المجموع</th>
                  </tr>
                </thead>
                <tbody>
                  ${bill.items.map((item: any) => `
                    <tr>
                      <td>${item.name}</td>
                      <td>${item.sold_quantity}</td>
                      <td>${item.sold_price}</td>
                      <td>${item.sold_quantity * item.sold_price}</td>
                    </tr>
                  `).join('')}
                  <tr class="total-row">
                    <td colspan="3">المجموع الكلي</td>
                    <td>${bill.total_cost}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </body>
        </html>
      `;

      await Print.printAsync({
        html,
        orientation: 'portrait',
      });
    } catch (error) {
      console.error('Failed to print:', error);
      alert('فشل في الطباعة. يرجى المحاولة مرة أخرى.');
    }
  };

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
          <View key={`bill-${bill.id}`} className='flex-1 flex-col bg-white rounded-xl p-2 m-2'>
            <TouchableOpacity onPress={() => toggleBill(bill.id)} className='flex-1'>
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
              {expandedBills[bill.id] && (
                <View>
                  <View className='w-full h-0.5 bg-gray-200 mt-1'></View>
                  <Text className='font-bold w-full text-center p-2'>محتويات الفاتورة:</Text>
                  <View className='flex-1 flex-row w-full bg-gray-100'>
                    <Text className='w-[34%] text-center font-bold '>اسم المادة</Text>
                    <Text className='w-[34%] text-center font-bold '>الكمية المباعة</Text>
                    <Text className='w-[34%] text-center font-bold '>سعر المبيع</Text>
                  </View>
                  {bill.items.map((item: any, index: number) => {
                    const itemKey = `${bill.id}-${item.item_id || index}`;
                    const isVisible = customerData.visibleItems?.includes(itemKey);
                    return (
                      <View key={`bill-item-${itemKey}`} className='flex-1 flex-row w-full bg-gray-50'>
                        <Text className='w-[34%] text-center p-2 border-r-gray-50'>{item.name}</Text>
                        <Text className='w-[34%] text-center p-2'>{item.sold_quantity}</Text>
                        <Text className='w-[34%] text-center p-2'>{item.sold_price}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => printBill(bill)}
              className='bg-blue-500 p-2 rounded mt-2 flex-row justify-center items-center'
              disabled={printing}
            >
              {printing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className='text-white text-center'>طباعة الفاتورة</Text>
              )}
            </TouchableOpacity>
          </View>
        ))} 
      </View>

      <View>
        <Text className='text-2xl font-bold m-1 text-black text-center'>المدفوعات</Text>
        {customerData.payments.map((payment: any) => (
          <View key={`payment-${payment.id}`} className='flex-1 flex-col bg-white rounded-xl p-2 m-1'>
            <View className='flex-1 flex-row-reverse w-full bg-gray-50 p-1'>
              <Text className='font-bold w-[50%] text-center p-1'>دفع:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{payment.amount}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full bg-gray-50 p-1'>
              <Text className='font-bold w-[50%] text-center p-1'>ملاحظات:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{payment.note}</Text>
            </View>
            <View className='flex-1 flex-row-reverse w-full bg-gray-50 p-1'>
              <Text className='font-bold w-[50%] text-center p-1'>بتاريخ:</Text>
              <Text className='bg-gray-100 font-bold w-[50%] text-center p-1'>{payment.created_at}</Text>
            </View>
          </View>
        ))}
      </View>
      </View>
    </ScrollView>
  );
}


