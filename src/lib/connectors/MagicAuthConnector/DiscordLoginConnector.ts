import { MagicAuthSocialLoginConnector, contructorInputType  } from './MagicAuthSocialLoginConnector';

export class DiscordLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'discord-login'
    name = 'Discord Login'
    constructor({ chains, options }: contructorInputType) {
        super({ chains, options })
        this.oAuthProvider = 'discord'
    }
}