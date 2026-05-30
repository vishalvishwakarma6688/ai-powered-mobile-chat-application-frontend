import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Message } from '../../lib/api/message/messageApi';
import MessageOptionsMenu, { MessageOption } from '../message/MessageOptionsMenu';
import EmojiPicker from '../message/EmojiPicker';
import VoiceNotePlayer from '../message/VoiceNotePlayer';
import ImageViewer from '../message/ImageViewer';
import VideoPlayer from '../message/VideoPlayer';
import LocationMessage from '../message/LocationMessage';
import DocumentMessage from '../message/DocumentMessage';
import ContactMessage from '../message/ContactMessage';

interface MessageBubbleProps {
    message: Message;
    isOwnMessage: boolean;
    currentUserId: string;
    forceReadStatus?: boolean;
    onReact: (messageId: string, emoji: string) => void;
    onRemoveReaction: (messageId: string) => void;
    onPin: (messageId: string) => void;
    onUnpin: (messageId: string) => void;
    onStar: (messageId: string) => void;
    onUnstar: (messageId: string) => void;
    onDelete: (messageId: string) => void;
    onEdit: (messageId: string, currentText: string) => void;
    onForward: (messageId: string) => void;
    onSetAutoDelete: (messageId: string, currentAutoDeleteAt?: string) => void;
    onCancelAutoDelete: (messageId: string) => void;
}

