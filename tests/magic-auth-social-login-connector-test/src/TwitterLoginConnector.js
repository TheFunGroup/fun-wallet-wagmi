import { MagicAuthSocialLoginConnector } from './MagicAuthSocialLoginConnector';

export class TwitterLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'twitter-login'
    name = 'Twitter Login'
    constructor({ chains, options }) {
        super({ chains, options })
        this.oAuthProvider = 'twitter'
    }
}