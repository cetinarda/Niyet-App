const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// On web, react-native-purchases (native IAP) is unavailable and must not be
// bundled: the host app owns IAP. Stubbing it keeps the web build a single
// bundle (no code-split chunk), matching the shipped embed.
const origResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && moduleName === 'react-native-purchases') {
    return { type: 'empty' };
  }
  return (origResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
