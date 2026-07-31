/**
 * WebRTC ICE Server Configuration (STUN / TURN)
 * 
 * Configures Metered.ca TURN Server via Environment Variables:
 * - EXPO_PUBLIC_TURN_URL
 * - EXPO_PUBLIC_TURN_USERNAME
 * - EXPO_PUBLIC_TURN_PASSWORD
 */

export interface IceServer {
    urls: string | string[];
    username?: string;
    credential?: string;
}

// Metered.ca TURN configuration from environment variables
const METERED_TURN_URL = process.env.EXPO_PUBLIC_TURN_URL || 'turn:global.relay.metered.ca:80';
const METERED_TURN_USERNAME = process.env.EXPO_PUBLIC_TURN_USERNAME || '';
const METERED_TURN_PASSWORD = process.env.EXPO_PUBLIC_TURN_PASSWORD || '';

/**
 * Get configured WebRTC ICE servers including STUN & TURN
 */
export const getIceServers = (): IceServer[] => {
    const iceServers: IceServer[] = [
        // Public STUN Servers
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.relay.metered.ca:80' },
    ];

    // Add Metered.ca TURN servers if username & password environment variables are present
    if (METERED_TURN_USERNAME && METERED_TURN_PASSWORD) {
        const turnHost = METERED_TURN_URL.replace(/^(turn:|turns:)/, '').replace(/:.*$/, '');

        iceServers.push(
            {
                urls: `turn:${turnHost}:80`,
                username: METERED_TURN_USERNAME,
                credential: METERED_TURN_PASSWORD,
            },
            {
                urls: `turn:${turnHost}:80?transport=tcp`,
                username: METERED_TURN_USERNAME,
                credential: METERED_TURN_PASSWORD,
            },
            {
                urls: `turn:${turnHost}:443`,
                username: METERED_TURN_USERNAME,
                credential: METERED_TURN_PASSWORD,
            },
            {
                urls: `turns:${turnHost}:443?transport=tcp`,
                username: METERED_TURN_USERNAME,
                credential: METERED_TURN_PASSWORD,
            }
        );
        console.log('WebRTC configured with Metered.ca TURN server');
    } else {
        console.log('WebRTC using STUN servers (Metered TURN credentials not set in environment)');
    }

    return iceServers;
};

export const ICE_SERVERS = getIceServers();
