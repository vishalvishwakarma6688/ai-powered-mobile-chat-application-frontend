import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';

interface EditMessageDialogProps {
    visible: boolean;
    onClose: () => void;
    onSave: (newText: string) => void;
    originalText: string;
}

export default function EditMessageDialog({
    visible,
    onClose,
    onSave,
    originalText,
}: EditMessageDialogProps) {
    const [text, setText] = useState(originalText);

    // Update text when originalText changes
    useEffect(() => {
        setText(originalText);
    }, [originalText]);

    const handleSave = () => {
        const trimmedText = text.trim();
        if (trimmedText && trimmedText !== originalText) {
            onSave(trimmedText);
        }
        onClose();
    };

    const isChanged = text.trim() !== originalText && text.trim().length > 0;

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
                    className="bg-[#1E293B] rounded-2xl w-full max-w-md overflow-hidden"
                    style={{ elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84 }}
                >
                    {/* Header */}
                    <View className="px-6 py-4 border-b border-slate-700 flex-row items-center justify-between">
                        <Text className="text-white text-lg font-semibold">
                            Edit Message
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    {/* Text Input */}
                    <View className="p-6">
                        <TextInput
                            value={text}
                            onChangeText={setText}
                            multiline
                            autoFocus
                            placeholder="Type your message..."
                            placeholderTextColor="#64748B"
                            className="bg-[#0F172A] text-white rounded-xl px-4 py-3 min-h-[100px] text-base"
                            style={{
                                textAlignVertical: 'top',
                                maxHeight: 200,
                            }}
                        />
                        <Text className="text-slate-400 text-xs mt-2">
                            {text.length} characters
                        </Text>
                    </View>

                    {/* Actions */}
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
                            onPress={handleSave}
                            disabled={!isChanged}
                            className={`flex-1 py-4 items-center justify-center ${!isChanged ? 'opacity-50' : ''
                                }`}
                        >
                            <Text className="text-[#6C5CE7] text-base font-semibold">
                                Save
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}
