const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);
// Allow .tw Bible files as assets
config.resolver.assetExts.push("tw");
module.exports = config;
