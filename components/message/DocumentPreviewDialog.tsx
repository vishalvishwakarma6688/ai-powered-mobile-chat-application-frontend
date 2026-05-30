import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface DocumentPreviewDialogProps {
    visible: boolean;
    fileName: string;
    fileSize: number;
    mimeType: string;
    onClose: () => void;
    onSend: (caption?: string) => void;
    isUploading?: boolean;
}

export default function DocumentPreviewDialog({
    visible,
    fileName,
    fileSize,
    mimeType,
    onClose,
    onSend,
    isUploading = false,
}: DocumentPreviewDialogProps) {
    const [caption, setCaption] = useState('');

    const handleSend = () => {
        onSend(caption || undefined);
        setCaption('');
    };

    const handleClose = () => {
        setCaption('');
        onClose();
    };

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get file icon based on mime type
    const getFileIcon = (): keyof typeof Ionicons.glyphMap => {
        if (mimeType.includes('pdf')) return 'document-text';
        if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'grid';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'easel';
        if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('compressed')) return 'archive';
        if (mimeType.includes('text')) return 'document-text-outline';
        return 'document-attach';
    };

    // Get file color based on type
    const getFileColor = (): string => {
        if (mimeType.includes('pdf')) return '#EF4444';
        if (mimeType.includes('word') || mimeType.includes('document')) return '#3B82F6';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return '#10B981';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '#F59E0B';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '#8B5CF6';
        return '#6C5CE7';
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/80 justify-end">
                <View className="bg-[#0F172A] rounded-t-3xl" style={{ maxHeight: '80%' }}>
                    {/* Header */}
                    <View className="px-4 py-4 border-b border-slate-800 flex-row items-center justify-between">
                        <Text className="text-white font-semibold text-lg">
                            Send Document
                        </Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            disabled={isUploading}
                            className="w-8 h-8 items-center justify-center"
                        >
                            <Ionicons name="close" size={24} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView className="px-4 py-6">
                        {/* Document Preview */}
                        <View className="bg-[#1E293B] rounded-2xl p-4 mb-4">
                            <View className="flex-row items-center">
                                {/* File Icon */}
                                <View
                                    className="w-16 h-16 rounded-xl items-center justify-center mr-4"
                                    style={{ backgroundColor: getFileColor() + '20' }}
                                >
                                    <Ionicons name={getFileIcon()} size={32} color={getFileColor()} />
                                </View>

                                {/* File Info */}
                                <View className="flex-1">
                                    <Text className="text-white font-semibold text-base mb-1" numberOfLines={2}>
                                        {fileName}
                                    </Text>
                                    <Text className="text-slate-400 text-sm">
                                        {formatFileSize(fileSize)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* Caption Input */}
                        <View className="mb-4">
                            <Text className="text-slate-400 text-sm mb-2">
                                Add a caption (optional)
                            </Text>
                            <TextInput
                                value={caption}
                                onChangeText={setCaption}
                                placeholder="Type a caption..."
                                placeholderTextColor="#64748B"
                                multiline
                                numberOfLines={3}
                                maxLength={500}
                                editable={!isUploading}
                                className="bg-[#1E293B] text-white rounded-xl px-4 py-3 text-base"
                                style={{ textAlignVertical: 'top', minHeight: 80 }}
                            />
                            <Text className="text-slate-500 text-xs mt-1 text-right">
                                {caption.length}/500
                            </Text>
                        </View>

                        {/* Send Button */}
                        <TouchableOpacity
                            onPress={handleSend}
                            disabled={isUploading}
                            className={`rounded-full py-4 items-center ${isUploading ? 'bg-slate-700' : 'bg-[#6C5CE7]'
                                }`}
                        >
                            {isUploading ? (
                                <View className="flex-row items-center">
                                    <ActivityIndicator size="small" color="#fff" />
                                    <Text className="text-white font-semibold text-base ml-2">
                                        Uploading...
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-white font-semibold text-base">
                                    Send Document
                                </Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}
