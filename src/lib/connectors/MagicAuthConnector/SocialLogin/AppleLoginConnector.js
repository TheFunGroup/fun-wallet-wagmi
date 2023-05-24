"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppleLoginConnector = void 0;
const MagicAuthSocialLoginConnector_1 = require("./MagicAuthSocialLoginConnector");
class AppleLoginConnector extends MagicAuthSocialLoginConnector_1.MagicAuthSocialLoginConnector {
    constructor({ chains, options }) {
        super({ chains, options });
        this.id = 'apple-login';
        this.name = 'Apple Login';
        this.oAuthProvider = 'apple';
    }
}
exports.AppleLoginConnector = AppleLoginConnector;
