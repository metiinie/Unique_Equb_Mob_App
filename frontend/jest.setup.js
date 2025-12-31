// Basic Jest setup for Expo

// Mocking react-native-reanimated if it exists, otherwise skip
try {
    jest.mock('react-native-reanimated', () => {
        try {
            const Reanimated = require('react-native-reanimated/mock');
            return Reanimated;
        } catch (e) {
            return {};
        }
    });
} catch (e) {
    // skip
}

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
try {
    jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e) {
    // skip
}
