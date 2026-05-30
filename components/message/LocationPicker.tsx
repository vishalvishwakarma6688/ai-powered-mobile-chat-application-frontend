import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';

interface LocationPickerProps {
    visible: boolean;
    onClose: () => void;
    onSendLocation: (lat: number, lng: number) => void;
}

export default function LocationPicker({
    visible,
    onClose,
    onSendLocation,
}: LocationPickerProps) {
    const [loading, setLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Requesting permission...');
    const [region, setRegion] = useState<Region>({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });
    const [markerPosition, setMarkerPosition] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
    });

    useEffect(() => {
        if (visible) {
            getCurrentLocation();
        }
    }, [visible]);

    const getCurrentLocation = async () => {
        try {
            setLoading(true);
            setLoadingMessage('Requesting permission...');

            // Request permissions
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Permission Required',
                    'Please grant location permission to share your location.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            setLoadingMessage('Getting your location...');

            // Try to get last known location first (faster)
            let location = await Location.getLastKnownPositionAsync({});

            // If no last known location, get current location with timeout
            if (!location) {
                console.log('No last known location, fetching current location...');
                setLoadingMessage('Waiting for GPS signal...');

                // Use a promise race with timeout
                const locationPromise = Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Balanced,
                    timeInterval: 5000,
                    distanceInterval: 0,
                });

                const timeoutPromise = new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Location timeout')), 15000)
                );

                try {
                    location = await Promise.race([locationPromise, timeoutPromise]) as Location.LocationObject;
                } catch (timeoutError) {
                    console.log('Location timeout, trying with lower accuracy...');
                    setLoadingMessage('Trying alternative method...');
                    // Fallback to lower accuracy if timeout
                    location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Low,
                    });
                }
            }

            if (!location) {
                throw new Error('Unable to get location');
            }

            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(newRegion);
            setMarkerPosition({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            setLoading(false);
            console.log('✅ Location obtained:', location.coords);
        } catch (error) {
            console.error('❌ Error getting location:', error);

            // Use a default location (San Francisco)
            const defaultLocation = {
                latitude: 37.78825,
                longitude: -122.4324,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };

            setRegion(defaultLocation);
            setMarkerPosition({
                latitude: defaultLocation.latitude,
                longitude: defaultLocation.longitude,
            });

            Alert.alert(
                'Location Unavailable',
                'Could not get your current location. A default location has been set. Please drag the pin to your desired location.',
                [{ text: 'OK' }]
            );
            setLoading(false);
        }
    };

    const handleMapPress = (event: any) => {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setMarkerPosition({ latitude, longitude });
    };

    const handleSend = () => {
        console.log('📍 Sending location:', markerPosition);
        onSendLocation(markerPosition.latitude, markerPosition.longitude);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-[#0F172A]">
                {/* Header */}
                <View className="px-4 py-3 border-b border-slate-800 flex-row items-center bg-[#0F172A]">
                    <TouchableOpacity
                        onPress={onClose}
                        className="w-10 h-10 items-center justify-center"
                    >
                        <Ionicons name="close" size={24} color="#fff" />
                    </TouchableOpacity>

                    <View className="flex-1 ml-2">
                        <Text className="text-white font-semibold text-lg">
                            Share Location
                        </Text>
                        <Text className="text-slate-400 text-xs">
                            Tap on map to adjust pin
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={loading}
                        className={`px-4 py-2 rounded-full ${loading ? 'bg-slate-700' : 'bg-[#6C5CE7]'
                            }`}
                    >
                        <Text className={`font-semibold ${loading ? 'text-slate-500' : 'text-white'
                            }`}>
                            Send
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Map */}
                {loading ? (
                    <View className="flex-1 items-center justify-center px-8">
                        <ActivityIndicator size="large" color="#6C5CE7" />
                        <Text className="text-slate-400 mt-4 text-center">{loadingMessage}</Text>
                        <Text className="text-slate-500 mt-2 text-xs text-center">
                            This may take a few seconds...
                        </Text>
                    </View>
                ) : (
                    <View className="flex-1">
                        <MapView
                            style={{ flex: 1 }}
                            region={region}
                            onPress={handleMapPress}
                            showsUserLocation
                            showsMyLocationButton
                        >
                            <Marker
                                coordinate={markerPosition}
                                draggable
                                onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
                            >
                                <View className="items-center">
                                    <Ionicons name="location" size={40} color="#6C5CE7" />
                                </View>
                            </Marker>
                        </MapView>

                        {/* Current Location Button */}
                        <TouchableOpacity
                            onPress={getCurrentLocation}
                            className="absolute bottom-6 right-6 bg-white rounded-full p-3 shadow-lg"
                            style={{
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                elevation: 5,
                            }}
                        >
                            <Ionicons name="locate" size={24} color="#6C5CE7" />
                        </TouchableOpacity>

                        {/* Location Info */}
                        <View className="absolute bottom-20 left-4 right-4 bg-[#1E293B] rounded-2xl p-4 shadow-lg">
                            <View className="flex-row items-center mb-2">
                                <Ionicons name="location-outline" size={20} color="#6C5CE7" />
                                <Text className="text-white font-semibold ml-2">
                                    Selected Location
                                </Text>
                            </View>
                            <Text className="text-slate-400 text-sm">
                                Lat: {markerPosition.latitude.toFixed(6)}
                            </Text>
                            <Text className="text-slate-400 text-sm">
                                Lng: {markerPosition.longitude.toFixed(6)}
                            </Text>
                        </View>
                    </View>
                )}
            </View>
        </Modal>
    );
}
