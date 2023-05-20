import { normalizeChainId } from '@wagmi/core';
import { Magic } from 'magic-sdk';
import { ethers } from 'ethers';
import { OAuthExtension } from '@magic-ext/oauth';
import { MagicAuthEoa } from 'fun-wallet/auth';
import { FunWalletConnector } from './FunWalletConnector';

const IS_SERVER = typeof window === 'undefined'

export class MagicAuthFunWalletConnector extends FunWalletConnector {
    ready = !IS_SERVER
    id = 'magic-auth-fun-wallet-connector'
    name = 'Magic Auth Fun Wallet Connector'

    constructor({ chains, options }) {
        super({ chains, options })
        this.oAuthProvider = options.oAuthProvider || 'magicAuth'
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

        let authId = this.oAuthResult.oauth.userInfo.preferredUsername ? this.oAuthResult.oauth.userInfo.preferredUsername : this.oAuthResult.oauth.userInfo.email
        authId = `${this.oAuthResult.oauth.provider}###${authId}`
        this.auth = new MagicAuthEoa({ provider: await this.getProvider(), uniqueId:  authId})
        return this.auth
    }

    async connect() {
        const magic = this.getMagic()

        await magic.oauth.loginWithRedirect({
            provider: this.oAuthProvider,
            redirectURI: this.redirectURI
        })

        await super.connect()
    }

    async connectSocialLogin() {
        const magic = this.getMagic()

        await magic.oauth.loginWithRedirect({
            provider: this.oAuthProvider,
            redirectURI: this.redirectURI
        })
    }

    // async isLoggedIn() {
    //     try {
    //         const magic = this.getMagic()
    //         const isLoggedIn = await magic.user.isLoggedIn()
    //         if (isLoggedIn) {
    //             return true
    //         }
    //         console.log("magic: ", magic.oauth)
    //         const result = await magic.oauth.getRedirectResult()
    //         console.log("result" , result)
    //         return result != null
    //     } catch {
    //         return false
    //     }
    // }

    async isAuthorized() {
        try {
            const magic = this.getMagic()
            const isLoggedIn = await magic.user.isLoggedIn()
            if (isLoggedIn) {
                return true
            }
            
            if (this.oAuthResult) {
                return true;
            }
            this.oAuthResult = await magic.oauth.getRedirectResult()
            return this.oAuthResult != null
        } catch {
            return false
        }
    }

    async disconnect() {
        await super.disconnect()
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
}