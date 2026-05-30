import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface MessageOption {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    destructive?: boolean;
}

interface MessageOptionsMenuProps {
    visible: boolean;
    onClose: () => void;
    options: MessageOption[];
    isOwnMessage: boolean;
}

export default function MessageOptionsMenu({
    visible,
    onClose,
    options,
    isOwnMessage,
}: MessageOptionsMenuProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="flex-1 bg-black/50 justify-center items-center px-4"
            >
                <TouchableOpacity
                    activeOpacity={1}
                    className="bg-[#1E293B] rounded-2xl w-full max-w-xs overflow-hidden"
                    style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                >
                    {/* Options */}
                    <View className="py-1">
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                onPress={() => {
                                    option.onPress();
                                    onClose();
                                }}
                                className="flex-row items-center px-4 py-3 active:bg-slate-800/50"
                            >
                                <View
                                    className={`w-8 h-8 rounded-full items-center justify-center ${option.destructive ? 'bg-red-500/10' : 'bg-[#6C5CE7]/10'
                                        }`}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={18}
                                        color={option.destructive ? '#EF4444' : '#6C5CE7'}
                                    />
                                </View>
                                <Text
                                    className={`ml-3 text-sm ${option.destructive ? 'text-red-500' : 'text-white'
                                        }`}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
