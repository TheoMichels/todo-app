module.exports = ({ config = {} } = {}) => ({
  ...config,
  name: config.name || 'Todo',
  slug: config.slug || 'Todo',
  version: config.version || '1.0.0',
  orientation: config.orientation || 'portrait',
  icon: config.icon || './assets/icon.png',
  userInterfaceStyle: config.userInterfaceStyle || 'light',
  ios: {
    supportsTablet: true,
    ...(config.ios || {}),
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
      ...(config.android?.adaptiveIcon || {}),
    },
    predictiveBackGestureEnabled: false,
    ...(config.android || {}),
  },
  web: {
    favicon: './assets/favicon.png',
    ...(config.web || {}),
  },
  extra: {
    ...config.extra,
    // Décision au build : une clé présente ne doit jamais activer le cloud localement.
    storageMode: process.env.VERCEL === '1' && process.env.VERCEL_ENV !== 'development' ? 'supabase' : 'local',
  },
});
