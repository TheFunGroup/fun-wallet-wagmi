import { MagicAuthSocialLoginConnector } from '../MagicAuthSocialLoginConnector';

export class AppleLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'apple-login'
    name = 'Apple Login'
    constructor({ chains, options }) {
        super({ chains, options })
        this.oAuthProvider = 'apple'
    }
}