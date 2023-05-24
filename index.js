const { AppleLoginConnector } = import('./src/lib/connectors/AppleLoginConnector');
const { DiscordLoginConnector } = import('./src/lib/connectors/DiscordLoginConnector');
const { GoogleLoginConnector } = import('./src/lib/connectors/GoogleLoginConnector');
const { TwitterLoginConnector } = import('./src/lib/connectors/TwitterLoginConnector');

export default { AppleLoginConnector, DiscordLoginConnector, GoogleLoginConnector, TwitterLoginConnector };