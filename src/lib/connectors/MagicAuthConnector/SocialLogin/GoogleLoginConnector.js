"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleLoginConnector = void 0;
const MagicAuthSocialLoginConnector_1 = require("./MagicAuthSocialLoginConnector");
class GoogleLoginConnector extends MagicAuthSocialLoginConnector_1.MagicAuthSocialLoginConnector {
    constructor({ chains, options }) {
        super({ chains, options });
        this.id = 'google-login';
        this.name = 'Google Login';
        this.oAuthProvider = 'google';
    }
}
exports.GoogleLoginConnector = GoogleLoginConnector;
