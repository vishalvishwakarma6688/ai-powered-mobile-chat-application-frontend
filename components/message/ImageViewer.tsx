import { Modal, View, Image, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

interface ImageViewerProps {
    visible: boolean;
    imageUrl: string;
    onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function ImageViewer({ visible, imageUrl, onClose }: ImageViewerProps) {
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

    // Get image dimensions
    Image.getSize(imageUrl, (w, h) => {
        const aspectRatio = w / h;
        let displayWidth = width;
        let displayHeight = width / aspectRatio;

        if (displayHeight > height) {
            displayHeight = height;
            displayWidth = height * aspectRatio;
        }

        setImageSize({ width: displayWidth, height: displayHeight });
    });

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Close Button */}
                <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                >
                    <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>

                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: imageUrl }}
                        style={[
                            styles.image,
                            imageSize.width > 0 && {
                                width: imageSize.width,
                                height: imageSize.height,
                            },
                        ]}
                        resizeMode="contain"
                    />
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: width,
        height: height,
    },
});
