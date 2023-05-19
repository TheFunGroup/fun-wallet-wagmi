import { MagicAuthSocialLoginConnector } from '../MagicAuthSocialLoginConnector';

export class DiscordLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'discord-login'
    name = 'Discord Login'
    constructor({ chains, options }) {
        super({ chains, options })
        this.oAuthProvider = 'discord'
    }
}