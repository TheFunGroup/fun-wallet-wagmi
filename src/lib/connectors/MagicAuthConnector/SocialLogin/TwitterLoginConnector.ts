import { MagicAuthSocialLoginConnector, contructorInputType } from './MagicAuthSocialLoginConnector';

export class TwitterLoginConnector extends MagicAuthSocialLoginConnector {
    id = 'twitter-login'
    name = 'Twitter Login'
    constructor({ chains, options }: contructorInputType) {
        super({ chains, options })
        this.oAuthProvider = 'twitter'
    }
}