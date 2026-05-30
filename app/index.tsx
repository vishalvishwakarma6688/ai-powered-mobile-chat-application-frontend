import { Redirect } from 'expo-router';

// Fallback — Stack initialRouteName="signup" handles the real entry point
export default function Index() {
    return <Redirect href="/signup" />;
}
