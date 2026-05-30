import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

interface VoiceNotePlayerProps {
    audioUrl: string;
    duration: number;
    waveform: number[];
    isOwnMessage: boolean;
}

export default function VoiceNotePlayer({
    audioUrl,
    duration,
    waveform,
    isOwnMessage,
}: VoiceNotePlayerProps) {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [position, setPosition] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const positionInterval = useRef<NodeJS.Timeout | null>(null);

    // Debug log to check received data
    useEffect(() => {
        console.log('🎵 VoiceNotePlayer received:', {
            audioUrl,
            duration,
            waveformLength: waveform?.length,
            isOwnMessage
        });
    }, [audioUrl, duration, waveform, isOwnMessage]);

    useEffect(() => {
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
            if (positionInterval.current) {
                clearInterval(positionInterval.current);
            }
        };
    }, [sound]);

    const loadSound = async () => {
        try {
            setIsLoading(true);

            // Construct full URL with server IP
            const fullUrl = audioUrl.startsWith('http')
                ? audioUrl
                : `http://172.18.58.26:5000${audioUrl}`;

            console.log('🎵 Loading audio from:', fullUrl);

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: fullUrl },
                { shouldPlay: false }
            );

            setSound(newSound);
            setIsLoading(false);

            // Set up playback status update
            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded) {
                    if (status.didJustFinish) {
                        setIsPlaying(false);
                        setPosition(0);
                        if (positionInterval.current) {
                            clearInterval(positionInterval.current);
                        }
                    }
                }
            });

            return newSound;
        } catch (error) {
            console.error('Error loading sound:', error);
            setIsLoading(false);
            return null;
        }
    };

    const handlePlayPause = async () => {
        try {
            let currentSound = sound;

            if (!currentSound) {
                currentSound = await loadSound();
                if (!currentSound) return;
            }

            const status = await currentSound.getStatusAsync();

            if (status.isLoaded) {
                if (isPlaying) {
                    // Pause
                    await currentSound.pauseAsync();
                    setIsPlaying(false);
                    if (positionInterval.current) {
                        clearInterval(positionInterval.current);
                    }
                } else {
                    // Play
                    await currentSound.playAsync();
                    setIsPlaying(true);

                    // Update position
                    positionInterval.current = setInterval(async () => {
                        const currentStatus = await currentSound.getStatusAsync();
                        if (currentStatus.isLoaded && currentStatus.positionMillis) {
                            setPosition(currentStatus.positionMillis / 1000);
                        }
                    }, 100);
                }
            }
        } catch (error) {
            console.error('Error playing/pausing sound:', error);
        }
    };

    const formatTime = (seconds: number) => {
        // Handle invalid or missing duration
        if (!seconds || isNaN(seconds) || seconds < 0) {
            return '0:00';
        }

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = duration > 0 ? position / duration : 0;
    const displayTime = isPlaying ? formatTime(position) : formatTime(duration || 0);

    return (
        <View className="flex-row items-center py-1 px-2 min-w-[200px] max-w-[250px]">
            {/* Play/Pause Button */}
            <TouchableOpacity
                onPress={handlePlayPause}
                disabled={isLoading}
                className={`w-9 h-9 rounded-full items-center justify-center mr-2 flex-shrink-0 ${isOwnMessage ? 'bg-white/20' : 'bg-[#6C5CE7]/20'
                    }`}
            >
                {isLoading ? (
                    <Ionicons
                        name="hourglass-outline"
                        size={18}
                        color={isOwnMessage ? '#fff' : '#6C5CE7'}
                    />
                ) : (
                    <Ionicons
                        name={isPlaying ? 'pause' : 'play'}
                        size={18}
                        color={isOwnMessage ? '#fff' : '#6C5CE7'}
                    />
                )}
            </TouchableOpacity>

            {/* Waveform with Progress */}
            <View className="flex-1 h-8 flex-row items-center mr-2 overflow-hidden">
                {waveform && waveform.length > 0 ? (
                    waveform.slice(0, 25).map((value, index) => {
                        const isActive = index / Math.min(waveform.length, 25) <= progress;
                        return (
                            <View
                                key={index}
                                className={`w-1 rounded-full mx-0.5 flex-shrink-0 ${isActive
                                    ? isOwnMessage
                                        ? 'bg-white'
                                        : 'bg-[#6C5CE7]'
                                    : isOwnMessage
                                        ? 'bg-white/30'
                                        : 'bg-slate-400'
                                    }`}
                                style={{ height: Math.max(4, Math.min(32, (value / 100) * 32)) }}
                            />
                        );
                    })
                ) : (
                    // Fallback if no waveform data
                    Array.from({ length: 25 }).map((_, index) => {
                        const isActive = index / 25 <= progress;
                        return (
                            <View
                                key={index}
                                className={`w-1 rounded-full mx-0.5 flex-shrink-0 ${isActive
                                    ? isOwnMessage
                                        ? 'bg-white'
                                        : 'bg-[#6C5CE7]'
                                    : isOwnMessage
                                        ? 'bg-white/30'
                                        : 'bg-slate-400'
                                    }`}
                                style={{ height: Math.random() * 24 + 8 }}
                            />
                        );
                    })
                )}
            </View>

            {/* Duration */}
            <Text
                className={`text-xs font-medium flex-shrink-0 ${isOwnMessage ? 'text-white' : 'text-slate-600'
                    }`}
            >
                {displayTime}
            </Text>
        </View>
    );
}
