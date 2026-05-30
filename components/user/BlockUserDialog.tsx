import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BlockUserDialogProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => void;
    username: string;
}

export default function BlockUserDialog({
    visible,
    onClose,
    onConfirm,
    username,
}: BlockUserDialogProps) {
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
                    className="bg-[#1E293B] rounded-2xl w-full max-w-sm overflow-hidden"
                    style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                >
                    {/* Icon */}
                    <View className="items-center pt-6 pb-4">
                        <View className="w-16 h-16 rounded-full bg-red-500/10 items-center justify-center mb-4">
                            <Ionicons name="ban" size={32} color="#EF4444" />
                        </View>
                        <Text className="text-white text-xl font-semibold">
                            Block {username}?
                        </Text>
                    </View>

                    {/* Message */}
                    <View className="px-6 pb-6">
                        <Text className="text-slate-400 text-center text-sm leading-5">
                            Blocked contacts will no longer be able to call you or send you messages.
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="flex-row border-t border-slate-700">
                        <TouchableOpacity
                            onPress={onClose}
                            className="flex-1 py-4 items-center justify-center border-r border-slate-700"
                        >
                            <Text className="text-slate-400 text-base font-medium">
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 py-4 items-center justify-center"
                        >
                            <Text className="text-red-500 text-base font-semibold">
                                Block
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
