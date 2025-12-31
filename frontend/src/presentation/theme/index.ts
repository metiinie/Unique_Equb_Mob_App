export const Theme = {
    colors: {
        primary: '#2b6cee',
        secondary: '#2b6cee', // Mapping to primary for now as per design
        background: '#101622', // Defaulting to Dark as per designs
        surface: '#101622',
        surfaceLight: '#1e2430', // Used in dashboard cards
        text: {
            primary: '#ffffff',
            secondary: '#9da6b9', // Slate/Blue-grey from designs
            muted: '#64748b',
            inverted: '#ffffff',
        },
        status: {
            success: '#10b981', // Emerald 500
            warning: '#f59e0b', // Amber 500
            error: '#ef4444', // Red 500
            info: '#3b82f6', // Blue 500
        },
        border: '#1e2430',
        borderLight: '#2c3442',
        glass: 'rgba(255, 255, 255, 0.05)',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },
    borderRadius: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
        '2xl': 20,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800' as const,
            letterSpacing: -0.5,
            fontFamily: 'Plus Jakarta Sans',
        },
        h2: {
            fontSize: 24,
            fontWeight: '700' as const,
            letterSpacing: -0.3,
            fontFamily: 'Plus Jakarta Sans',
        },
        h3: {
            fontSize: 18,
            fontWeight: '700' as const,
            fontFamily: 'Plus Jakarta Sans',
        },
        body: {
            fontSize: 16,
            fontWeight: '500' as const,
            fontFamily: 'Plus Jakarta Sans',
        },
        caption: {
            fontSize: 12,
            fontWeight: '500' as const,
            color: '#9da6b9',
            fontFamily: 'Plus Jakarta Sans',
        },
        button: {
            fontSize: 18,
            fontWeight: '700' as const,
            fontFamily: 'Plus Jakarta Sans',
        },
    },
    shadows: {
        soft: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 10,
        },
    }
} as const;
