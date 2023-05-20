import { Connector, normalizeChainId } from '@wagmi/core'
import { OAuthExtension } from '@magic-ext/oauth';
import { ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { Magic } from 'magic-sdk';

const IS_SERVER = typeof window === 'undefined'

export class MagicAuthSocialLoginConnector extends Connector {
    ready = !IS_SERVER
    id = 'social-login-connector'
    name = 'Social Login Connector'

    constructor({ chains, options }) {
        super({ chains, options })
        this.chain = options.chainId
        this.magicAuthApiKey = options.magicAuthApiKey || 'pk_live_846F1095F0E1303C'
        this.oAuthProvider = options.oAuthProvider || 'magicAuth'
        this.redirectURI = options.redirectURI || window.location.href
    }

    getMagic(chainId=this.chain, force=false) {
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

    async getAuthId() {
        if (this.authId) {
            return this.authId
        }

        let authId = this.oAuthResult.oauth.userInfo.preferredUsername ? this.oAuthResult.oauth.userInfo.preferredUsername : this.oAuthResult.oauth.userInfo.email
        this.authId = `${this.oAuthResult.oauth.provider}###${authId}`
        return this.authId
    }

    async connect() {
        const provider = await this.getProvider()
        if (provider.on) {
            provider.on('accountsChanged', this.onAccountsChanged)
            provider.on('chainChanged', this.onChainChanged)
            provider.on('disconnect', this.onDisconnect)
        }

        this.emit("message", { type: "connecting" });
        
        // Check if we have a chainId, in case of error just assign 0 for legacy
        let chainId
        try {
            chainId = await this.getChainId()
        } catch {
            chainId = 0
        }

        // if there is a user logged in, return the user
        if (await this.isAuthorized()) {
            return {
                provider,
                chain: {
                    id: chainId,
                    unsupported: false,
                },
                account: await this.getAccount(),
            }
        }

        const magic = this.getMagic()

        await magic.oauth.loginWithRedirect({
            provider: this.oAuthProvider,
            redirectURI: this.redirectURI
        })

        if (await magic.user.isLoggedIn()) {
            return {
                account: await this.getAccount(),
                chain: {
                    id: chainId,
                    unsupported: false,
                },
                provider,
            }
        }
    }

    async disconnect() {
        const magic = this.getMagic()
        await magic.user.logout()
    }

    async getAccount() {
        const signer = await this.getSigner()
        const account = await signer.getAddress()
        if (account.startsWith('0x')) {
            return account
        } else {
            return '0x' + account
        }
    }

    async getChainId() {
        return normalizeChainId(this.chain)
    }

    async getProvider(chainId=this.chain) {
        const magic = this.getMagic(chainId)
        return new ethers.providers.Web3Provider(magic?.rpcProvider)
    }

    async getSigner(chainId=this.chain) {
        const provider = await this.getProvider(chainId)
        return provider.getSigner()
    }

    async switchChain(chainId) {
        const id = normalizeChainId(chainId)
        this.chain = id
        const chain = this.chains.find((x) => x.id === chainId);
        if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
        
        await this.getMagic(this.chain, true)
        this.emit("change", { chain: { id: this.chain, unsupported: false } });
        return chain
    }

    async isAuthorized() {
        try {
            const magic = this.getMagic()
            const isLoggedIn = await magic.user.isLoggedIn()
            if (isLoggedIn) {
                return true
            }

            if (this.oAuthResult) {
                return true
            }
            this.oAuthResult = await magic.oauth.getRedirectResult()
            return this.oAuthResult != null
        } catch {
            return false
        }
    }

    onAccountsChanged(accounts) {
        if (accounts.length === 0) {
            this.emit('disconnect')
        } else {
            this.emit('change', {account: getAddress(accounts[0]) })
        }
    }

    onChainChanged(chainId) {
        const id = normalizeChainId(chainId)
        const unsupported = this.isChainUnsupported(id)
        this.emit('change', { chain: { id, unsupported } })
    }

    onDisconnect() {
        this.emit('disconnect')
    }
}