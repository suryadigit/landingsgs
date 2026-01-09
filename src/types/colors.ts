export type ColorPalette = {
    bg: {
        primary: string;
        secondary: string;
        tertiary: string;
        gray: string;
        dark: string;
        bluelogosgs?: string;
    };
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        danger: string;
        dark: string;
        bluetext?: string;
    };
    accent: {
        primary: string;
        secondary: string;
        primaryDark?: string;
    };
    border: string;
};

export const COLORS_LIGHT: ColorPalette = {
    bg: {
        primary: "#ffffff",
        dark: "#1e293b",
        secondary: "#1e293b",
        tertiary: "#334155",
        gray: "#dbdbdbff",
    },
    text: {
        primary: "#1e293b",
        secondary: "#475569",
        tertiary: "#94a3b8",
        danger: "#ef4444",
        dark: "#1e293b",
    },
    accent: {
        primary: "#3b82f6",
        primaryDark: "#0947abff",
        secondary: "#b2b2b8ff",
    },
    border: "#e2e8f0",
};

export const COLORS_DARK: ColorPalette = {
    bg: {
        bluelogosgs: "#0665fc",
        primary: "#0d0d0d",
        dark: "#0d0d0d",
        secondary: "#1a1b1e",
        tertiary: "#2c2e33",
        gray: "#373a40",
    },
    text: {
        primary: "#c1c2c5",
        secondary: "#a6a7ab",
        tertiary: "#909296",
        danger: "#ef4444",
        dark: "#ffffff",
        bluetext: "#0665fc",
    },
    accent: {
        primary: "#3b82f6",
        secondary: "#8b5cf6",
    },
    border: "#373a40",
};

export const COLORS: ColorPalette = COLORS_LIGHT;