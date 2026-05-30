import { View, Text, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

interface StickyDateHeaderProps {
    date: string; // ISO date string
    visible: boolean;
}

export default function StickyDateHeader({ date, visible }: StickyDateHeaderProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.delay(1500),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [date, visible]);

    const formatDate = (dateString: string): string => {
        const messageDate = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        // Reset time to compare only dates
        today.setHours(0, 0, 0, 0);
        yesterday.setHours(0, 0, 0, 0);
        messageDate.setHours(0, 0, 0, 0);

        if (messageDate.getTime() === today.getTime()) {
            return 'Today';
        } else if (messageDate.getTime() === yesterday.getTime()) {
            return 'Yesterday';
        } else {
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            return messageDate.toLocaleDateString('en-US', options);
        }
    };

    if (!visible) return null;

    return (
        <Animated.View
            style={{
                opacity: fadeAnim,
                position: 'absolute',
                top: 80,
                left: 0,
                right: 0,
                zIndex: 10,
                alignItems: 'center',
            }}
        >
            <View className="bg-slate-800/90 px-4 py-2 rounded-full shadow-lg">
                <Text className="text-white text-sm font-semibold">
                    {formatDate(date)}
                </Text>
            </View>
        </Animated.View>
    );
}
