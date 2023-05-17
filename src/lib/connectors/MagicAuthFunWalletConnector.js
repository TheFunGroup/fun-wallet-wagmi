import { normalizeChainId } from '@wagmi/core';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth';
import { getAddress } from 'ethers/lib/utils';
import { FunWallet, configureEnvironment } from 'fun-wallet';
import { FunWalletConnector } from './FunWalletConnector';

const IS_SERVER = typeof window === 'undefined'

export class MagicAuthFunWalletConnector extends FunWalletConnector {
    ready = !IS_SERVER
    id = 'magic-auth-funwallet-connector'
    name = 'Magic Auth Fun Wallet Connector'

    constructor({ chains, options }) {
        super({ chains, options })
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

    async getAuth() {

    }

    async connect() {
        
        await this.connectFunWallet()
    }

    async connectFunWallet() {
        if (!this.apiKey || !this.chain) {
            throw new Error("missing apiKey and chainId")
        }

        await configureEnvironment({chain: chainId, apiKey: this.apiKey})

        if (!this.auth) {
            this.auth = await this.getAuth()
        }

        const uniqueId = this.uniqueId ? this.uniqueId : await this.auth.getUniqueId()
        this.uniqueId = uniqueId

        this.wallet = new FunWallet({ uniqueId, index: this.index })
    }

    async disconnect() {
        await super.disconnect()
        const magic = this.getMagic()
        await magic.user.logout()
    }

    async getProvider(chainId=this.chain) {
        const magic = this.getMagic(chainId)
        return new ethers.providers.Web3Provider(magic?.rpcProvider)
    }

    async getSigner() {
        if (!this.auth) {
            this.auth = await this.getAuth()
        }
        return await this.auth?.getSigner()
    }

    async switchChain(chainId) {
        const id = normalizeChainId(chainId)
        await this.getMagic(id, true)
        return await super.switchChain(chainId)   
    }

    async isAuthorized() {
        try {
            const account = await this.getAccount()
            return !!account
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