const { AppleLoginConnector } = require('./src/lib/connectors/AppleLoginConnector');
const { DiscordLoginConnector } = require('./src/lib/connectors/DiscordLoginConnector');
const { GoogleLoginConnector } = require('./src/lib/connectors/GoogleLoginConnector');
const { TwitterLoginConnector } = require('./src/lib/connectors/TwitterLoginConnector');

module.exports = { AppleLoginConnector, DiscordLoginConnector, GoogleLoginConnector, TwitterLoginConnector };