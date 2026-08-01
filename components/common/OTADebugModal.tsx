import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Updates from 'expo-updates';

interface OTADebugModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function OTADebugModal({ visible, onClose }: OTADebugModalProps) {
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Idle');
    const [logs, setLogs] = useState<string[]>([]);
    const [meta, setMeta] = useState<any>({});

    const fetchDiagnostics = async () => {
        try {
            setLoading(true);
            setStatusMessage('Fetching Expo Updates metadata...');

            const channel = Updates.channel || 'Not set / Embedded';
            const runtimeVersion = Updates.runtimeVersion || 'Not set';
            const updateId = Updates.updateId || 'Embedded Build (No OTA yet)';
            const isEmbedded = Updates.isEmbeddedLaunch ? 'Yes (Local APK)' : 'No (OTA Bundle)';
            const isEnabled = Updates.isEnabled ? 'Yes' : 'No';

            setMeta({
                channel,
                runtimeVersion,
                updateId,
                isEmbedded,
                isEnabled,
            });

            // Fetch native log entries
            if (Updates.readLogEntriesAsync) {
                const entries = await Updates.readLogEntriesAsync(60000);
                const formattedLogs = entries.map(
                    (entry: any) => `[${entry.time || entry.createdAt ? new Date(entry.time || entry.createdAt).toLocaleTimeString() : 'Log'}] ${entry.message}`
                );
                setLogs(formattedLogs.reverse());
            }

            setStatusMessage('Diagnostics loaded successfully.');
        } catch (e: any) {
            setStatusMessage(`Error: ${e?.message || e}`);
        } finally {
            setLoading(false);
        }
    };

    const handleForceCheck = async () => {
        try {
            setLoading(true);
            setStatusMessage('Checking for OTA update on server...');

            if (__DEV__ || !Updates.isEnabled) {
                setStatusMessage('Updates are disabled in Development/Expo Go mode. Run in standalone APK.');
                setLoading(false);
                return;
            }

            const update = await Updates.checkForUpdateAsync();

            if (update.isAvailable) {
                setStatusMessage('🔄 New update found! Downloading...');
                await Updates.fetchUpdateAsync();
                setStatusMessage('✅ Download complete! Reloading app...');
                setTimeout(async () => {
                    await Updates.reloadAsync();
                }, 1000);
            } else {
                setStatusMessage('✅ App is up to date! (No new update on server)');
            }
        } catch (e: any) {
            console.error('Check update error:', e);
            setStatusMessage(`❌ Check failed: ${e?.message || e}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible) {
            fetchDiagnostics();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-[#1E293B] rounded-t-3xl p-6 border-t border-slate-800 h-[80%]">
                    {/* Header */}
                    <View className="flex-row items-center justify-between pb-4 border-b border-slate-800">
                        <View className="flex-row items-center">
                            <Ionicons name="build-outline" size={24} color="#6C5CE7" />
                            <Text className="text-white text-lg font-bold ml-2.5">
                                OTA Auto-Update Diagnostics
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="p-1">
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="flex-1 my-4">
                        {/* Status Message Box */}
                        <View className="bg-slate-900 rounded-2xl p-4 mb-4 border border-slate-700">
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                Status
                            </Text>
                            <Text className="text-white font-medium text-sm">
                                {statusMessage}
                            </Text>
                        </View>

                        {/* Metadata Details */}
                        <View className="bg-slate-900/60 rounded-2xl p-4 mb-4 border border-slate-800">
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
                                App Update Configuration
                            </Text>

                            <View className="flex-row justify-between py-1.5 border-b border-slate-800">
                                <Text className="text-slate-400 text-xs">Channel</Text>
                                <Text className="text-white text-xs font-semibold">{meta.channel}</Text>
                            </View>
                            <View className="flex-row justify-between py-1.5 border-b border-slate-800">
                                <Text className="text-slate-400 text-xs">Runtime Version</Text>
                                <Text className="text-white text-xs font-semibold">{meta.runtimeVersion}</Text>
                            </View>
                            <View className="flex-row justify-between py-1.5 border-b border-slate-800">
                                <Text className="text-slate-400 text-xs">Updates Enabled</Text>
                                <Text className="text-white text-xs font-semibold">{meta.isEnabled}</Text>
                            </View>
                            <View className="flex-row justify-between py-1.5 border-b border-slate-800">
                                <Text className="text-slate-400 text-xs">Embedded Launch</Text>
                                <Text className="text-white text-xs font-semibold">{meta.isEmbedded}</Text>
                            </View>
                            <View className="flex-row justify-between py-1.5">
                                <Text className="text-slate-400 text-xs">Running Update ID</Text>
                                <Text className="text-white text-xs font-semibold" numberOfLines={1} style={{ maxWidth: 180 }}>
                                    {meta.updateId}
                                </Text>
                            </View>
                        </View>

                        {/* Logs Console */}
                        <View className="bg-slate-950 rounded-2xl p-4 border border-slate-800">
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                                Native Expo Updates Logs ({logs.length})
                            </Text>
                            {logs.length === 0 ? (
                                <Text className="text-slate-600 text-xs italic">No native log entries recorded yet.</Text>
                            ) : (
                                logs.map((log, index) => (
                                    <Text key={index} className="text-emerald-400 font-mono text-[11px] mb-1">
                                        {log}
                                    </Text>
                                ))
                            )}
                        </View>
                    </ScrollView>

                    {/* Action Buttons */}
                    <View className="flex-row items-center space-x-3 pt-2">
                        <TouchableOpacity
                            onPress={handleForceCheck}
                            disabled={loading}
                            className="flex-1 py-3.5 rounded-2xl bg-[#6C5CE7] items-center justify-center flex-row"
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <>
                                    <Ionicons name="refresh" size={18} color="#fff" />
                                    <Text className="text-white font-semibold ml-2">Check & Install Update</Text>
                                </>
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={onClose}
                            className="px-5 py-3.5 rounded-2xl bg-slate-800 items-center justify-center"
                        >
                            <Text className="text-white font-semibold">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
