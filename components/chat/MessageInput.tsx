import { View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';

interface MessageInputProps {
    onSend: (content: string) => void;
    isSending: boolean;
    onTyping?: (isTyping: boolean) => void;
    onAttachmentPress?: () => void;
}

export default function MessageInput({ onSend, isSending, onTyping, onAttachmentPress }: MessageInputProps) {
    const [message, setMessage] = useState('');
    const isTypingRef = useRef(false);

    const handleTextChange = (text: string) => {
        setMessage(text);

        // Emit typing event
        if (onTyping) {
            if (text.trim().length > 0 && !isTypingRef.current) {
                // Started typing
                isTypingRef.current = true;
                onTyping(true);
            } else if (text.trim().length === 0 && isTypingRef.current) {
                // Stopped typing
                isTypingRef.current = false;
                onTyping(false);
            }
        }
    };

    const handleSend = () => {
        if (message.trim().length === 0 || isSending) return;

        // Stop typing indicator before sending
        if (onTyping && isTypingRef.current) {
            isTypingRef.current = false;
            onTyping(false);
        }

        onSend(message.trim());
        setMessage(''); // Clear input after sending
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View className="px-4 py-3 border-t border-slate-800 bg-[#0F172A]">
                <View className="flex-row items-center">
                    {/* Attachment Button */}
                    <TouchableOpacity
                        className="w-10 h-10 items-center justify-center mr-2"
                        disabled={isSending}
                        onPress={onAttachmentPress}
                    >
                        <Ionicons name="add-circle" size={28} color="#6C5CE7" />
                    </TouchableOpacity>

                    {/* Message Input */}
                    <View className="flex-1 bg-[#1E293B] rounded-full px-4 py-2 flex-row items-center">
                        <TextInput
                            placeholder="Type a message..."
                            placeholderTextColor="#475569"
                            className="flex-1 text-white text-base"
                            value={message}
                            onChangeText={handleTextChange}
                            multiline
                            maxLength={1000}
                            editable={!isSending}
                            onSubmitEditing={handleSend}
                            blurOnSubmit={false}
                        />
                        {message.trim().length > 0 && (
                            <TouchableOpacity
                                onPress={() => setMessage('')}
                                className="ml-2"
                            >
                                <Ionicons name="close-circle" size={20} color="#94A3B8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Send Button */}
                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={message.trim().length === 0 || isSending}
                        className={`w-10 h-10 items-center justify-center ml-2 rounded-full ${message.trim().length > 0 && !isSending
                            ? 'bg-[#6C5CE7]'
                            : 'bg-slate-700'
                            }`}
                    >
                        {isSending ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons
                                name="send"
                                size={20}
                                color={message.trim().length > 0 ? '#fff' : '#475569'}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
