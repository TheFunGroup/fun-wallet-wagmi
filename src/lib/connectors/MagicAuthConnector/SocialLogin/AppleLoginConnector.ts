import { MagicAuthSocialLoginConnector, contructorInputType } from './MagicAuthSocialLoginConnector';

export class AppleLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'apple-login'
    name = 'Apple Login'
    constructor({ chains, options }: contructorInputType) {
        super({ chains, options })
        this.oAuthProvider = 'apple'
    }
}