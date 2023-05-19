import { MagicAuthFunWalletConnector } from './MagicAuthFunWalletConnector';

export class GoogleLoginFunWalletConnector extends MagicAuthFunWalletConnector {
    id = 'google-login'
    name = 'Google Login'
    constructor({ chains, options }) {
        super({ chains, options })
        this.oAuthProvider = 'google'
    }
}