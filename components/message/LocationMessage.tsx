import { View, Text, TouchableOpacity, Linking, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

interface LocationMessageProps {
    latitude: number;
    longitude: number;
    isOwnMessage: boolean;
}

export default function LocationMessage({
    latitude,
    longitude,
    isOwnMessage,
}: LocationMessageProps) {
    const handleOpenMaps = () => {
        const scheme = Platform.select({
            ios: 'maps:0,0?q=',
            android: 'geo:0,0?q=',
        });
        const latLng = `${latitude},${longitude}`;
        const label = 'Shared Location';
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        if (url) {
            Linking.openURL(url);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={handleOpenMaps}
                activeOpacity={0.9}
                style={styles.touchable}
            >
                {/* Map Preview */}
                <MapView
                    style={styles.map}
                    region={{
                        latitude,
                        longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    pitchEnabled={false}
                    rotateEnabled={false}
                    pointerEvents="none"
                >
                    <Marker coordinate={{ latitude, longitude }}>
                        <View style={styles.markerContainer}>
                            <Ionicons name="location" size={32} color="#6C5CE7" />
                        </View>
                    </Marker>
                </MapView>

                {/* Overlay with info */}
                <View style={styles.overlay}>
                    <View style={styles.overlayContent}>
                        <View style={styles.textContainer}>
                            <View style={styles.titleRow}>
                                <Ionicons name="location-outline" size={14} color="#fff" />
                                <Text style={styles.titleText}>Location</Text>
                            </View>
                            <Text style={styles.coordsText} numberOfLines={1}>
                                {latitude.toFixed(6)}, {longitude.toFixed(6)}
                            </Text>
                        </View>
                        <View style={styles.buttonContainer}>
                            <Ionicons name="navigate" size={16} color="#fff" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 250,
        height: 200,
        overflow: 'hidden',
        borderRadius: 12,
    },
    touchable: {
        width: '100%',
        height: '100%',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    markerContainer: {
        alignItems: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    overlayContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    titleText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    coordsText: {
        color: '#cbd5e1',
        fontSize: 11,
    },
    buttonContainer: {
        backgroundColor: '#6C5CE7',
        borderRadius: 20,
        padding: 8,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
