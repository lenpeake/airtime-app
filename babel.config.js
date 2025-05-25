module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
        blocklist: null,
        allowlist: ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'TSA_API_KEY'],
        safe: false,
        allowUndefined: false,
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
