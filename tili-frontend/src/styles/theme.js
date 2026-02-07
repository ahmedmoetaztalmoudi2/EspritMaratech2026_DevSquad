// TILI Theme Configuration - Colors based on TILI Logo
// Primary: Dark Blue (#1e4a8d), Secondary: Gold (#c9a227)

const theme = {
    token: {
        // Primary Colors - TILI Blue
        colorPrimary: '#1e4a8d',
        colorPrimaryBg: '#e7eef7',
        colorPrimaryBgHover: '#d0dff2',
        colorPrimaryBorder: '#a3c1e0',
        colorPrimaryBorderHover: '#6a9dd0',
        colorPrimaryHover: '#3c7bb8',
        colorPrimaryActive: '#153a6e',
        colorPrimaryTextHover: '#3c7bb8',
        colorPrimaryText: '#1e4a8d',
        colorPrimaryTextActive: '#153a6e',

        // Info colors
        colorInfo: '#1e4a8d',

        // Link colors
        colorLink: '#1e4a8d',
        colorLinkHover: '#3c7bb8',
        colorLinkActive: '#153a6e',

        // Success - Keep green
        colorSuccess: '#10b981',
        colorSuccessBg: '#d1fae5',
        colorSuccessBorder: '#6ee7b7',

        // Warning - TILI Gold
        colorWarning: '#c9a227',
        colorWarningBg: '#fef3c7',
        colorWarningBorder: '#fcd34d',

        // Error - Standard red
        colorError: '#ef4444',
        colorErrorBg: '#fee2e2',
        colorErrorBorder: '#fca5a5',

        // Background & Text
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f5f7fa',
        colorText: '#1e293b',
        colorTextSecondary: '#64748b',
        colorTextTertiary: '#94a3b8',
        colorBorder: '#e2e8f0',
        colorBorderSecondary: '#f1f5f9',

        // Border Radius
        borderRadius: 8,
        borderRadiusLG: 12,
        borderRadiusSM: 4,

        // Font
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontSize: 14,
        fontSizeHeading1: 30,
        fontSizeHeading2: 24,
        fontSizeHeading3: 20,
        fontSizeHeading4: 16,
        fontSizeHeading5: 14,

        // Sizing
        controlHeight: 38,
        controlHeightLG: 44,
        controlHeightSM: 30,

        // Spacing
        marginLG: 24,
        marginMD: 16,
        marginSM: 12,
        marginXS: 8,
        paddingLG: 24,
        paddingMD: 16,
        paddingSM: 12,
        paddingXS: 8,
    },
    components: {
        Button: {
            colorPrimary: '#1e4a8d',
            colorPrimaryHover: '#3c7bb8',
            colorPrimaryActive: '#153a6e',
            borderRadius: 8,
            fontWeight: 500,
        },
        Menu: {
            darkItemBg: 'transparent',
            darkSubMenuItemBg: 'transparent',
            darkItemSelectedBg: '#3c7bb8',
            darkItemHoverBg: 'rgba(255, 255, 255, 0.08)',
            darkItemColor: 'rgba(255, 255, 255, 0.85)',
            darkItemSelectedColor: '#ffffff',
        },
        Card: {
            borderRadius: 12,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
            boxShadowSecondary: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#475569',
            rowHoverBg: '#f8fafc',
            borderRadius: 12,
        },
        Input: {
            borderRadius: 8,
        },
        Select: {
            borderRadius: 8,
        },
        DatePicker: {
            borderRadius: 8,
        },
        Tag: {
            borderRadiusSM: 6,
        },
        Modal: {
            borderRadiusLG: 16,
        },
        Dropdown: {
            borderRadiusLG: 12,
        },
    },
};

// TILI Brand Colors for custom use
export const TILI_COLORS = {
    primaryDark: '#153a6e',
    primary: '#1e4a8d',
    primaryLight: '#3c7bb8',
    primaryLighter: '#6a9dd0',
    gold: '#c9a227',
    goldLight: '#d4b44a',
    goldLighter: '#e5d08a',
};

export default theme;
