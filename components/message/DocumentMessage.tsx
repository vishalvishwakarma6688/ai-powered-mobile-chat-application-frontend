import { View, Text, TouchableOpacity, Linking, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface DocumentMessageProps {
    fileName: string;
    fileSize: number;
    fileUrl: string;
    mimeType: string;
    isOwnMessage: boolean;
}

export default function DocumentMessage({
    fileName,
    fileSize,
    fileUrl,
    mimeType,
    isOwnMessage,
}: DocumentMessageProps) {
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

    // Get file type label
    const getFileTypeLabel = (): string => {
        if (mimeType.includes('pdf')) return 'PDF';
        if (mimeType.includes('word')) return 'Word';
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'Excel';
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'PowerPoint';
        if (mimeType.includes('zip')) return 'ZIP';
        if (mimeType.includes('rar')) return 'RAR';
        if (mimeType.includes('text')) return 'Text';
        return 'Document';
    };

    // Handle download/open
    const handleDownload = async () => {
        try {
            const fullUrl = `http://172.18.58.26:5000${fileUrl}`;
            console.log('📄 Downloading document:', fullUrl);

            // Download the file
            const fileUri = FileSystem.documentDirectory + fileName;
            const downloadResult = await FileSystem.downloadAsync(fullUrl, fileUri);

            console.log('✅ Document downloaded:', downloadResult.uri);

            // Share/Open the file
            const canShare = await Sharing.isAvailableAsync();
            if (canShare) {
                await Sharing.shareAsync(downloadResult.uri);
            } else {
                Alert.alert('Success', 'Document downloaded successfully!');
            }
        } catch (error) {
            console.error('❌ Error downloading document:', error);
            Alert.alert('Error', 'Failed to download document. Please try again.');
        }
    };

    return (
        <TouchableOpacity
            onPress={handleDownload}
            activeOpacity={0.9}
            style={styles.container}
        >
            <View style={styles.content}>
                {/* File Icon */}
                <View style={[styles.iconContainer, { backgroundColor: getFileColor() + '20' }]}>
                    <Ionicons name={getFileIcon()} size={28} color={getFileColor()} />
                </View>

                {/* File Info */}
                <View style={styles.infoContainer}>
                    <Text style={styles.fileName} numberOfLines={2}>
                        {fileName}
                    </Text>
                    <View style={styles.metaRow}>
                        <Text style={styles.fileType}>{getFileTypeLabel()}</Text>
                        <Text style={styles.separator}>•</Text>
                        <Text style={styles.fileSize}>{formatFileSize(fileSize)}</Text>
                    </View>
                </View>

                {/* Download Icon */}
                <View style={styles.downloadButton}>
                    <Ionicons name="download-outline" size={20} color="#6C5CE7" />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 280,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 12,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        marginRight: 8,
    },
    fileName: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileType: {
        color: '#94A3B8',
        fontSize: 12,
    },
    separator: {
        color: '#64748B',
        fontSize: 12,
        marginHorizontal: 6,
    },
    fileSize: {
        color: '#94A3B8',
        fontSize: 12,
    },
    downloadButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#6C5CE720',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
