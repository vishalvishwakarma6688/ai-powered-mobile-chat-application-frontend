import { View, Text } from 'react-native';

interface DateSeparatorProps {
    date: string; // ISO date string
}

export default function DateSeparator({ date }: DateSeparatorProps) {
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
            // Format as "December 25, 2024" or "25/12/2024" based on preference
            const options: Intl.DateTimeFormatOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            };
            return messageDate.toLocaleDateString('en-US', options);
        }
    };

    return (
        <View className="flex-row justify-center items-center my-4">
            <View className="bg-slate-800/80 px-4 py-1.5 rounded-full">
                <Text className="text-slate-300 text-xs font-medium">
                    {formatDate(date)}
                </Text>
            </View>
        </View>
    );
}
