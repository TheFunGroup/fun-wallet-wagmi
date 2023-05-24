"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordLoginConnector = void 0;
const MagicAuthSocialLoginConnector_1 = require("./MagicAuthSocialLoginConnector");
class DiscordLoginConnector extends MagicAuthSocialLoginConnector_1.MagicAuthSocialLoginConnector {
    constructor({ chains, options }) {
        super({ chains, options });
        this.id = 'discord-login';
        this.name = 'Discord Login';
        this.oAuthProvider = 'discord';
    }
}
exports.DiscordLoginConnector = DiscordLoginConnector;
