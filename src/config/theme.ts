// Centralized Theme Configuration
// Change gradient colors here and they will apply across the entire portal

export const themeConfig = {
  light: {
    // Light theme gradients
    primary: {
      from: '#000000',
      to: '#9c9c9c',
      gradient: 'linear-gradient(to right, #000000, #9c9c9c)',
      gradientVertical: 'linear-gradient(to bottom, #000000, #9c9c9c)',
      gradientDiagonal: 'linear-gradient(to bottom right, #000000, #9c9c9c)',
      gradientReverse: 'linear-gradient(to left, #9c9c9c, #000000)',
    },
    secondary: {
      from: '#2563eb',
      to: '#06b6d4',
      gradient: 'linear-gradient(to right, #2563eb, #06b6d4)',
      gradientVertical: 'linear-gradient(to bottom, #2563eb, #06b6d4)',
      gradientDiagonal: 'linear-gradient(to bottom right, #2563eb, #06b6d4)',
      gradientReverse: 'linear-gradient(to left, #06b6d4, #2563eb)',
    },
    accent1: {
      from: '#059669',
      to: '#14b8a6',
      gradient: 'linear-gradient(to right, #059669, #14b8a6)',
      gradientVertical: 'linear-gradient(to bottom, #059669, #14b8a6)',
      gradientDiagonal: 'linear-gradient(to bottom right, #059669, #14b8a6)',
      gradientReverse: 'linear-gradient(to left, #14b8a6, #059669)',
    },
    accent2: {
      from: '#ea580c',
      to: '#f59e0b',
      gradient: 'linear-gradient(to right, #ea580c, #f59e0b)',
      gradientVertical: 'linear-gradient(to bottom, #ea580c, #f59e0b)',
      gradientDiagonal: 'linear-gradient(to bottom right, #ea580c, #f59e0b)',
      gradientReverse: 'linear-gradient(to left, #f59e0b, #ea580c)',
    },
  },
  dark: {
    // Dark theme gradients
    primary: {
      from: '#ffffff',
      to: '#9c9c9c',
      gradient: 'linear-gradient(to right, #ffffff, #9c9c9c)',
      gradientVertical: 'linear-gradient(to bottom, #ffffff, #9c9c9c)',
      gradientDiagonal: 'linear-gradient(to bottom right, #ffffff, #9c9c9c)',
      gradientReverse: 'linear-gradient(to left, #9c9c9c, #ffffff)',
    },
    secondary: {
      from: '#3b82f6',
      to: '#22d3ee',
      gradient: 'linear-gradient(to right, #3b82f6, #22d3ee)',
      gradientVertical: 'linear-gradient(to bottom, #3b82f6, #22d3ee)',
      gradientDiagonal: 'linear-gradient(to bottom right, #3b82f6, #22d3ee)',
      gradientReverse: 'linear-gradient(to left, #22d3ee, #3b82f6)',
    },
    accent1: {
      from: '#10b981',
      to: '#2dd4bf',
      gradient: 'linear-gradient(to right, #10b981, #2dd4bf)',
      gradientVertical: 'linear-gradient(to bottom, #10b981, #2dd4bf)',
      gradientDiagonal: 'linear-gradient(to bottom right, #10b981, #2dd4bf)',
      gradientReverse: 'linear-gradient(to left, #2dd4bf, #10b981)',
    },
    accent2: {
      from: '#f97316',
      to: '#fbbf24',
      gradient: 'linear-gradient(to right, #f97316, #fbbf24)',
      gradientVertical: 'linear-gradient(to bottom, #f97316, #fbbf24)',
      gradientDiagonal: 'linear-gradient(to bottom right, #f97316, #fbbf24)',
      gradientReverse: 'linear-gradient(to left, #fbbf24, #f97316)',
    },
  },
};

// Helper function to get gradient based on current theme
export const getGradient = (theme: 'light' | 'dark', type: 'primary' | 'secondary' | 'accent1' | 'accent2' = 'primary') => {
  return themeConfig[theme][type].gradient;
};

export const getGradientVertical = (theme: 'light' | 'dark', type: 'primary' | 'secondary' | 'accent1' | 'accent2' = 'primary') => {
  return themeConfig[theme][type].gradientVertical || themeConfig[theme][type].gradient;
};

export const getGradientDiagonal = (theme: 'light' | 'dark', type: 'primary' | 'secondary' | 'accent1' | 'accent2' = 'primary') => {
  return themeConfig[theme][type].gradientDiagonal || themeConfig[theme][type].gradient;
};

export const getGradientReverse = (theme: 'light' | 'dark', type: 'primary' | 'secondary' | 'accent1' | 'accent2' = 'primary') => {
  return themeConfig[theme][type].gradientReverse || themeConfig[theme][type].gradient;
};

export const getColorFrom = (theme: 'light' | 'dark', type: 'primary' | 'secondary' | 'accent1' | 'accent2' = 'primary') => {
  return themeConfig[theme][type].from;
};

export const getColorTo = (theme: 'light' | 'dark', type: 'primary' | 'secondary' | 'accent1' | 'accent2' = 'primary') => {
  return themeConfig[theme][type].to;
};

// Icon colors based on theme
export const getIconColor = (theme: 'light' | 'dark', index: number) => {
  const colors = {
    light: ['#000000', '#2563eb', '#059669', '#ea580c'],
    dark: ['#ffffff', '#3b82f6', '#10b981', '#f97316'],
  };
  return colors[theme][index] || colors[theme][0];
};

// Get text color that contrasts with gradient background
export const getContrastTextColor = (theme: 'light' | 'dark') => {
  // For light theme with dark gradient, use white text
  // For dark theme with light gradient, use dark text
  return theme === 'light' ? '#ffffff' : '#1f2937';
};

export default themeConfig;