export default function MessageBubble({
    message,
    isOwnMessage,
    currentUserId,
    forceReadStatus = false,
    onReact,
    onRemoveReaction,
    onPin,
    onUnpin,
    onStar,
    onUnstar,
    onDelete,
    onEdit,
    onForward,
    onSetAutoDelete,
    onCancelAutoDelete,
}: MessageBubbleProps) {
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showImageViewer, setShowImageViewer] = useState(false);

    // Format timestamp
    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    // Format remaining time for auto-delete
    const formatRemainingTime = (autoDeleteAt: string) => {
        const now = new Date().getTime();
        const deleteTime = new Date(autoDeleteAt).getTime();
        const diffMs = deleteTime - now;

        if (diffMs <= 0) return null;

        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffDays > 0) return `${diffDays}d`;
        if (diffHours > 0) return `${diffHours}h`;
        if (diffMins > 0) return `${diffMins}m`;
        return '<1m';
    };

    // Calculate message status from readBy and deliveredTo arrays
    const getMessageStatus = () => {
        if (!isOwnMessage) return null;
        if (forceReadStatus) return 'read';

        // Check if read by anyone
        if (message.readBy && message.readBy.length > 0) {
            return 'read';
        }

        // Check if delivered to anyone
        if (message.deliveredTo && message.deliveredTo.length > 0) {
            return 'delivered';
        }

        // Otherwise it's just sent
        return 'sent';
    };

    // Get status icon based on message status
    const getStatusIcon = () => {
        const status = getMessageStatus();

        switch (status) {
            case 'read':
                return (
                    <Ionicons name="checkmark-done" size={16} color="#00CEC9" />
                );
            case 'delivered':
                return (
                    <Ionicons name="checkmark-done" size={16} color="#94A3B8" />
                );
            case 'sent':
                return (
                    <Ionicons name="checkmark" size={16} color="#94A3B8" />
                );
            default:
                return null;
        }
    };

    // Check if current user has reacted
    const userReaction = message.reactions?.find((r: any) => {
        const reactionUserId = typeof r.userId === 'string' ? r.userId : r.userId?._id;
        return reactionUserId === currentUserId;
    });

    // Check if current user has starred
    const isStarred = message.starredBy?.some(s => s.userId === currentUserId);

    // Get message options
    const getMessageOptions = (): MessageOption[] => {
        const options: MessageOption[] = [
            {
                icon: 'happy-outline',
                label: userReaction ? 'Change Reaction' : 'React',
                onPress: () => setShowEmojiPicker(true),
            },
        ];

        if (userReaction) {
            options.push({
                icon: 'close-circle-outline',
                label: 'Remove Reaction',
                onPress: () => onRemoveReaction(message._id),
            });
        }

        // Add star/unstar option
        if (isStarred) {
            options.push({
                icon: 'star',
                label: 'Unstar',
                onPress: () => onUnstar(message._id),
            });
        } else {
            options.push({
                icon: 'star-outline',
                label: 'Star',
                onPress: () => onStar(message._id),
            });
        }

        // Add pin/unpin option
        if (message.isPinned) {
            options.push({
                icon: 'pin-outline',
                label: 'Unpin',
                onPress: () => onUnpin(message._id),
            });
        } else {
            options.push({
                icon: 'pin',
                label: 'Pin',
                onPress: () => onPin(message._id),
            });
        }

        // Add forward option (only for non-deleted messages)
        if (!message.isDeleted) {
            options.push({
                icon: 'arrow-redo-outline',
                label: 'Forward',
                onPress: () => onForward(message._id),
            });
        }

        // Add auto-delete option (only for own messages, not deleted)
        if (isOwnMessage && !message.isDeleted) {
            if (message.autoDeleteAt) {
                options.push({
                    icon: 'timer-outline',
                    label: 'Cancel Auto-Delete',
                    onPress: () => onCancelAutoDelete(message._id),
                });
            } else {
                options.push({
                    icon: 'timer-outline',
                    label: 'Set Auto-Delete',
                    onPress: () => onSetAutoDelete(message._id, message.autoDeleteAt),
                });
            }
        }

        // Add more options for own messages only
        if (isOwnMessage && !message.isDeleted) {
            options.push(
                {
                    icon: 'create-outline',
                    label: 'Edit',
                    onPress: () => onEdit(message._id, message.text || ''),
                },
                {
                    icon: 'trash-outline',
                    label: 'Delete',
                    onPress: () => onDelete(message._id),
                    destructive: true,
                }
            );
        }

        options.push({
            icon: 'copy-outline',
            label: 'Copy',
            onPress: () => {
                // TODO: Implement copy functionality
                console.log('Copy message:', message.text);
            },
        });

        return options;
    };

    // Handle emoji selection
    const handleEmojiSelect = (emoji: string) => {
        onReact(message._id, emoji);
    };

    // Group reactions by emoji
    const groupedReactions = message.reactions?.reduce((acc: Record<string, Array<any>>, reaction: any) => {
        if (!acc[reaction.emoji]) {
            acc[reaction.emoji] = [];
        }
        acc[reaction.emoji].push(reaction);
        return acc;
    }, {} as Record<string, Array<any>>);

    return (
        <View
            className={`flex-row mb-3 px-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
        >
            {/* Sender Avatar (for received messages) */}
            {!isOwnMessage && (
                <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center mr-2">
                    <Text className="text-white text-xs font-bold">
                        {message.sender.username.charAt(0).toUpperCase()}
                    </Text>
                </View>
            )}

            {/* Message Container */}
            <View className="max-w-[75%]">
                {/* Pinned Indicator */}
                {message.isPinned && (
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="pin" size={12} color="#6C5CE7" />
                        <Text className="text-[#6C5CE7] text-xs ml-1 font-medium">
                            Pinned
                        </Text>
                    </View>
                )}

                {/* Auto-Delete Timer Badge */}
                {message.autoDeleteAt && formatRemainingTime(message.autoDeleteAt) && (
                    <View className="flex-row items-center mb-1">
                        <Ionicons name="timer-outline" size={12} color="#F59E0B" />
                        <Text className="text-[#F59E0B] text-xs ml-1 font-medium">
                            Auto-delete in {formatRemainingTime(message.autoDeleteAt)}
                        </Text>
                    </View>
                )}

                {/* Message Bubble */}
                <TouchableOpacity
                    onLongPress={() => setShowOptionsMenu(true)}
                    activeOpacity={0.9}
                    className={`rounded-2xl px-4 py-2 ${isOwnMessage
                        ? 'bg-[#6C5CE7] rounded-br-sm'
                        : 'bg-[#1E293B] rounded-bl-sm'
                        }`}
                >
                    {/* Sender Name (for received messages) */}
                    {!isOwnMessage && (
                        <Text className="text-[#00CEC9] text-xs font-semibold mb-1">
                            {message.sender.username}
                        </Text>
                    )}

                    {/* Forwarded Indicator */}
                    {message.forwardedFrom && (
                        <View className="flex-row items-center mb-1">
                            <Ionicons name="arrow-redo-outline" size={12} color="#94A3B8" />
                            <Text className="text-slate-400 text-xs ml-1 italic">
                                Forwarded
                            </Text>
                        </View>
                    )}

                    {/* Message Content */}
                    {message.isDeleted ? (
                        <View className="flex-row items-center">
                            <Ionicons name="ban-outline" size={14} color="#94A3B8" style={{ marginRight: 6 }} />
                            <Text className="text-slate-400 text-sm italic">
                                This message was deleted
                            </Text>
                        </View>
                    ) : message.type === 'image' && message.media?.url ? (
                        <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                            <TouchableOpacity
                                onPress={() => setShowImageViewer(true)}
                                activeOpacity={0.9}
                            >
                                <Image
                                    source={{ uri: `http://172.18.58.26:5000${message.media.url}` }}
                                    style={{
                                        width: 250,
                                        height: 250,
                                        borderRadius: 12,
                                    }}
                                    resizeMode="cover"
                                />
                                {message.text && (
                                    <Text className="text-white text-base leading-5 mt-2">
                                        {message.text}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    ) : message.type === 'video' && message.media?.url ? (
                        <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                            <VideoPlayer
                                videoUrl={`http://172.18.58.26:5000${message.media.url}`}
                                isOwnMessage={isOwnMessage}
                            />
                            {message.text && (
                                <Text className="text-white text-base leading-5 mt-2">
                                    {message.text}
                                </Text>
                            )}
                        </View>
                    ) : message.type === 'audio' && message.voiceNote ? (
                        <View className="overflow-hidden">
                            <VoiceNotePlayer
                                audioUrl={message.media?.url || ''}
                                duration={message.voiceNote.duration}
                                waveform={message.voiceNote.waveform}
                                isOwnMessage={isOwnMessage}
                            />
                        </View>
                    ) : message.type === 'location' && message.location ? (
                        <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                            <LocationMessage
                                latitude={message.location.lat}
                                longitude={message.location.lng}
                                isOwnMessage={isOwnMessage}
                            />
                        </View>
                    ) : message.type === 'file' && message.media ? (
                        <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                            <DocumentMessage
                                fileName={message.media.fileName || 'Document'}
                                fileSize={message.media.fileSize || 0}
                                fileUrl={message.media.url}
                                mimeType={message.media.mimeType || 'application/octet-stream'}
                                isOwnMessage={isOwnMessage}
                            />
                            {message.text && (
                                <Text className="text-white text-base leading-5 mt-2">
                                    {message.text}
                                </Text>
                            )}
                        </View>
                    ) : message.type === 'contact' && message.text ? (
                        <View style={{ overflow: 'hidden', borderRadius: 12 }}>
                            <ContactMessage
                                contacts={(() => {
                                    try {
                                        return JSON.parse(message.text);
                                    } catch {
                                        return [];
                                    }
                                })()}
                                isOwnMessage={isOwnMessage}
                            />
                        </View>
                    ) : (
                        <Text className="text-white text-base leading-5">
                            {message.text}
                        </Text>
                    )}

                    {/* Edited Badge */}
                    {message.isEdited && (
                        <Text className="text-slate-400 text-xs mt-1">
                            (edited)
                        </Text>
                    )}

                    {/* Timestamp and Status */}
                    <View className="flex-row items-center justify-end mt-1 space-x-1">
                        {/* Star Icon (if starred by current user) */}
                        {isStarred && (
                            <Ionicons name="star" size={12} color="#FCD34D" style={{ marginRight: 4 }} />
                        )}
                        <Text
                            className={`text-xs ${isOwnMessage ? 'text-slate-200' : 'text-slate-400'
                                }`}
                        >
                            {formatTime(message.createdAt)}
                        </Text>
                        {isOwnMessage && (
                            <View className="ml-1">
                                {getStatusIcon()}
                            </View>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Reactions */}
                {groupedReactions && Object.keys(groupedReactions).length > 0 && (
                    <View
                        className={`flex-row flex-wrap mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'
                            }`}
                    >
                        {Object.entries(groupedReactions).map(([emoji, reactions]) => (
                            <TouchableOpacity
                                key={emoji}
                                onPress={() => {
                                    // If user already reacted with this emoji, remove it
                                    const hasReacted = reactions.some((r: any) => {
                                        const reactionUserId = typeof r.userId === 'string' ? r.userId : r.userId?._id;
                                        return reactionUserId === currentUserId;
                                    });

                                    if (hasReacted) {
                                        onRemoveReaction(message._id);
                                    } else {
                                        onReact(message._id, emoji);
                                    }
                                }}
                                className={`flex-row items-center bg-slate-800 rounded-full px-2 py-1 mr-1 mb-1 ${reactions.some((r: any) => {
                                    const reactionUserId = typeof r.userId === 'string' ? r.userId : r.userId?._id;
                                    return reactionUserId === currentUserId;
                                })
                                    ? 'border border-[#6C5CE7]'
                                    : ''
                                    }`}
                            >
                                <Text className="text-base">{emoji}</Text>
                                {reactions.length > 1 && (
                                    <Text className="text-white text-xs ml-1">
                                        {reactions.length}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Message Options Menu */}
            <MessageOptionsMenu
                visible={showOptionsMenu}
                onClose={() => setShowOptionsMenu(false)}
                options={getMessageOptions()}
                isOwnMessage={isOwnMessage}
            />

            {/* Emoji Picker */}
            <EmojiPicker
                visible={showEmojiPicker}
                onClose={() => setShowEmojiPicker(false)}
                onSelectEmoji={handleEmojiSelect}
            />

            {/* Image Viewer */}
            {message.type === 'image' && message.media?.url && (
                <ImageViewer
                    visible={showImageViewer}
                    imageUrl={`http://172.18.58.26:5000${message.media.url}`}
                    onClose={() => setShowImageViewer(false)}
                />
            )}
        </View>
    );
}
