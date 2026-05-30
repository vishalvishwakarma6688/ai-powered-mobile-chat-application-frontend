import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DeleteMessageDialogProps {
    visible: boolean;
    onClose: () => void;
    onDeleteForMe: () => void;
    onDeleteForEveryone: () => void;
    isOwnMessage: boolean;
    canDeleteForEveryone: boolean; // Based on time limit
}

export default function DeleteMessageDialog({
    visible,
    onClose,
    onDeleteForMe,
    onDeleteForEveryone,
    isOwnMessage,
    canDeleteForEveryone,
}: DeleteMessageDialogProps) {
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
                    {/* Header */}
                    <View className="px-6 py-4 border-b border-slate-700">
                        <Text className="text-white text-lg font-semibold">
                            Delete Message?
                        </Text>
                    </View>

                    {/* Options */}
                    <View className="py-2">
                        {/* Delete for Everyone (only option available) */}
                        {canDeleteForEveryone ? (
                            <TouchableOpacity
                                onPress={() => {
                                    onDeleteForEveryone();
                                    onClose();
                                }}
                                className="flex-row items-center px-6 py-4 active:bg-slate-800/50"
                            >
                                <View className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center">
                                    <Ionicons name="trash" size={20} color="#EF4444" />
                                </View>
                                <View className="ml-4 flex-1">
                                    <Text className="text-white text-base font-medium">
                                        Delete for everyone
                                    </Text>
                                    <Text className="text-slate-400 text-xs mt-0.5">
                                        This message will be removed for all participants
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <View className="px-6 py-4 bg-slate-800/30">
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="information-circle-outline" size={20} color="#94A3B8" />
                                    <Text className="text-white text-base font-medium ml-2">
                                        Cannot Delete
                                    </Text>
                                </View>
                                <Text className="text-slate-400 text-xs">
                                    You can only delete messages within 1 hour of sending
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* Cancel Button */}
                    <TouchableOpacity
                        onPress={onClose}
                        className="px-6 py-4 border-t border-slate-700"
                    >
                        <Text className="text-slate-400 text-center text-base font-medium">
                            Cancel
                        </Text>
                    </TouchableOpacity>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
