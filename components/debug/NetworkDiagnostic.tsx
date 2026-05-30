import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../lib/config/api.config';

export default function NetworkDiagnostic() {
    const [testing, setTesting] = useState(false);
    const [results, setResults] = useState<{
        configUrl: string;
        healthCheck: { success: boolean; message: string; data?: any };
        timestamp: string;
    } | null>(null);

    const testConnection = async () => {
        setTesting(true);
        const timestamp = new Date().toLocaleTimeString();

        try {
            console.log('🔍 Testing connection to:', API_URL);

            const response = await fetch(`${API_URL}/health`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            setResults({
                configUrl: API_URL,
                healthCheck: {
                    success: response.ok,
                    message: response.ok ? 'Backend is accessible!' : `HTTP ${response.status}`,
                    data: data,
                },
                timestamp,
            });

            console.log('✅ Health check passed:', data);
        } catch (error: any) {
            console.error('❌ Health check failed:', error);
            setResults({
                configUrl: API_URL,
                healthCheck: {
                    success: false,
                    message: error.message || 'Connection failed',
                },
                timestamp,
            });
        } finally {
            setTesting(false);
        }
    };

    useEffect(() => {
        // Auto-test on mount
        testConnection();
    }, []);

    return (
        <View className="bg-slate-800 rounded-xl p-4 m-4">
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                    <Ionicons name="bug" size={24} color="#6C5CE7" />
                    <Text className="text-white text-lg font-bold ml-2">Network Diagnostic</Text>
                </View>
                <TouchableOpacity
                    onPress={testConnection}
                    disabled={testing}
                    className="bg-[#6C5CE7] px-4 py-2 rounded-lg"
                >
                    {testing ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className="text-white font-semibold">Test</Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView className="max-h-96">
                {/* Configuration */}
                <View className="mb-4">
                    <Text className="text-gray-400 text-sm font-semibold mb-2">📍 Configuration</Text>
                    <View className="bg-slate-900 rounded-lg p-3">
                        <Text className="text-white font-mono text-xs">{API_URL}</Text>
                    </View>
                </View>

                {/* Results */}
                {results && (
                    <>
                        <View className="mb-4">
                            <Text className="text-gray-400 text-sm font-semibold mb-2">
                                🔍 Health Check
                            </Text>
                            <View
                                className={`rounded-lg p-3 ${results.healthCheck.success ? 'bg-green-900/30' : 'bg-red-900/30'
                                    }`}
                            >
                                <View className="flex-row items-center mb-2">
                                    <Ionicons
                                        name={results.healthCheck.success ? 'checkmark-circle' : 'close-circle'}
                                        size={20}
                                        color={results.healthCheck.success ? '#10B981' : '#EF4444'}
                                    />
                                    <Text
                                        className={`ml-2 font-semibold ${results.healthCheck.success ? 'text-green-400' : 'text-red-400'
                                            }`}
                                    >
                                        {results.healthCheck.message}
                                    </Text>
                                </View>
                                {results.healthCheck.data && (
                                    <Text className="text-gray-300 font-mono text-xs">
                                        {JSON.stringify(results.healthCheck.data, null, 2)}
                                    </Text>
                                )}
                            </View>
                        </View>

                        <Text className="text-gray-500 text-xs">Last tested: {results.timestamp}</Text>
                    </>
                )}

                {/* Instructions */}
                {results && !results.healthCheck.success && (
                    <View className="mt-4 bg-yellow-900/20 rounded-lg p-3 border border-yellow-700">
                        <Text className="text-yellow-400 font-semibold mb-2">⚠️ Connection Failed</Text>
                        <Text className="text-yellow-200 text-sm mb-2">Possible causes:</Text>
                        <Text className="text-yellow-200 text-xs">• Backend server not running</Text>
                        <Text className="text-yellow-200 text-xs">• Wrong IP address in config</Text>
                        <Text className="text-yellow-200 text-xs">• Firewall blocking port 5000</Text>
                        <Text className="text-yellow-200 text-xs">• Different Wi-Fi networks</Text>
                        <Text className="text-yellow-200 text-sm mt-2 font-semibold">
                            Fix: Edit frontend/lib/config/api.config.ts
                        </Text>
                    </View>
                )}

                {results && results.healthCheck.success && (
                    <View className="mt-4 bg-green-900/20 rounded-lg p-3 border border-green-700">
                        <Text className="text-green-400 font-semibold mb-2">✅ Connection Successful</Text>
                        <Text className="text-green-200 text-sm">
                            Backend is accessible! If you still get errors, try:
                        </Text>
                        <Text className="text-green-200 text-xs mt-2">• Restart the app</Text>
                        <Text className="text-green-200 text-xs">• Clear app cache</Text>
                        <Text className="text-green-200 text-xs">• Check authentication</Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
