const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  process: require.resolve('process/browser'),
  assert: require.resolve('assert'),
  events: require.resolve('events'),
  util: require.resolve('util'),
  crypto: require.resolve('crypto-browserify'),
};

module.exports = defaultConfig;
