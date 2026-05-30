import { View, Text, TouchableOpacity, Animated, PanResponder } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';

interface VoiceRecorderProps {
    onSend: (audioUri: string, duration: number, waveform: number[]) => void;
    onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [duration, setDuration] = useState(0);
    const [waveform, setWaveform] = useState<number[]>([]);
    const [isRecording, setIsRecording] = useState(false);
    const slideAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const durationInterval = useRef<NodeJS.Timeout | null>(null);

    // Pan responder for swipe to cancel
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dx < 0) {
                    slideAnim.setValue(gestureState.dx);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dx < -100) {
                    // Swipe left to cancel
                    handleCancel();
                } else {
                    // Return to original position
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        })
    ).current;

    useEffect(() => {
        startRecording();
        return () => {
            stopRecording();
        };
    }, []);

    const startRecording = async () => {
        try {
            // Request permissions
            const { status } = await Audio.requestPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access microphone is required!');
                onCancel();
                return;
            }

            // Configure audio mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            // Start recording
            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);

            // Start duration timer
            durationInterval.current = setInterval(() => {
                setDuration((prev) => prev + 1);
            }, 1000);

            // Pulse animation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Simulate waveform data (in real app, you'd get this from audio analysis)
            const waveformInterval = setInterval(() => {
                setWaveform((prev) => {
                    const newWaveform = [...prev, Math.random() * 100];
                    return newWaveform.slice(-50); // Keep last 50 values
                });
            }, 100);

            return () => clearInterval(waveformInterval);
        } catch (error) {
            console.error('Failed to start recording:', error);
            onCancel();
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        try {
            if (durationInterval.current) {
                clearInterval(durationInterval.current);
            }

            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();

            if (uri) {
                onSend(uri, duration, waveform);
            }
        } catch (error) {
            console.error('Failed to stop recording:', error);
        }
    };

    const handleCancel = async () => {
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
            } catch (error) {
                console.error('Failed to cancel recording:', error);
            }
        }
        if (durationInterval.current) {
            clearInterval(durationInterval.current);
        }
        onCancel();
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={{ transform: [{ translateX: slideAnim }] }}
            className="bg-[#0F172A] px-4 py-3 border-t border-slate-800"
        >
            <View className="flex-row items-center">
                {/* Cancel Button */}
                <TouchableOpacity
                    onPress={handleCancel}
                    className="w-10 h-10 items-center justify-center mr-2"
                >
                    <Ionicons name="close" size={24} color="#EF4444" />
                </TouchableOpacity>

                {/* Recording Indicator */}
                <Animated.View
                    style={{ transform: [{ scale: scaleAnim }] }}
                    className="w-3 h-3 bg-red-500 rounded-full mr-2"
                />

                {/* Waveform Visualization */}
                <View className="flex-1 flex-row items-center h-10 mr-2 overflow-hidden">
                    {waveform.slice(-30).map((value, index) => (
                        <View
                            key={index}
                            className="w-1 bg-[#6C5CE7] rounded-full mx-0.5"
                            style={{ height: Math.max(4, Math.min(40, (value / 100) * 40)) }}
                        />
                    ))}
                </View>

                {/* Duration */}
                <Text className="text-white text-sm font-medium mr-2 min-w-[45px]">
                    {formatDuration(duration)}
                </Text>

                {/* Send Button */}
                <TouchableOpacity
                    onPress={stopRecording}
                    className="w-10 h-10 bg-[#6C5CE7] rounded-full items-center justify-center"
                >
                    <Ionicons name="send" size={18} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Swipe to cancel hint */}
            <View className="mt-1 items-center">
                <Text className="text-slate-400 text-xs">
                    ← Swipe left to cancel
                </Text>
            </View>
        </Animated.View>
    );
}
