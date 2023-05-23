import { MagicAuthSocialLoginConnector, contructorInputType  } from './MagicAuthSocialLoginConnector';

export class GoogleLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'google-login'
    name = 'Google Login'
    constructor({ chains, options }: contructorInputType) {
        super({ chains, options })
        this.oAuthProvider = 'google'
    }
}