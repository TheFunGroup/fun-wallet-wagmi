"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitterLoginConnector = void 0;
const MagicAuthSocialLoginConnector_1 = require("./MagicAuthSocialLoginConnector");
class TwitterLoginConnector extends MagicAuthSocialLoginConnector_1.MagicAuthSocialLoginConnector {
    constructor({ chains, options }) {
        super({ chains, options });
        this.id = 'twitter-login';
        this.name = 'Twitter Login';
        this.oAuthProvider = 'twitter';
    }
}
exports.TwitterLoginConnector = TwitterLoginConnector;
