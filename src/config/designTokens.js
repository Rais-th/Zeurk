import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Design Tokens
export const colors = {
  // Background colors
  background: {
    primary: '#000000',
    secondary: '#1a1a1a',
    tertiary: '#2a2a2a',
    modal: 'rgba(0, 0, 0, 0.8)',
  },
  
  // Text colors
  text: {
    primary: '#ffffff',
    secondary: '#8E8E93',
    tertiary: '#6D6D70',
    inverse: '#000000',
  },
  
  // Brand colors
  brand: {
    primary: '#007AFF',
    secondary: '#5856D6',
    accent: '#FF6B6B',
    success: '#4CAF50',
    warning: '#FFD700',
    error: '#FF3B30',
  },
  
  // UI colors
  ui: {
    border: 'rgba(255, 255, 255, 0.1)',
    separator: 'rgba(255, 255, 255, 0.05)',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.3)',
  }
};

export const typography = {
  // Font sizes
  size: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
  },
  
  // Font weights
  weight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    heavy: '800',
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  }
};

export const spacing = {
  xs: 4,
  sm: 8,
  base: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const borderRadius = {
  xs: 4,
  sm: 8,
  base: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  sm: {
<<<<<<< HEAD
    shadowColor: 'rgba(0, 0, 0, 0.3)',
=======
    shadowColor: colors.ui.shadow,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  base: {
<<<<<<< HEAD
    shadowColor: 'rgba(0, 0, 0, 0.3)',
=======
    shadowColor: colors.ui.shadow,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
<<<<<<< HEAD
    shadowColor: 'rgba(0, 0, 0, 0.3)',
=======
    shadowColor: colors.ui.shadow,
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const layout = {
  screen: {
    width,
    height,
    padding: spacing.lg,
    headerHeight: 60,
    tabBarHeight: 80,
  },
  
  card: {
    width: (width - (spacing.lg * 2) - spacing.base) / 2,
    imageHeight: 140,
    padding: spacing.base,
  },
  
  header: {
    height: 60,
    paddingHorizontal: spacing.lg,
  }
};

export const animations = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  }
<<<<<<< HEAD
};
=======
}; 
>>>>>>> 16f010bc3e5e07fd25b022dd544b03b869402b1b
