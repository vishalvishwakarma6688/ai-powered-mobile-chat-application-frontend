import { View, Text, TouchableOpacity, Modal, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

interface AttachmentMenuItem {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    color: string;
    onPress: () => void;
}

interface AttachmentMenuProps {
    visible: boolean;
    onClose: () => void;
    items: AttachmentMenuItem[];
}

export default function AttachmentMenu({ visible, onClose, items }: AttachmentMenuProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    useNativeDriver: true,
                    tension: 100,
                    friction: 8,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={onClose}
                className="flex-1"
            >
                {/* Backdrop */}
                <Animated.View
                    style={{ opacity: opacityAnim }}
                    className="absolute inset-0 bg-black/50"
                />

                {/* Menu positioned at bottom left */}
                <View className="absolute bottom-20 left-4">
                    <Animated.View
                        style={{
                            transform: [{ scale: scaleAnim }],
                            opacity: opacityAnim,
                        }}
                        className="bg-[#1E293B] rounded-2xl p-4 shadow-2xl border border-slate-700"
                    >
                        {/* Menu Items Grid */}
                        <View className="flex-row flex-wrap" style={{ width: 280 }}>
                            {items.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => {
                                        item.onPress();
                                        onClose();
                                    }}
                                    className="w-1/3 items-center mb-4"
                                >
                                    <View
                                        className="w-14 h-14 rounded-full items-center justify-center mb-2"
                                        style={{ backgroundColor: item.color + '20' }}
                                    >
                                        <Ionicons name={item.icon} size={24} color={item.color} />
                                    </View>
                                    <Text className="text-white text-xs text-center" numberOfLines={2}>
                                        {item.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </TouchableOpacity>
        </Modal>
    );
}
