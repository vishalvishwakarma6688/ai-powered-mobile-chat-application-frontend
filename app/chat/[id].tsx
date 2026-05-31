import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useMessages } from '../../lib/hooks/message/useMessages';
import { GetMessagesResponse, Message } from '../../lib/api/message/messageApi';
import { useSendMessage } from '../../lib/hooks/message/useSendMessage';
import { useAddReaction, useRemoveReaction } from '../../lib/hooks/message/useReaction';
import { usePinMessage, useUnpinMessage, usePinnedMessages } from '../../lib/hooks/message/usePin';
import { useStarMessage, useUnstarMessage } from '../../lib/hooks/message/useStar';
import { useDeleteMessage } from '../../lib/hooks/message/useDelete';
import { useEditMessage } from '../../lib/hooks/message/useEdit';
import { useForwardMessage } from '../../lib/hooks/message/useForward';
import { useScheduleMessage, useScheduledMessages } from '../../lib/hooks/message/useScheduleMessage';
import { useSendVoiceNote } from '../../lib/hooks/message/useVoiceNote';
import { useSetAutoDelete, useCancelAutoDelete } from '../../lib/hooks/message/useAutoDelete';
import { useBlockUser, useUnblockUser } from '../../lib/hooks/user/useBlock';
import { useIsUserBlocked } from '../../lib/hooks/user/useBlockStatus';
import { useUploadAndSendImage, useUploadAndSendVideo } from '../../lib/hooks/message/useMediaUpload';
import { useUploadAndSendDocument } from '../../lib/hooks/message/useDocumentUpload';
import { useSendLocation } from '../../lib/hooks/message/useLocation';
import { useSendContact } from '../../lib/hooks/message/useContact';
import { useAIChat, useSendAIMessage } from '../../lib/hooks/ai/useAIChat';
import { useInitiateCall } from '../../lib/hooks/call';
import { useAuthStore } from '../../lib/store/authStore';
import { useCallStore } from '../../lib/store/callStore';
import { muteChat, Chat } from '../../lib/api/chat/chatApi';
import { useSocket } from '../../lib/socket/socketContext';
import MessageList from '../../components/chat/MessageList';
import MessageInput from '../../components/chat/MessageInput';
import PinnedMessageBanner from '../../components/message/PinnedMessageBanner';
import DeleteMessageDialog from '../../components/message/DeleteMessageDialog';
import EditMessageDialog from '../../components/message/EditMessageDialog';
import ForwardMessageDialog from '../../components/message/ForwardMessageDialog';
import SearchMessagesDialog from '../../components/message/SearchMessagesDialog';
import ScheduleMessageDialog from '../../components/message/ScheduleMessageDialog';
import ScheduledMessagesDialog from '../../components/message/ScheduledMessagesDialog';
import AutoDeleteDialog from '../../components/message/AutoDeleteDialog';
import BlockUserDialog from '../../components/user/BlockUserDialog';
import AttachmentMenu from '../../components/message/AttachmentMenu';
import VoiceRecorder from '../../components/message/VoiceRecorder';
import ImagePreviewDialog from '../../components/message/ImagePreviewDialog';
import VideoPreviewDialog from '../../components/message/VideoPreviewDialog';
import DocumentPreviewDialog from '../../components/message/DocumentPreviewDialog';
import LocationPicker from '../../components/message/LocationPicker';
import { ContactPicker } from '../../components/message/ContactPicker';
import CustomPopupMenu, { PopupMenuItem } from '../../components/common/CustomPopupMenu';
import CustomAlert from '../../components/common/CustomAlert';

const AI_BOT_ID = '000000000000000000000001';

