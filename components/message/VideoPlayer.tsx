import { View, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface VideoPlayerProps {
    videoUrl: string;
    isOwnMessage?: boolean;
}

export default function VideoPlayer({ videoUrl, isOwnMessage = false }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [showFullScreen, setShowFullScreen] = useState(false);
    const videoRef = useRef<Video>(null);
    const fullScreenVideoRef = useRef<Video>(null);

    const handlePlayPause = async () => {
        if (videoRef.current) {
            if (isPlaying) {
                await videoRef.current.pauseAsync();
            } else {
                await videoRef.current.playAsync();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleFullScreen = () => {
        setShowFullScreen(true);
    };

    const handleCloseFullScreen = async () => {
        if (fullScreenVideoRef.current) {
            await fullScreenVideoRef.current.pauseAsync();
        }
        setShowFullScreen(false);
    };

    const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
        }
    };

    return (
        <>
            {/* Inline Video Player */}
            <View style={styles.container}>
                <Video
                    ref={videoRef}
                    source={{ uri: videoUrl }}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    shouldPlay={false}
                />

                {/* Play/Pause Overlay */}
                <TouchableOpacity
                    style={styles.overlay}
                    onPress={handlePlayPause}
                    activeOpacity={0.9}
                >
                    <View style={styles.playButton}>
                        <Ionicons
                            name={isPlaying ? 'pause' : 'play'}
                            size={32}
                            color="#fff"
                        />
                    </View>
                </TouchableOpacity>

                {/* Fullscreen Button */}
                <TouchableOpacity
                    style={styles.fullscreenButton}
                    onPress={handleFullScreen}
                >
                    <Ionicons name="expand-outline" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Fullscreen Modal */}
            <Modal
                visible={showFullScreen}
                transparent={false}
                animationType="fade"
                onRequestClose={handleCloseFullScreen}
            >
                <View style={styles.fullscreenContainer}>
                    {/* Close Button */}
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleCloseFullScreen}
                    >
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    {/* Fullscreen Video */}
                    <Video
                        ref={fullScreenVideoRef}
                        source={{ uri: videoUrl }}
                        style={styles.fullscreenVideo}
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls
                        shouldPlay
                    />
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: 250,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#000',
        position: 'relative',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(108, 92, 231, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenButton: {
        position: 'absolute',
        bottom: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenContainer: {
        flex: 1,
        backgroundColor: '#0F172A',
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        left: 16,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    fullscreenVideo: {
        width: '100%',
        height: '100%',
    },
});
