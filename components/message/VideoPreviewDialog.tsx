import { Modal, View, TouchableOpacity, TextInput, Dimensions, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Video, ResizeMode } from 'expo-av';

interface VideoPreviewDialogProps {
    visible: boolean;
    videoUri: string;
    onClose: () => void;
    onSend: (caption?: string) => void;
}

const { width, height } = Dimensions.get('window');

export default function VideoPreviewDialog({ visible, videoUri, onClose, onSend }: VideoPreviewDialogProps) {
    const [caption, setCaption] = useState('');

    const handleSend = () => {
        onSend(caption || undefined);
        setCaption(''); // Reset caption after sending
    };

    const handleClose = () => {
        setCaption(''); // Reset caption on close
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Video Preview */}
                <View style={styles.videoContainer}>
                    <Video
                        source={{ uri: videoUri }}
                        style={styles.video}
                        useNativeControls
                        resizeMode={ResizeMode.CONTAIN}
                        isLooping
                    />
                </View>

                {/* Caption Input & Send Button */}
                <View style={styles.footer}>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Add a caption..."
                            placeholderTextColor="#94A3B8"
                            value={caption}
                            onChangeText={setCaption}
                            multiline
                            maxLength={500}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSend}
                    >
                        <Ionicons name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
    },
    video: {
        width: width - 32,
        height: height * 0.6,
        backgroundColor: '#000',
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 24,
        backgroundColor: '#1E293B',
        borderTopWidth: 1,
        borderTopColor: '#334155',
    },
    inputContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        maxHeight: 100,
    },
    input: {
        color: '#fff',
        fontSize: 16,
        maxHeight: 80,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6C5CE7',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