export default function ChatScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const { joinChat, leaveChat, sendTypingStart, sendTypingStop, typingUsers, socket } = useSocket();
    const [chatInfo, setChatInfo] = useState<Chat | null>(null);
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showPinnedBanner, setShowPinnedBanner] = useState(true);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedMessageForDelete, setSelectedMessageForDelete] = useState<Message | null>(null);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [selectedMessageForEdit, setSelectedMessageForEdit] = useState<{ id: string; text: string } | null>(null);
    const [showForwardDialog, setShowForwardDialog] = useState(false);
    const [selectedMessageForForward, setSelectedMessageForForward] = useState<string | null>(null);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [showScheduleDialog, setShowScheduleDialog] = useState(false);
    const [showScheduledMessagesDialog, setShowScheduledMessagesDialog] = useState(false);
    const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
    const [isRecordingVoice, setIsRecordingVoice] = useState(false);
    const [showAutoDeleteDialog, setShowAutoDeleteDialog] = useState(false);
    const [selectedMessageForAutoDelete, setSelectedMessageForAutoDelete] = useState<{ id: string; currentAutoDeleteAt?: string } | null>(null);
    const [showBlockDialog, setShowBlockDialog] = useState(false);
    const [showImagePreview, setShowImagePreview] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
    const [showVideoPreview, setShowVideoPreview] = useState(false);
    const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);
    const [showLocationPicker, setShowLocationPicker] = useState(false);
    const [showContactPicker, setShowContactPicker] = useState(false);
    const [showDocumentPreview, setShowDocumentPreview] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<{
        uri: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
    } | null>(null);
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [alertConfig, setAlertConfig] = useState<{
        visible: boolean;
        title: string;
        message?: string;
        buttons?: Array<{ text: string; onPress?: () => void; style?: 'default' | 'cancel' | 'destructive' }>;
    }>({
        visible: false,
        title: '',
    });

    // AI Chat State
    const [isAIResponding, setIsAIResponding] = useState(false);

    // Fetch messages
    const { data, isLoading, error, refetch, isRefetching } = useMessages(id || '');
    const { data: aiChatData } = useAIChat();
    const isAIChatAssistant = aiChatData?.data?._id === id || chatInfo?.participants?.some(p =>
        p.userId?._id === AI_BOT_ID
    ) || false;
    const showCallActions = !isAIChatAssistant
        && !chatInfo?.isGroup
        && !!chatInfo?.participants?.find((participant) => participant.userId?._id !== user?._id);

    // Fetch pinned messages
    const { data: pinnedData } = usePinnedMessages(id || '');

    // Send message mutation with optimistic updates
    const { mutate: sendMessage, isPending: isSending } = useSendMessage({
        onSuccess: () => {
            console.log('✅ Message sent successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to send message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to send message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // AI Message mutation
    const { mutate: sendAIMessage } = useSendAIMessage();
    const { mutateAsync: initiateCall } = useInitiateCall();

    // Reaction mutations
    const { mutate: addReaction } = useAddReaction({
        onSuccess: () => {
            console.log('✅ Reaction added successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to add reaction:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to add reaction. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const { mutate: removeReaction } = useRemoveReaction({
        onSuccess: () => {
            console.log('✅ Reaction removed successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to remove reaction:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to remove reaction. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Pin mutations
    const { mutate: pinMessage } = usePinMessage({
        onSuccess: () => {
            console.log('✅ Message pinned successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to pin message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to pin message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const { mutate: unpinMessage } = useUnpinMessage({
        onSuccess: () => {
            console.log('✅ Message unpinned successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to unpin message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to unpin message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Star mutations
    const { mutate: starMessage } = useStarMessage({
        onSuccess: () => {
            console.log('✅ Message starred successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to star message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to star message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const { mutate: unstarMessage } = useUnstarMessage({
        onSuccess: () => {
            console.log('✅ Message unstarred successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to unstar message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to unstar message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Delete mutation
    const { mutate: deleteMessage } = useDeleteMessage({
        onSuccess: () => {
            console.log('✅ Message deleted successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to delete message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to delete message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Edit mutation
    const { mutate: editMessage } = useEditMessage({
        onSuccess: () => {
            console.log('✅ Message edited successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to edit message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to edit message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Forward mutation
    const { mutate: forwardMessage } = useForwardMessage({
        onSuccess: () => {
            console.log('✅ Message forwarded successfully');
        },
        onError: (error) => {
            console.error('❌ Failed to forward message:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to forward message. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Schedule message mutation
    const { mutate: scheduleMessage } = useScheduleMessage();

    // Fetch scheduled messages
    const { data: scheduledMessagesData } = useScheduledMessages(id || '');

    // Send voice note mutation
    const { mutate: sendVoiceNote, isPending: isSendingVoice } = useSendVoiceNote();

    // Auto-delete mutations
    const { mutate: setAutoDelete } = useSetAutoDelete({
        onSuccess: () => {
            console.log('✅ Auto-delete timer set successfully');
        },
        onError: (error: any) => {
            console.error('❌ Failed to set auto-delete timer:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to set auto-delete timer. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const { mutate: cancelAutoDelete } = useCancelAutoDelete({
        onSuccess: () => {
            console.log('✅ Auto-delete timer cancelled successfully');
        },
        onError: (error: any) => {
            console.error('❌ Failed to cancel auto-delete timer:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to cancel auto-delete timer. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Block mutations
    const { mutate: blockUser } = useBlockUser({
        onSuccess: () => {
            console.log('✅ User blocked successfully');
            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'User blocked successfully',
                buttons: [{ text: 'OK', style: 'default', onPress: () => router.back() }],
            });
        },
        onError: (error: any) => {
            console.error('❌ Failed to block user:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to block user. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    const { mutate: unblockUser } = useUnblockUser({
        onSuccess: () => {
            console.log('✅ User unblocked successfully');
            setAlertConfig({
                visible: true,
                title: 'Success',
                message: 'User unblocked successfully',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
        onError: (error: any) => {
            console.error('❌ Failed to unblock user:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to unblock user. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Image upload mutation
    const { mutate: uploadAndSendImage, isPending: isUploadingImage } = useUploadAndSendImage({
        onSuccess: () => {
            console.log('✅ Image uploaded and sent successfully');
            setShowAttachmentMenu(false);
        },
        onError: (error: any) => {
            console.error('❌ Failed to upload image:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to upload image. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Video upload mutation
    const { mutate: uploadAndSendVideo, isPending: isUploadingVideo } = useUploadAndSendVideo({
        onSuccess: () => {
            console.log('✅ Video uploaded and sent successfully');
            setShowAttachmentMenu(false);
        },
        onError: (error: any) => {
            console.error('❌ Failed to upload video:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to upload video. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Location mutation
    const { mutate: sendLocation, isPending: isSendingLocation } = useSendLocation({
        onSuccess: () => {
            console.log('✅ Location sent successfully');
            setShowAttachmentMenu(false);
        },
        onError: (error: any) => {
            console.error('❌ Failed to send location:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to send location. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Contact mutation
    const { mutate: sendContact, isPending: isSendingContact } = useSendContact({
        onSuccess: () => {
            console.log('✅ Contact(s) sent successfully');
            setShowAttachmentMenu(false);
        },
        onError: (error: any) => {
            console.error('❌ Failed to send contact:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to send contact. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Document upload mutation
    const { mutate: uploadAndSendDocument, isPending: isUploadingDocument } = useUploadAndSendDocument({
        onSuccess: () => {
            console.log('✅ Document uploaded and sent successfully');
            setShowAttachmentMenu(false);
        },
        onError: (error: any) => {
            console.error('❌ Failed to upload document:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to upload document. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        },
    });

    // Handle reactions
    const handleReact = (messageId: string, emoji: string) => {
        addReaction({ messageId, emoji });
    };

    const handleRemoveReaction = (messageId: string) => {
        removeReaction(messageId);
    };

    // Handle pin/unpin
    const handlePin = (messageId: string) => {
        pinMessage(messageId);
    };

    const handleUnpin = (messageId: string) => {
        unpinMessage(messageId);
    };

    // Handle star/unstar
    const handleStar = (messageId: string) => {
        starMessage(messageId);
    };

    const handleUnstar = (messageId: string) => {
        unstarMessage(messageId);
    };

    // Handle delete
    const handleDelete = (messageId: string) => {
        const message = data?.data.find(msg => msg._id === messageId);
        if (message) {
            setSelectedMessageForDelete(message);
            setShowDeleteDialog(true);
        }
    };

    const handleDeleteForEveryone = () => {
        if (selectedMessageForDelete) {
            deleteMessage({
                messageId: selectedMessageForDelete._id,
                deleteForEveryone: true,
            });
            setShowDeleteDialog(false);
            setSelectedMessageForDelete(null);
        }
    };

    // Check if message can be deleted for everyone (within 1 hour)
    const canDeleteForEveryone = (message: Message): boolean => {
        const messageTime = new Date(message.createdAt).getTime();
        const now = new Date().getTime();
        const oneHourInMs = 60 * 60 * 1000;
        return (now - messageTime) <= oneHourInMs;
    };

    // Handle edit
    const handleEdit = (messageId: string, currentText: string) => {
        setSelectedMessageForEdit({ id: messageId, text: currentText });
        setShowEditDialog(true);
    };

    const handleSaveEdit = (newText: string) => {
        if (selectedMessageForEdit) {
            editMessage({
                messageId: selectedMessageForEdit.id,
                text: newText,
            });
            setShowEditDialog(false);
            setSelectedMessageForEdit(null);
        }
    };

    // Handle forward
    const handleForward = (messageId: string) => {
        setSelectedMessageForForward(messageId);
        setShowForwardDialog(true);
    };

    const handleForwardToChats = (targetChatIds: string[]) => {
        if (selectedMessageForForward) {
            forwardMessage({
                messageId: selectedMessageForForward,
                targetChatIds,
            });
            setShowForwardDialog(false);
            setSelectedMessageForForward(null);
        }
    };

    // Handle schedule message
    const handleScheduleMessage = (text: string, scheduledFor: Date) => {
        if (!id) return;

        scheduleMessage({
            chatId: id,
            text,
            scheduledFor: scheduledFor.toISOString(),
        });
    };

    // Handle voice note send
    const handleSendVoiceNote = (audioUri: string, duration: number, waveform: number[]) => {
        if (!id) return;

        sendVoiceNote({
            chatId: id,
            audioUri,
            duration,
            waveform,
        });

        setIsRecordingVoice(false);
    };

    // Handle voice note cancel
    const handleCancelVoiceNote = () => {
        setIsRecordingVoice(false);
    };

    // Handle auto-delete
    const handleSetAutoDelete = (messageId: string, currentAutoDeleteAt?: string) => {
        setSelectedMessageForAutoDelete({ id: messageId, currentAutoDeleteAt });
        setShowAutoDeleteDialog(true);
    };

    const handleCancelAutoDelete = (messageId: string) => {
        cancelAutoDelete(messageId);
    };

    const handleStartCall = async (type: 'audio' | 'video') => {
        const callParticipant = chatInfo?.participants?.find((participant) => participant.userId?._id !== user?._id)?.userId || null;

        if (!id || !user || !callParticipant || isAIChatAssistant) return;

        try {
            const response = await initiateCall({
                participantIds: [callParticipant._id],
                type,
                chatId: id,
            });

            useCallStore.getState().setActiveCall({
                callId: response.data._id,
                role: 'caller',
                type,
                peerId: callParticipant._id,
                peerName: callParticipant.username,
                peerProfilePic: callParticipant.profilePic || null,
                chatId: id,
                status: 'ringing',
            });

            router.push(`/call/${response.data._id}`);
        } catch (error) {
            console.error('❌ Failed to start call:', error);
            setAlertConfig({
                visible: true,
                title: 'Call Error',
                message: 'Unable to start the call. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    const handleConfirmAutoDelete = (duration: number) => {
        if (selectedMessageForAutoDelete) {
            setAutoDelete({
                messageId: selectedMessageForAutoDelete.id,
                duration,
            });
            setShowAutoDeleteDialog(false);
            setSelectedMessageForAutoDelete(null);
        }
    };

    // Handle image selection
    const handleSelectImage = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Required',
                    message: 'Please grant permission to access your photos.',
                    buttons: [{ text: 'OK', style: 'default' }],
                });
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;
                console.log('📸 Image selected:', imageUri);

                // Show preview dialog instead of uploading directly
                setSelectedImageUri(imageUri);
                setShowImagePreview(true);
            }
        } catch (error) {
            console.error('❌ Error selecting image:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to select image. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    // Handle sending image with optional caption
    const handleSendImage = (caption?: string) => {
        if (id && selectedImageUri) {
            uploadAndSendImage({
                chatId: id,
                uri: selectedImageUri,
                caption,
            });
            setShowImagePreview(false);
            setSelectedImageUri(null);
            setShowAttachmentMenu(false);
        }
    };

    // Handle video selection
    const handleSelectVideo = async () => {
        try {
            // Request permissions
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Required',
                    message: 'Please grant permission to access your videos.',
                    buttons: [{ text: 'OK', style: 'default' }],
                });
                return;
            }

            // Launch video picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                allowsEditing: false,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const videoUri = result.assets[0].uri;
                console.log('🎥 Video selected:', videoUri);

                // Show preview dialog instead of uploading directly
                setSelectedVideoUri(videoUri);
                setShowVideoPreview(true);
            }
        } catch (error) {
            console.error('❌ Error selecting video:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to select video. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    // Handle sending video with optional caption
    const handleSendVideo = (caption?: string) => {
        if (id && selectedVideoUri) {
            uploadAndSendVideo({
                chatId: id,
                uri: selectedVideoUri,
                caption,
            });
            setShowVideoPreview(false);
            setSelectedVideoUri(null);
            setShowAttachmentMenu(false);
        }
    };

    // Handle location selection
    const handleSendLocation = (lat: number, lng: number) => {
        if (id) {
            sendLocation({
                chatId: id,
                lat,
                lng,
            });
            setShowLocationPicker(false);
            setShowAttachmentMenu(false);
        }
    };

    // Handle contact selection
    const handleSendContacts = (contacts: Array<{ name: string; phoneNumber?: string; userId?: string }>) => {
        if (id && contacts.length > 0) {
            sendContact({
                chatId: id,
                contacts: contacts,
            });
            setShowContactPicker(false);
            setShowAttachmentMenu(false);
        }
    };

    // Handle document selection
    const handleSelectDocument = async () => {
        try {
            const DocumentPicker = require('expo-document-picker');

            // Launch document picker
            const result = await DocumentPicker.getDocumentAsync({
                type: '*/*',
                copyToCacheDirectory: true,
            });

            if (result.type === 'success' || !result.canceled) {
                const doc = result.assets ? result.assets[0] : result;
                console.log('📄 Document selected:', doc.name);

                // Show preview dialog
                setSelectedDocument({
                    uri: doc.uri,
                    fileName: doc.name,
                    fileSize: doc.size || 0,
                    mimeType: doc.mimeType || 'application/octet-stream',
                });
                setShowDocumentPreview(true);
            }
        } catch (error) {
            console.error('❌ Error selecting document:', error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to select document. Please try again.',
                buttons: [{ text: 'OK', style: 'default' }],
            });
        }
    };

    // Handle sending document with optional caption
    const handleSendDocument = (caption?: string) => {
        if (id && selectedDocument) {
            uploadAndSendDocument({
                chatId: id,
                uri: selectedDocument.uri,
                fileName: selectedDocument.fileName,
                fileSize: selectedDocument.fileSize,
                mimeType: selectedDocument.mimeType,
                caption,
            });
            setShowDocumentPreview(false);
            setSelectedDocument(null);
            setShowAttachmentMenu(false);
        }
    };

    // Attachment menu items
    const attachmentMenuItems = [
        {
            icon: 'image-outline' as const,
            label: 'Photo',
            color: '#EC4899',
            onPress: () => {
                setShowAttachmentMenu(false);
                handleSelectImage();
            },
        },
        {
            icon: 'videocam-outline' as const,
            label: 'Video',
            color: '#8B5CF6',
            onPress: () => {
                setShowAttachmentMenu(false);
                handleSelectVideo();
            },
        },
        {
            icon: 'document-outline' as const,
            label: 'Document',
            color: '#3B82F6',
            onPress: () => {
                setShowAttachmentMenu(false);
                handleSelectDocument();
            },
        },
        {
            icon: 'mic-outline' as const,
            label: 'Audio',
            color: '#10B981',
            onPress: () => {
                setIsRecordingVoice(true);
            },
        },
        {
            icon: 'location-outline' as const,
            label: 'Location',
            color: '#F59E0B',
            onPress: () => {
                setShowAttachmentMenu(false);
                setShowLocationPicker(true);
            },
        },
        {
            icon: 'person-outline' as const,
            label: 'Contact',
            color: '#06B6D4',
            onPress: () => {
                setShowAttachmentMenu(false);
                setShowContactPicker(true);
            },
        },
        {
            icon: 'time-outline' as const,
            label: 'Schedule',
            color: '#6C5CE7',
            onPress: () => {
                setShowScheduleDialog(true);
            },
        },
    ];

    // Handle pinned message banner press
    const handlePressPinned = (messageId: string) => {
        // TODO: Scroll to pinned message
        console.log('Navigate to pinned message:', messageId);
    };

    // Join chat room on mount, leave on unmount
    useEffect(() => {
        if (id) {
            joinChat(id);
            return () => {
                leaveChat(id);
            };
        }
    }, [id]);

    // Auto-mark messages as read when viewing chat
    useEffect(() => {
        if (!data?.data || !user || !id) return;

        // Mark all unread messages as read
        const unreadMessages = data.data.filter(msg =>
            !msg._id.startsWith('temp-') &&
            msg.sender._id !== user._id &&
            (!msg.readBy || !msg.readBy.some(r => r.userId === user._id))
        );

        if (unreadMessages.length > 0 && socket) {
            console.log(`📖 Marking ${unreadMessages.length} messages as read`);
            unreadMessages.forEach(msg => {
                socket.emit('message:read', {
                    messageId: msg._id,
                    senderId: msg.sender._id,
                });
            });

            // Immediately update the chat list to clear unread count
            const chatsData = queryClient.getQueryData<any>(['chats', 1, 20]);
            if (chatsData?.data) {
                const updatedChats = chatsData.data.map((chat: any) => {
                    if (chat._id === id) {
                        return { ...chat, unreadCount: 0 };
                    }
                    return chat;
                });

                queryClient.setQueryData(['chats', 1, 20], {
                    ...chatsData,
                    data: updatedChats,
                });
                console.log(`✅ Cleared unread count for chat ${id}`);
            }
        }
    }, [data?.data, user, id, socket, queryClient]);

    // Get chat info from the chats query cache
    useEffect(() => {
        const chatsData = queryClient.getQueryData<any>(['chats', 1, 20]);
        const chat = chatsData?.data?.find((candidate: Chat) => candidate._id === id)
            || (aiChatData?.data?._id === id ? aiChatData.data : null);

        if (chat) {
            setChatInfo(chat);
        }
    }, [aiChatData, id, queryClient]);

    const handleSendMessage = (content: string) => {
        if (!id) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Invalid chat ID',
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        // Check if this is an AI chat
        if (isAIChatAssistant) {
            if (!user || isAIResponding) return;

            const messagesQueryKey = ['messages', id, 1] as const;
            void queryClient.cancelQueries({ queryKey: messagesQueryKey });

            console.log('🤖 Sending message to AI chat:', content);

            // Create optimistic user message
            const tempUserMessage: Message = {
                _id: `temp-user-${Date.now()}`,
                chatId: id,
                sender: {
                    _id: user._id,
                    username: user.username,
                    profilePic: user.profilePic,
                },
                type: 'text',
                text: content,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                readBy: [{ userId: AI_BOT_ID, readAt: new Date().toISOString() }],
                deliveredTo: [{ userId: AI_BOT_ID, deliveredAt: new Date().toISOString() }],
                reactions: [],
                isPinned: false,
                isEdited: false,
                isDeleted: false,
            };

            // Add user message to UI immediately
            queryClient.setQueryData<GetMessagesResponse>(messagesQueryKey, (old) => ({
                ...old,
                success: old?.success ?? true,
                data: [tempUserMessage, ...(old?.data || [])],
            }));

            // Start AI response
            setIsAIResponding(true);

            // Create temporary AI message showing "Thinking..."
            const tempAIMessageId = `temp-ai-${Date.now()}`;

            const tempAIMessage: Message = {
                _id: tempAIMessageId,
                chatId: id,
                sender: {
                    _id: AI_BOT_ID,
                    username: 'AI_Assistant',
                    profilePic: null,
                },
                type: 'text',
                text: 'Thinking...',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                readBy: [],
                reactions: [],
                isPinned: false,
                isEdited: false,
                isDeleted: false,
            };

            // Add AI "Thinking..." message to UI
            queryClient.setQueryData<GetMessagesResponse>(messagesQueryKey, (old) => ({
                ...old,
                success: old?.success ?? true,
                data: [tempAIMessage, ...(old?.data || [])],
            }));

            // Send message to AI
            sendAIMessage({
                message: content,
                chatId: id,
                onChunk: (chunk: string) => {
                    // Update the thinking message
                    queryClient.setQueryData<GetMessagesResponse>(messagesQueryKey, (old) => {
                        const messages = old?.data || [];
                        const updatedMessages = messages.map((msg: Message) => {
                            if (msg._id === tempAIMessageId) {
                                return { ...msg, text: chunk };
                            }
                            return msg;
                        });
                        return { ...old, success: old?.success ?? true, data: updatedMessages };
                    });
                },
                onComplete: () => {
                    console.log('✅ AI response completed');
                    setIsAIResponding(false);

                    // Refetch messages to get the final saved messages from backend
                    refetch();
                },
                onError: (error: string) => {
                    console.error('❌ AI response error:', error);
                    setIsAIResponding(false);

                    setAlertConfig({
                        visible: true,
                        title: 'AI Error',
                        message: error || 'Failed to get AI response. Please try again.',
                        buttons: [{ text: 'OK', style: 'default' }],
                    });

                    // Remove the temporary AI message
                    queryClient.setQueryData<GetMessagesResponse>(messagesQueryKey, (old) => {
                        const messages = old?.data || [];
                        return {
                            ...old,
                            success: old?.success ?? true,
                            data: messages.filter((msg: Message) => msg._id !== tempAIMessageId),
                        };
                    });

                    refetch();
                },
            });

            return;
        }

        // Check if user is blocked
        if (isBlockedData) {
            setAlertConfig({
                visible: true,
                title: 'Cannot Send Message',
                message: `You have blocked ${otherParticipant?.username || 'this user'}. Unblock them to send messages.`,
                buttons: [{ text: 'OK', style: 'default' }],
            });
            return;
        }

        sendMessage({
            chatId: id,
            text: content,
        });
    };

    // Handle typing indicator
    const handleTyping = (isTyping: boolean) => {
        if (!id) return;

        if (isTyping) {
            sendTypingStart(id);

            // Clear existing timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Stop typing after 3 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingStop(id);
            }, 3000);
        } else {
            sendTypingStop(id);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = null;
            }
        }
    };

    // Get other participant info (for one-on-one chats)
    const otherParticipant = chatInfo && !chatInfo.isGroup
        ? chatInfo.participants.find(p => p.userId._id !== user?._id)?.userId
        : null;

    // Check if other participant is blocked
    const { data: isBlockedData } = useIsUserBlocked(otherParticipant?._id);

    // Display name
    const displayName = chatInfo?.isGroup
        ? chatInfo.name || 'Group Chat'
        : otherParticipant?.username || 'Chat';

    // Online status text with typing indicator
    const getStatusText = () => {
        // Check if anyone is typing in this chat
        if (id && typingUsers.has(id)) {
            const typingSet = typingUsers.get(id);
            if (typingSet && typingSet.size > 0) {
                // Filter out current user from typing users
                const otherTypingUsers = Array.from(typingSet).filter(userId => userId !== user?._id);
                if (otherTypingUsers.length > 0) {
                    return 'typing...';
                }
            }
        }

        if (chatInfo?.isGroup) {
            // Show participant names like WhatsApp (e.g., "You, John, Sarah")
            const participantNames = chatInfo.participants
                .map(p => p.userId._id === user?._id ? 'You' : p.userId.username)
                .slice(0, 3) // Show max 3 names
                .join(', ');

            const remainingCount = chatInfo.participants.length - 3;
            if (remainingCount > 0) {
                return `${participantNames}, +${remainingCount} more`;
            }
            return participantNames;
        }

        if (!otherParticipant) return '';

        if (otherParticipant.isOnline) {
            return 'Online';
        }

        if (otherParticipant.lastSeen) {
            const lastSeenDate = new Date(otherParticipant.lastSeen);
            const now = new Date();
            const diffMs = now.getTime() - lastSeenDate.getTime();
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Last seen just now';
            if (diffMins < 60) return `Last seen ${diffMins}m ago`;
            if (diffHours < 24) return `Last seen ${diffHours}h ago`;
            if (diffDays === 1) return 'Last seen yesterday';
            if (diffDays < 7) return `Last seen ${diffDays}d ago`;
            return `Last seen ${lastSeenDate.toLocaleDateString()}`;
        }

        return 'Offline';
    };

    const statusText = getStatusText();
    const isOnline = !chatInfo?.isGroup && otherParticipant?.isOnline;
    const isTyping = id && typingUsers.has(id) && typingUsers.get(id)!.size > 0;

    // Get menu items
    const isMuted = chatInfo?.participants.find(p => p.userId._id === user?._id)?.isMuted || false;

    const menuItems: PopupMenuItem[] = [
        {
            icon: 'person-circle-outline',
            label: 'View Contact',
            onPress: () => {
                setAlertConfig({
                    visible: true,
                    title: 'Coming Soon',
                    message: 'View contact profile will be available soon!',
                    buttons: [{ text: 'OK', style: 'default' }],
                });
            },
        },
        {
            icon: 'search-outline',
            label: 'Search Messages',
            onPress: () => {
                setShowOptionsMenu(false);
                setShowSearchDialog(true);
            },
        },
        {
            icon: 'calendar-outline',
            label: 'Scheduled Messages',
            onPress: () => {
                setShowOptionsMenu(false);
                setShowScheduledMessagesDialog(true);
            },
        },
        {
            icon: isMuted ? 'volume-high-outline' : 'volume-mute-outline',
            label: isMuted ? 'Unmute' : 'Mute',
            onPress: async () => {
                if (!id) return;
                try {
                    await muteChat(id, !isMuted);
                    setAlertConfig({
                        visible: true,
                        title: 'Success',
                        message: `Chat ${!isMuted ? 'muted' : 'unmuted'} successfully`,
                        buttons: [{ text: 'OK', style: 'default' }],
                    });
                    queryClient.invalidateQueries({ queryKey: ['chats'] });
                } catch (error) {
                    setAlertConfig({
                        visible: true,
                        title: 'Error',
                        message: `Failed to ${!isMuted ? 'mute' : 'unmute'} chat`,
                        buttons: [{ text: 'OK', style: 'default' }],
                    });
                }
            },
        },
        {
            icon: 'trash-outline',
            label: 'Clear Chat',
            onPress: () => {
                setAlertConfig({
                    visible: true,
                    title: 'Clear Chat',
                    message: 'Are you sure you want to clear all messages in this chat?',
                    buttons: [
                        { text: 'Cancel', style: 'cancel' },
                        {
                            text: 'Clear',
                            style: 'destructive',
                            onPress: () => {
                                setAlertConfig({
                                    visible: true,
                                    title: 'Coming Soon',
                                    message: 'Clear chat will be available soon!',
                                    buttons: [{ text: 'OK', style: 'default' }],
                                });
                            },
                        },
                    ],
                });
            },
        },
        // Block/Unblock User - Show based on block status
        ...(!chatInfo?.isGroup && otherParticipant ? [{
            icon: isBlockedData ? 'checkmark-circle-outline' as const : 'ban-outline' as const,
            label: isBlockedData ? 'Unblock User' : 'Block User',
            destructive: !isBlockedData,
            onPress: () => {
                setShowOptionsMenu(false);
                if (isBlockedData) {
                    // Show unblock confirmation
                    setAlertConfig({
                        visible: true,
                        title: `Unblock ${otherParticipant.username}?`,
                        message: 'You will be able to receive messages and calls from this contact.',
                        buttons: [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Unblock',
                                style: 'destructive',
                                onPress: () => unblockUser(otherParticipant._id),
                            },
                        ],
                    });
                } else {
                    // Show block dialog
                    setShowBlockDialog(true);
                }
            },
        }] : []),
    ];

    return (
        <SafeAreaView className="flex-1 bg-[#0F172A]" style={{ backgroundColor: '#0F172A' }} edges={['top']}>
            {/* Header */}
            <View className="px-4 py-3 border-b border-slate-800 flex-row items-center bg-[#0F172A]">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center"
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Chat Info - Tappable for groups */}
                <TouchableOpacity
                    className="flex-1 ml-2"
                    onPress={() => {
                        if (chatInfo?.isGroup) {
                            // Navigate to group info
                            router.push({
                                pathname: '/(tabs)/group-info',
                                params: {
                                    chatId: id,
                                    chatData: JSON.stringify(chatInfo),
                                },
                            });
                        }
                    }}
                    disabled={!chatInfo?.isGroup}
                >
                    <View className="flex-row items-center">
                        <Text className="text-white font-semibold text-lg" numberOfLines={1}>
                            {displayName}
                        </Text>
                        {isOnline && (
                            <View className="w-2 h-2 bg-green-500 rounded-full ml-2" />
                        )}
                        {chatInfo?.isGroup && (
                            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" className="ml-1" />
                        )}
                    </View>
                    <Text className={`text-xs ${isTyping ? 'text-[#6C5CE7]' : 'text-slate-400'}`} numberOfLines={1}>
                        {statusText}
                    </Text>
                </TouchableOpacity>

                {showCallActions && (
                    <View className="flex-row items-center ml-1">
                        <TouchableOpacity
                            className="w-10 h-10 items-center justify-center"
                            onPress={() => handleStartCall('video')}
                        >
                            <Ionicons name="videocam-outline" size={22} color="#94A3B8" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="w-10 h-10 items-center justify-center"
                            onPress={() => handleStartCall('audio')}
                        >
                            <Ionicons name="call-outline" size={20} color="#94A3B8" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Options Menu */}
                <TouchableOpacity
                    className="w-10 h-10 items-center justify-center"
                    onPress={() => setShowOptionsMenu(true)}
                >
                    <Ionicons name="ellipsis-vertical" size={20} color="#94A3B8" />
                </TouchableOpacity>

            </View>

            {/* Pinned Message Banner */}
            {showPinnedBanner && pinnedData?.data && pinnedData.data.length > 0 && (
                <PinnedMessageBanner
                    pinnedMessages={pinnedData.data}
                    onPressPinned={handlePressPinned}
                    onClose={() => setShowPinnedBanner(false)}
                />
            )}

            {/* Messages List */}
            <MessageList
                messages={data?.data || []}
                currentUserId={user?._id || ''}
                isLoading={isLoading}
                error={error}
                onRefresh={refetch}
                isRefreshing={isRefetching}
                isAIChat={isAIChatAssistant}
                onReact={handleReact}
                onRemoveReaction={handleRemoveReaction}
                onPin={handlePin}
                onUnpin={handleUnpin}
                onStar={handleStar}
                onUnstar={handleUnstar}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onForward={handleForward}
                onSetAutoDelete={handleSetAutoDelete}
                onCancelAutoDelete={handleCancelAutoDelete}
            />

            {/* Message Input */}
            {isRecordingVoice ? (
                <VoiceRecorder
                    onSend={handleSendVoiceNote}
                    onCancel={handleCancelVoiceNote}
                />
            ) : (
                <MessageInput
                    onSend={handleSendMessage}
                    isSending={isSending || isAIResponding}
                    onTyping={handleTyping}
                    onAttachmentPress={() => setShowAttachmentMenu(true)}
                />
            )}

            {/* Attachment Menu */}
            <AttachmentMenu
                visible={showAttachmentMenu}
                onClose={() => setShowAttachmentMenu(false)}
                items={attachmentMenuItems}
            />

            {/* Delete Message Dialog */}
            {selectedMessageForDelete && (
                <DeleteMessageDialog
                    visible={showDeleteDialog}
                    onClose={() => {
                        setShowDeleteDialog(false);
                        setSelectedMessageForDelete(null);
                    }}
                    onDeleteForMe={() => { }} // Not used anymore
                    onDeleteForEveryone={handleDeleteForEveryone}
                    isOwnMessage={selectedMessageForDelete.sender._id === user?._id}
                    canDeleteForEveryone={canDeleteForEveryone(selectedMessageForDelete)}
                />
            )}

            {/* Edit Message Dialog */}
            {selectedMessageForEdit && (
                <EditMessageDialog
                    visible={showEditDialog}
                    onClose={() => {
                        setShowEditDialog(false);
                        setSelectedMessageForEdit(null);
                    }}
                    onSave={handleSaveEdit}
                    originalText={selectedMessageForEdit.text}
                />
            )}

            {/* Forward Message Dialog */}
            <ForwardMessageDialog
                visible={showForwardDialog}
                onClose={() => {
                    setShowForwardDialog(false);
                    setSelectedMessageForForward(null);
                }}
                onForward={handleForwardToChats}
                currentChatId={id || ''}
            />

            {/* Search Messages Dialog */}
            <SearchMessagesDialog
                visible={showSearchDialog}
                onClose={() => setShowSearchDialog(false)}
            />

            {/* Schedule Message Dialog */}
            <ScheduleMessageDialog
                visible={showScheduleDialog}
                onClose={() => setShowScheduleDialog(false)}
                onSchedule={handleScheduleMessage}
            />

            {/* Scheduled Messages Dialog */}
            <ScheduledMessagesDialog
                visible={showScheduledMessagesDialog}
                onClose={() => setShowScheduledMessagesDialog(false)}
                chatId={id || ''}
            />

            {/* Auto-Delete Dialog */}
            <AutoDeleteDialog
                visible={showAutoDeleteDialog}
                onClose={() => {
                    setShowAutoDeleteDialog(false);
                    setSelectedMessageForAutoDelete(null);
                }}
                onSetAutoDelete={handleConfirmAutoDelete}
                currentAutoDeleteAt={selectedMessageForAutoDelete?.currentAutoDeleteAt}
            />

            {/* Block User Dialog */}
            {!chatInfo?.isGroup && otherParticipant && (
                <BlockUserDialog
                    visible={showBlockDialog}
                    onClose={() => setShowBlockDialog(false)}
                    onConfirm={() => blockUser(otherParticipant._id)}
                    username={otherParticipant.username}
                />
            )}

            {/* Custom Popup Menu */}
            <CustomPopupMenu
                visible={showOptionsMenu}
                items={menuItems}
                onClose={() => setShowOptionsMenu(false)}
            />

            {/* Custom Alert */}
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                buttons={alertConfig.buttons}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />

            {/* Image Preview Dialog */}
            {selectedImageUri && (
                <ImagePreviewDialog
                    visible={showImagePreview}
                    imageUri={selectedImageUri}
                    onClose={() => {
                        setShowImagePreview(false);
                        setSelectedImageUri(null);
                    }}
                    onSend={handleSendImage}
                />
            )}

            {/* Video Preview Dialog */}
            {selectedVideoUri && (
                <VideoPreviewDialog
                    visible={showVideoPreview}
                    videoUri={selectedVideoUri}
                    onClose={() => {
                        setShowVideoPreview(false);
                        setSelectedVideoUri(null);
                    }}
                    onSend={handleSendVideo}
                />
            )}

            {/* Document Preview Dialog */}
            {selectedDocument && (
                <DocumentPreviewDialog
                    visible={showDocumentPreview}
                    fileName={selectedDocument.fileName}
                    fileSize={selectedDocument.fileSize}
                    mimeType={selectedDocument.mimeType}
                    onClose={() => {
                        setShowDocumentPreview(false);
                        setSelectedDocument(null);
                    }}
                    onSend={handleSendDocument}
                    isUploading={isUploadingDocument}
                />
            )}

            {/* Location Picker */}
            <LocationPicker
                visible={showLocationPicker}
                onClose={() => setShowLocationPicker(false)}
                onSendLocation={handleSendLocation}
            />

            {/* Contact Picker */}
            <ContactPicker
                visible={showContactPicker}
                onClose={() => setShowContactPicker(false)}
                onSelectContacts={handleSendContacts}
            />
        </SafeAreaView>
    );
}
