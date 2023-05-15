import { MagicAuthSocialLoginConnector } from './MagicAuthSocialLoginConnector';

export class GoogleLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'google-login'
    name = 'Google Login'
    constructor({ chains, options }) {
        super({ chains, options })
        this.oAuthProvider = 'google'
    }
}