"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MagicAuthSocialLoginConnector = void 0;
const core_1 = require("@wagmi/core");
const oauth_1 = require("@magic-ext/oauth");
const ethers_1 = require("ethers");
const utils_1 = require("ethers/lib/utils");
const magic_sdk_1 = require("magic-sdk");
const util_1 = require("../../../util");
const IS_SERVER = typeof window === 'undefined';
class MagicAuthSocialLoginConnector extends core_1.Connector {
    constructor({ chains, options }) {
        super({ chains, options });
        this.ready = !IS_SERVER;
        this.id = 'social-login-connector';
        this.name = 'Social Login Connector';
        this.chainId = options.chainId;
        this.magicAuthApiKey = options.magicAuthApiKey || 'pk_live_846F1095F0E1303C';
        this.oAuthProvider = options.oAuthProvider || 'magicAuth';
        this.redirectURI = options.redirectURI || window.location.href;
        this.authId = null;
        this.oAuthResult = null;
    }
    getMagic(chainId = Number(this.chainId), force = false) {
        var _a;
        if (force || !this.magic) {
            const chain = this.chains.find((x) => x.id === chainId);
            if (!chain)
                throw new Error(`Unsupported chainId: ${chainId}`);
            this.magic = new magic_sdk_1.Magic(this.magicAuthApiKey, {
                network: {
                    chainId: chainId,
                    rpcUrl: (_a = chain === null || chain === void 0 ? void 0 : chain.rpcUrls.default) === null || _a === void 0 ? void 0 : _a.http[0]
                },
                extensions: [new oauth_1.OAuthExtension()],
            });
        }
        return this.magic;
    }
    getAuthId() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            if (this.authId) {
                return this.authId;
            }
            let authId = ((_a = this.oAuthResult) === null || _a === void 0 ? void 0 : _a.oauth.userInfo.preferredUsername) ? (_b = this.oAuthResult) === null || _b === void 0 ? void 0 : _b.oauth.userInfo.preferredUsername : (_c = this.oAuthResult) === null || _c === void 0 ? void 0 : _c.oauth.userInfo.email;
            this.authId = `${(_d = this.oAuthResult) === null || _d === void 0 ? void 0 : _d.oauth.provider}###${authId}`;
            return this.authId;
        });
    }
    connect(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield this.getProvider(config);
            if (provider.on) {
                provider.on('accountsChanged', this.onAccountsChanged);
                provider.on('chainChanged', this.onChainChanged);
                provider.on('disconnect', this.onDisconnect);
            }
            this.emit("message", { type: "connecting" });
            // Check if we have a chainId, in case of error just assign 0 for legacy
            let chainId;
            try {
                chainId = yield this.getChainId();
            }
            catch (_a) {
                chainId = 0;
            }
            // if there is a user logged in, return the user
            if (yield this.isAuthorized()) {
                return {
                    // provider, // TODO is this used anywhere?
                    chain: {
                        id: chainId,
                        unsupported: false,
                    },
                    account: yield this.getAccount(),
                };
            }
            const magic = this.getMagic();
            yield magic.oauth.loginWithRedirect({
                provider: this.oAuthProvider,
                redirectURI: this.redirectURI
            });
            if (yield magic.user.isLoggedIn()) {
                return {
                    account: yield this.getAccount(),
                    chain: {
                        id: chainId,
                        unsupported: false,
                    },
                    // provider, TODO check this as well
                };
            }
            return {
                account: `0x0000`,
                chain: { id: 0, unsupported: true },
            };
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            const magic = this.getMagic();
            yield magic.user.logout();
        });
    }
    getAccount() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const signer = yield this.getSigner();
                const account = yield signer.getAddress();
                if (account.startsWith('0x')) {
                    return account;
                }
                else {
                    return `0x${account}`;
                }
            }
            catch (err) {
                console.log(err);
                return '0x0';
            }
        });
    }
    // TODO: figure out how to get the chainId from the magic SDK or from ethers or from funWallet
    getChainId() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, util_1.normalizeChainId)(this.chainId);
        });
    }
    getProvider(config) {
        return __awaiter(this, void 0, void 0, function* () {
            const chainId = (config === null || config === void 0 ? void 0 : config.chainId) || Number(this.chainId);
            const magic = this.getMagic(chainId);
            return new ethers_1.ethers.providers.Web3Provider(magic === null || magic === void 0 ? void 0 : magic.rpcProvider);
        });
    }
    getSigner(chainId = this.chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = yield this.getProvider({ chainId });
            return provider.getSigner();
        });
    }
    switchChain(chainId) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = (0, util_1.normalizeChainId)(chainId);
            this.chainId = id;
            const chain = this.chains.find((x) => x.id === chainId);
            if (!chain)
                throw new Error(`Unsupported chainId: ${chainId}`);
            yield this.getMagic(this.chainId, true);
            this.emit("change", { chain: { id: this.chainId, unsupported: false } });
            return chain;
        });
    }
    isAuthorized() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const magic = this.getMagic();
                const isLoggedIn = yield magic.user.isLoggedIn();
                if (isLoggedIn) {
                    return true;
                }
                if (this.oAuthResult) {
                    return true;
                }
                this.oAuthResult = yield magic.oauth.getRedirectResult();
                return this.oAuthResult != null;
            }
            catch (_a) {
                return false;
            }
        });
    }
    onAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.emit('disconnect');
        }
        else {
            this.emit('change', { account: (0, utils_1.getAddress)(accounts[0]) });
        }
    }
    onChainChanged(chainId) {
        const id = (0, util_1.normalizeChainId)(chainId);
        const unsupported = this.isChainUnsupported(id);
        this.emit('change', { chain: { id, unsupported } });
    }
    onDisconnect() {
        this.emit('disconnect');
    }
    // This method implements Viem and returns the WalletClient type from viem
    getWalletClient() {
        throw new Error('Method not implemented.');
    }
}
exports.MagicAuthSocialLoginConnector = MagicAuthSocialLoginConnector;
