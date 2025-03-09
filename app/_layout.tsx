import { Stack } from "expo-router";
import React, { useEffect } from 'react';
import { runMigrations } from '../src/database'; // Import the runMigrations function
import { useSecurityCheck } from '../src/components/SecurityModal'; // Import the new security hook

export default function Rootlayout() {
    const { SecurityModal } = useSecurityCheck();

    useEffect(() => {
        // Run database migrations when the app starts
        const preload = async () => {
            try {
                await runMigrations();
                console.log("Database migrations preloaded successfully");
            } catch (error) {
                console.error("Error preloading database migrations:", error);
            }
        };

        preload();
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return (
        <>
            <SecurityModal />
            <Stack>
                <Stack.Screen name='index' options={{ headerShown: false }} />
            </Stack>
        </>
    );
}