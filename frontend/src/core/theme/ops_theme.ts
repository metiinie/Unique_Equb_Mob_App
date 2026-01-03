/**
 * OPERATOR UI THEME SYSTEM
 * 
 * Design Philosophy:
 * - Clarity over Beauty
 * - Trust over Speed
 * - Safety over Delight
 * 
 * This theme enforces "boring" reliability.
 */

export const OPS_THEME = {
    colors: {
        // BACKGROUNDS
        bg: {
            app: '#0F172A',      // Slate 900 (Deep, technical background)
            surface: '#1E293B',  // Slate 800 (Card surface)
            panel: '#020617',    // Slate 950 (Console/Log output)
            highlight: '#334155',// Slate 700 (Hover/Active states)
        },
        // BORDERS
        border: {
            subtle: '#334155',   // Slate 700
            focus: '#475569',    // Slate 600
            critical: '#7F1D1D', // Red 900 (Border for critical errors)
            verified: '#064E3B', // Emerald 900 (Border for success)
        },
        // TEXT
        text: {
            primary: '#F8FAFC',  // Slate 50 (High contrast)
            secondary: '#94A3B8',// Slate 400 (Labels, less important info)
            tertiary: '#64748B', // Slate 500 (Meta info)
            mono: '#E2E8F0',     // Slate 200 (Data values)
        },
        // SEMANTIC STATUS (Strict meanings)
        status: {
            success: '#10B981',  // Emerald 500 (Verified, Safe)
            warning: '#F59E0B',  // Amber 500 (Caution, Pause)
            critical: '#EF4444', // Red 500 (Danger, Stop)
            info: '#3B82F6',     // Blue 500 (Reference, Link)
            neutral: '#64748B',  // Slate 500 (Inactive, Unknown)
        }
    },
    // TYPOGRAPHY CONFIG
    typography: {
        size: {
            xs: 10,
            sm: 12,
            base: 14,
            lg: 16,
            xl: 20,
            xxl: 24,
        },
        weight: {
            regular: '400',
            medium: '500',
            bold: '700',
            black: '900', // Used for key metrics
        },
        spacing: {
            tight: 0.5, // letterSpacing
            wide: 1.0,
            loose: 2.0, // for all caps labels
        }
    },
    // COMPONENT TOKENS
    layout: {
        cardPadding: 16,
        screenPadding: 20,
        borderRadius: 4, // Sharp corners = "Technical/Precision" feel. No soft roundness.
        borderWidth: 1,
    }
};
