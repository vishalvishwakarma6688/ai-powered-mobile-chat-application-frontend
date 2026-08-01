import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LocationMessageProps {
    latitude: number;
    longitude: number;
    isOwnMessage: boolean;
}

export default function LocationMessage({
    latitude,
    longitude,
}: LocationMessageProps) {
    const handleOpenMaps = () => {
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(url);
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handleOpenMaps}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                <View style={styles.content}>
                    <Ionicons name="location" size={36} color="#6C5CE7" />
                    <View style={styles.textContainer}>
                        <Text style={styles.titleText}>Shared Location</Text>
                        <Text style={styles.coordsText}>
                            {latitude.toFixed(4)}, {longitude.toFixed(4)}
                        </Text>
                    </View>
                    <Ionicons name="open-outline" size={20} color="#94A3B8" />
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 220,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        padding: 12,
    },
    touchable: {
        width: '100%',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
        marginLeft: 10,
    },
    titleText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    coordsText: {
        color: '#94A3B8',
        fontSize: 12,
        marginTop: 2,
    },
});
