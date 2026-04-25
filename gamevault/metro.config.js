const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const wsShimPath = path.resolve(__dirname, 'src/shims/ws.ts');
const streamShimPath = path.resolve(__dirname, 'src/shims/stream.ts');

config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  ws: wsShimPath,
  stream: streamShimPath,
};

config.resolver.resolverMainFields = ['react-native', 'browser', 'module', 'main'];

const watermelonWebShim = path.resolve(__dirname, 'src/shims/watermelondb-web.ts');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'ws') {
    return {
      filePath: wsShimPath,
      type: 'sourceFile',
    };
  }

  if (moduleName === 'stream') {
    return {
      filePath: streamShimPath,
      type: 'sourceFile',
    };
  }

  // WatermelonDB SQLite is not supported on web — replace with a shim
  if (platform === 'web' && (
    moduleName === 'better-sqlite3' ||
    moduleName.includes('@nozbe/watermelondb/adapters/sqlite')
  )) {
    return {
      filePath: watermelonWebShim,
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

// Use default web transformer instead of Hermes to avoid import.meta issues
config.transformer = {
  ...config.transformer,
  unstable_allowRequireContext: true,
};

module.exports = config;
