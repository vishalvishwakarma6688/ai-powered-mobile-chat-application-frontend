import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

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
    const [latitude, setLatitude] = useState(37.78825);
    const [longitude, setLongitude] = useState(-122.4324);

    const handleSend = () => {
        onSendLocation(latitude, longitude);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
            <View className="flex-1 bg-[#0F172A] p-6 items-center justify-center">
                <Ionicons name="location" size={64} color="#6C5CE7" />
                <Text className="text-white text-xl font-bold mt-4">Location Sharing</Text>
                <Text className="text-slate-400 text-center mt-2 mb-6">
                    Location picker maps are available on the mobile application.
                </Text>
                <View className="flex-row items-center space-x-4">
                    <TouchableOpacity
                        className="px-6 py-3 rounded-full bg-slate-800"
                        onPress={onClose}
                    >
                        <Text className="text-white font-semibold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="px-6 py-3 rounded-full bg-[#6C5CE7]"
                        onPress={handleSend}
                    >
                        <Text className="text-white font-semibold">Send Default Location</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
