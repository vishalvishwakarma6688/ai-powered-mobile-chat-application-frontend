import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface CustomAlertButton {
    text: string;
    onPress?: () => void;
    style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
    visible: boolean;
    title: string;
    message?: string;
    buttons?: CustomAlertButton[];
    onClose: () => void;
}

export default function CustomAlert({
    visible,
    title,
    message,
    buttons = [{ text: 'OK', style: 'default' }],
    onClose,
}: CustomAlertProps) {
    const handleButtonPress = (button: CustomAlertButton) => {
        if (button.onPress) {
            button.onPress();
        }
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/50 items-center justify-center px-6">
                <View className="bg-[#1E293B] rounded-2xl w-full max-w-sm overflow-hidden">
                    {/* Header */}
                    <View className="px-6 pt-6 pb-4">
                        <Text className="text-white text-lg font-semibold mb-2">
                            {title}
                        </Text>
                        {message && (
                            <Text className="text-slate-300 text-sm leading-5">
                                {message}
                            </Text>
                        )}
                    </View>

                    {/* Buttons */}
                    <View className="border-t border-slate-700">
                        {buttons.map((button, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleButtonPress(button)}
                                className={`px-6 py-4 ${index < buttons.length - 1 ? 'border-b border-slate-700' : ''
                                    }`}
                            >
                                <Text
                                    className={`text-center font-semibold ${button.style === 'destructive'
                                            ? 'text-red-500'
                                            : button.style === 'cancel'
                                                ? 'text-slate-400'
                                                : 'text-[#6C5CE7]'
                                        }`}
                                >
                                    {button.text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

// Helper function to show alert
export const showCustomAlert = (
    title: string,
    message?: string,
    buttons?: CustomAlertButton[]
) => {
    // This will be implemented with a global alert context
    console.log('Custom Alert:', { title, message, buttons });
};
