import { apiClient } from '../client';
import { Chat } from '../chat/chatApi';
import { fetch as expoFetch } from 'expo/fetch';

export interface AIBot {
    _id: string;
    username: string;
    profilePic?: string;
    bio: string;
    isOnline: boolean;
}

export interface AIBotResponse {
    success: boolean;
    data: AIBot;
}

export interface AIChatResponse {
    success: boolean;
    data: Chat;
}

/**
 * Get AI bot information
 */
export const getAIBot = async (): Promise<AIBotResponse> => {
    try {
        console.log('📡 Fetching AI bot information');
        const response = await apiClient.get<AIBotResponse>('/api/ai/bot');
        console.log('✅ AI bot information fetched:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to fetch AI bot:', error);
        throw error;
    }
};

/**
 * Get or create AI chat for current user
 */
export const getOrCreateAIChat = async (): Promise<AIChatResponse> => {
    try {
        console.log('📡 Getting or creating AI chat');
        const response = await apiClient.get<AIChatResponse>('/api/ai/chat');
        console.log('✅ AI chat retrieved:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('❌ Failed to get AI chat:', error);
        throw error;
    }
};

/**
 * Send message to AI with streaming response
 * Use Expo's streaming fetch implementation so native clients can update the
 * pending bubble as provider chunks arrive.
 * @param message - User's message
 * @param chatId - Chat ID
 * @param onChunk - Callback used to replace the pending bubble with the response
 * @param onComplete - Callback when response is complete
 * @param onError - Callback for errors
 */
export const sendMessageToAI = async (
    message: string,
    chatId: string,
    onChunk: (content: string) => void,
    onComplete: () => void,
    onError: (error: string) => void
): Promise<void> => {
    let requestTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
        console.log('📡 Sending message to AI');
        console.log('   Message:', message);
        console.log('   Chat ID:', chatId);

        // Dynamically import to get the current token
        const { useAuthStore } = await import('../../store/authStore');
        const token = useAuthStore.getState().token;

        if (!token) {
            throw new Error('No authentication token available');
        }

        // Show a loading message
        onChunk('Thinking...');

        const abortController = new AbortController();
        requestTimeout = setTimeout(() => abortController.abort(), 50000);

        const response = await expoFetch(`${apiClient.defaults.baseURL}/api/ai/message`, {
            method: 'POST',
            signal: abortController.signal,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ message, chatId }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        console.log('✅ AI response received');

        if (!response.body) {
            throw new Error('Streaming response body is unavailable');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let streamBuffer = '';
        let fullResponse = '';

        const processLine = (line: string) => {
            if (!line.startsWith('data: ')) return;

            const data = line.slice('data: '.length).trim();
            if (!data || data === '[DONE]') return;

            try {
                const parsed = JSON.parse(data);
                if (parsed.error) {
                    throw new Error(parsed.error);
                }

                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    onChunk(fullResponse);
                }
            } catch (error: any) {
                if (!(error instanceof SyntaxError)) throw error;
            }
        };

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            streamBuffer += decoder.decode(value, { stream: true });
            const lines = streamBuffer.split('\n');
            streamBuffer = lines.pop() || '';
            lines.forEach(processLine);
        }

        streamBuffer += decoder.decode();
        if (streamBuffer) processLine(streamBuffer);

        clearTimeout(requestTimeout);
        onComplete();

    } catch (error: any) {
        if (requestTimeout) clearTimeout(requestTimeout);
        console.error('❌ Failed to send message to AI:', error);
        onError(error.name === 'AbortError'
            ? 'The AI response took too long. Please try again.'
            : error.message || 'Failed to send message to AI');
    }
};
