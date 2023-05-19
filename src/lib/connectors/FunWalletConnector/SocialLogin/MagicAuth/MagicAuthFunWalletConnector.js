import { normalizeChainId, getClient } from '@wagmi/core';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { OAuthExtension } from '@magic-ext/oauth';
import { MultiAuthEoa } from 'fun-wallet/auth';
import { FunWalletConnector } from './FunWalletConnector';

const IS_SERVER = typeof window === 'undefined'

const OAUTH_PROVIDERS_STORAGE_KEY = "oauth_providers"
const AUTH_IDS_STORAGE_KEY = "auth_ids"

export class MagicAuthFunWalletConnector extends FunWalletConnector {
    ready = !IS_SERVER
    id = 'magic-auth-fun-wallet-connector'
    name = 'Magic Auth Fun Wallet Connector'

    constructor({ chains, options }) {
        super({ chains, options })
        this.magicAuthApiKey = options.magicAuthApiKey || 'pk_live_846F1095F0E1303C'
        this.redirectURI = options.redirectURI || window.location.href
    }

    getMagic(chainId = this.chain, force = false) {
        if (force || !this.magic) {
            const chain = this.chains.find((x) => x.id === chainId);
            this.magic = new Magic(this.magicAuthApiKey, {
                network: {
                    chainId: chainId,
                    rpcUrl: chain.rpcUrls.default?.http[0]
                },
                extensions: [new OAuthExtension()],
            })
        }
        return this.magic
    }

    async getAuth() {
        if (this.auth) {
            return this.auth
        }

        const authIds = this.getAuthIds()
        if (authIds.size === 0) {
            return null
        }

        this.auth = new MultiAuthEoa({ provider: await this.getProvider(), authIds })
        return this.auth
    }

    async connectSocialLogin(oAuthProvider) {
        const providers = this.getOAuthProviders()
        if (!providers || !providers.includes(oAuthProvider)) {
            const magic = this.getMagic()

            await magic.oauth.loginWithRedirect({
                provider: oAuthProvider,
                redirectURI: this.redirectURI
            })
        }
    }

    async disconnect() {
        await super.disconnect()
        this.removeAuthIds()
        this.removeOAuthProviders()
        const magic = this.getMagic()
        await magic.user.logout()
    }

    async getProvider(chainId = this.chain) {
        const magic = this.getMagic(chainId)
        return new ethers.providers.Web3Provider(magic?.rpcProvider)
    }

    async switchChain(chainId) {
        const id = normalizeChainId(chainId)
        await this.getMagic(id, true)
        return await super.switchChain(chainId)
    }

    async isLoggedIn(oAuthProvider) {
        try {
            const providers = this.getOAuthProviders()
            if (providers && providers.includes(oAuthProvider)) {
                return true
            }
            const magic = this.getMagic()
            const result = await magic.oauth.getRedirectResult()
            this.appendAuthIds(result.oauth.provider, result)
            this.appendOAuthProviders(oAuthProvider)
            return result.oauth.provider === oAuthProvider
        } catch {
            return false
        }
    }

    getAuthIds() {
        return JSON.parse(getClient().storage?.getItem(AUTH_IDS_STORAGE_KEY))
    }

    appendAuthIds(oAuthProvider, oAuthResult) {
        let authIds = this.getAuthIds()
        if (!authIds) {
            authIds = []
        }

        if (!authIds.includes(oAuthProvider)) {
            let authId = oAuthResult.oauth.userInfo.preferredUsername ? oAuthResult.oauth.userInfo.preferredUsername : oAuthResult.oauth.userInfo.email
            authId = `${oAuthResult.oauth.provider}###${authId}`
            const publicKey = oAuthResult.magic.userMetadata.publicAddress
            authIds.push([authId, publicKey])
            getClient().storage?.setItem(AUTH_IDS_STORAGE_KEY, JSON.stringify(authIds))
        }
    }

    removeAuthIds() {
        getClient().storage?.removeItem(AUTH_IDS_STORAGE_KEY)
    }

    getOAuthProviders() {
        return JSON.parse(getClient().storage?.getItem(OAUTH_PROVIDERS_STORAGE_KEY))
    }

    appendOAuthProviders(oAuthProvider) {
        let providers = this.getOAuthProviders()
        if (!providers) {
            providers = []
        }

        if (providers.includes(oAuthProvider)) {
            return
        }

        if (!providers.includes(oAuthProvider)) {
            providers.push(oAuthProvider)
        }

        getClient().storage?.setItem(OAUTH_PROVIDERS_STORAGE_KEY, JSON.stringify(providers))
    }

    removeOAuthProviders() {
        getClient().storage?.removeItem(OAUTH_PROVIDERS_STORAGE_KEY)
    }
}