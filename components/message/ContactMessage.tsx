import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ContactMessageProps {
    contacts: Array<{
        name: string;
        phoneNumber?: string;
        userId?: string;
    }>;
    isOwnMessage: boolean;
}

export default function ContactMessage({
    contacts,
    isOwnMessage,
}: ContactMessageProps) {
    const handleCallContact = (phoneNumber: string) => {
        Linking.openURL(`tel:${phoneNumber}`);
    };

    const handleMessageContact = (userId: string) => {
        // Navigate to chat with this user
        router.push(`/chat/${userId}`);
    };

    return (
        <View style={styles.container}>
            {contacts.map((contact, index) => (
                <View
                    key={index}
                    style={[
                        styles.contactCard,
                        index < contacts.length - 1 && styles.contactCardBorder
                    ]}
                >
                    {/* Avatar */}
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color="#6C5CE7" />
                    </View>

                    {/* Contact Info */}
                    <View style={styles.infoContainer}>
                        <Text style={styles.name} numberOfLines={1}>
                            {contact.name}
                        </Text>
                        {contact.phoneNumber && (
                            <Text style={styles.phone} numberOfLines={1}>
                                {contact.phoneNumber}
                            </Text>
                        )}
                        {contact.userId && (
                            <Text style={styles.appUserBadge}>
                                App User
                            </Text>
                        )}
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        {contact.userId ? (
                            <TouchableOpacity
                                onPress={() => handleMessageContact(contact.userId!)}
                                style={styles.actionButton}
                            >
                                <Ionicons name="chatbubble" size={20} color="#6C5CE7" />
                            </TouchableOpacity>
                        ) : contact.phoneNumber ? (
                            <TouchableOpacity
                                onPress={() => handleCallContact(contact.phoneNumber!)}
                                style={styles.actionButton}
                            >
                                <Ionicons name="call" size={20} color="#10B981" />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 280,
        backgroundColor: '#1E293B',
        borderRadius: 12,
        overflow: 'hidden',
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
    },
    contactCardBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#334155',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#6C5CE720',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    infoContainer: {
        flex: 1,
        marginRight: 8,
    },
    name: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    phone: {
        color: '#94A3B8',
        fontSize: 14,
        marginBottom: 2,
    },
    appUserBadge: {
        color: '#6C5CE7',
        fontSize: 12,
        fontWeight: '500',
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#334155',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
