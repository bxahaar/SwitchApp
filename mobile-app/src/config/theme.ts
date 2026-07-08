// Theme Configuration
export const COLORS = {
  // Primary colors
  primary: '#5E59C0',
  primaryDark: '#4A46A0',
  primaryLight: '#7A76D4',
  
  // Secondary colors
  secondary: '#9B59B6',
  secondaryDark: '#7D3C98',
  secondaryLight: '#BB8FCE',
  
  // Semantic colors
  success: '#2ECC71',
  warning: '#F39C12',
  error: '#E74C3C',
  info: '#3498DB',
  
  // Service category colors
  engine: '#5E59C0',
  brake: '#E74C3C',
  gearbox: '#3498DB',
  battery: '#F39C12',
  tire: '#2ECC71',
  oil: '#9B59B6',
  filter: '#1ABC9C',
  suspension: '#34495E',
  electrical: '#F1C40F',
  cooling: '#16A085',
  general: '#95A5A6',
  other: '#7F8C8D',
  
  // Neutral colors (Light theme)
  light: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    card: '#FFFFFF',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#E0E0E0',
    divider: '#ECEFF1',
    placeholder: '#BDC3C7',
    disabled: '#95A5A6',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Neutral colors (Dark theme)
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    card: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#3A3A3A',
    divider: '#2A2A2A',
    placeholder: '#757575',
    disabled: '#5A5A5A',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  // Default (for compatibility)
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#2C3E50',
  textSecondary: '#7F8C8D',
  border: '#E0E0E0',
  divider: '#ECEFF1',
  placeholder: '#BDC3C7',
  disabled: '#95A5A6',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    xxl: 40,
  },
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// Shortcut exports for convenience
export const FONT_SIZE = TYPOGRAPHY.fontSize;
export const LINE_HEIGHT = TYPOGRAPHY.lineHeight;
export const FONT_FAMILY = TYPOGRAPHY.fontFamily;