import Button from '@/components/Button';
import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import "../global.css";
import { useBox } from '../src/crud/money';

export default function App() {
  const boxValue = useBox();

  return (

    <>
      <View style={styles.container}>  
        <View style={styles.header}>  
          <Text style={styles.headerText}>App Name</Text>  
        </View>  
        
        <View style={styles.box}>  
          <Text style={styles.boxText}>الصندوق : {boxValue}</Text>  
        </View>  
      </View>  
      <View style={styles.buttonContainer}>  
        <Button target='/customer' label='customer' theme='primary'></Button>
        <Button target='/item' label='items' theme='primary'></Button>
        <Button target='/traders' label='traders' theme='primary'></Button>
        {/* <Button target='/bill_in' label='مبيع' theme='primary'></Button> */}
        <Button target='/bill_out' label='شراء' theme='primary'></Button>
        <Button target='/money' label='مقبوضات\مدفوعات' theme='primary'></Button>
        <TouchableOpacity 
           
          // label='تصدير البيانات' 
          // theme='primary'
          className='w-32 h-32 bg-black '
          onPress={async () => {
            try {
              const { exportDataToExcel } = await import('@/src/excel');
              await exportDataToExcel();
              alert('تم تصدير البيانات بنجاح');
            } catch (error) {
              console.error('Export failed:', error);
              alert('فشل تصدير البيانات');
            }
          }}
        ></TouchableOpacity>
      </View> 
    </> 
  );
}

const styles = StyleSheet.create({  
    container: {  
        flexDirection: 'column',  
        padding: 16,  
        alignItems: 'center',  
        overflowY: 'scroll',  
    },  
    header: {  
        flexDirection: 'row',  
        height: 128,  
        justifyContent: 'center',  
        alignItems: 'center',  
    },  
    headerText: {  
        fontWeight: 'bold',  
        fontSize: 50, // text-8xl equivalent  
        color: '#color-primary', // replace with actual color  
    },  
    box: {  
        backgroundColor: '#FCa311',  
        borderRadius: 8,  
        width: '70%',  
        height: 128,  
        justifyContent: 'center',  
        alignItems: 'center',  
    },  
    boxText: {  
        color: 'black',  
        fontSize: 32, // text-4xl equivalent  
        fontWeight: 'bold',  
    },  
    buttonContainer: {  
        flex: 1,  
        flexDirection: 'row',  
        alignItems: 'center',  
        flexWrap: 'wrap',  
        justifyContent: 'center',  
        gap: 20, // Note: React Native doesn't support gap directly, you'll need to add margin or padding  
        paddingVertical: 16,  
    },  
});  
