import React from "react";  
import { View, Pressable, Text, StyleSheet } from "react-native";  
import { useRouter } from "expo-router";  

type Props = {  
    label: string;  
    theme?: 'primary';  
    target: string;  
};  

export default function Button({ label, theme, target }: Props) {  
    const router = useRouter();  

    const handlePress = () => {  
        router.push(target);  
    };  

    if (theme === 'primary') {  
        return (  
            <View style={styles.buttonContainer}>  
                <Pressable   
                    onPress={handlePress}   
                    style={styles.primaryButton}  
                >  
                    <Text style={styles.buttonText}>{label}</Text>  
                </Pressable>  
            </View>  
        );  
    }  

    return (  
        <View style={styles.defaultButtonContainer}>  
            <Pressable onPress={handlePress}>  
                <Text>{label}</Text>  
            </Pressable>  
        </View>  
    );  
}  

const styles = StyleSheet.create({  
    buttonContainer: {  
        justifyContent: 'center',  
        alignItems: 'center',  
    },  
    primaryButton: {  
        width: 128, // w-32 equivalent  
        height: 128, // h-32 equivalent  
        justifyContent: 'center',  
        alignItems: 'center',  
        backgroundColor: '#14213d', // replace with your actual primary color  
        borderRadius: 16, // rounded-lg equivalent  
    },  
    buttonText: {  
        color: 'white',  
        fontWeight: 'bold',  
        fontFamily: 'Cairo', // Ensure the font is imported and available in your project  
    },  
    defaultButtonContainer: {  
        width: 256, // w-64 equivalent  
        backgroundColor: '#14213d', // replace with your actual primary color  
    },  
});