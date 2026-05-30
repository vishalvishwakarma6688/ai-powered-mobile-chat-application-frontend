import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface PopupMenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
    destructive?: boolean;
}

interface CustomPopupMenuProps {
    visible: boolean;
    items: PopupMenuItem[];
    onClose: () => void;
    anchorPosition?: { x: number; y: number };
}

export default function CustomPopupMenu({
    visible,
    items,
    onClose,
    anchorPosition,
}: CustomPopupMenuProps) {
    const handleItemPress = (item: PopupMenuItem) => {
        item.onPress();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable
                className="flex-1 bg-black/50"
                onPress={onClose}
            >
                <View
                    className="absolute bg-[#1E293B] rounded-xl shadow-2xl min-w-[200px] overflow-hidden"
                    style={{
                        top: anchorPosition?.y || 60,
                        right: 16,
                    }}
                >
                    {items.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleItemPress(item)}
                            className={`flex-row items-center px-4 py-3 ${index < items.length - 1 ? 'border-b border-slate-700' : ''
                                } active:bg-slate-700`}
                        >
                            <Ionicons
                                name={item.icon}
                                size={20}
                                color={item.destructive ? '#EF4444' : '#94A3B8'}
                            />
                            <Text
                                className={`ml-3 text-base ${item.destructive ? 'text-red-500' : 'text-white'
                                    }`}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Pressable>
        </Modal>
    );
}
