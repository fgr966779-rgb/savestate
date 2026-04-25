/** @type {import('@babel/core').ConfigFunction} */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/stores': './src/stores',
            '@/constants': './src/constants',
            '@/services': './src/services',
            '@/utils': './src/utils',
            '@/hooks': './src/hooks',
            '@/db': './src/db',
            '@/locales': './src/locales',
            '@/types': './src/types',
            '@/assets': './assets',
            '@/app': './app',
          },
        },
      ],
      [
        'transform-inline-environment-variables',
        {
          include: ['EXPO_PUBLIC_'],
        },
      ],
      require.resolve('react-native-worklets/plugin'),
      'babel-plugin-transform-import-meta',
    ],
    overrides: [
      {
        test: /\.tsx?$/,
        plugins: [
          ['@babel/plugin-transform-typescript', { allowDeclareFields: true, isTSX: true }],
          ['@babel/plugin-proposal-decorators', { legacy: true }],
          ['@babel/plugin-transform-class-properties', { loose: true }],
          ['@babel/plugin-transform-private-methods', { loose: true }],
          ['@babel/plugin-transform-private-property-in-object', { loose: true }],
        ],
      },
    ],
    env: {
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
