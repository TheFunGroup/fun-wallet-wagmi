import { Connector, normalizeChainId } from '@wagmi/core';
import { FunWallet, configureEnvironment } from 'fun-wallet';

const IS_SERVER = typeof window === 'undefined'

export class FunWalletConnector extends Connector {
    ready = !IS_SERVER
    id = 'fun-wallet-connector'
    name = 'Fun Wallet Connector'

    constructor({ chains, options }) {
        super({ chains, options })
        this.chain = options.chainId
        this.auth = null // this.auth should be an object of fun-wallet/auth/Auth.js
        this.apiKey = options.apiKey
        this.uniqueId = options.uniqueId
        this.index = options.index
    }

    async getAuth() {
    }

    async connect() {
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
        this.auth = null
        this.wallet = null
    }

    async getAccount() {
        if (this.wallet) {
            await this.wallet.getAddress()
        }
        return null
    }

    async getChainId() {
        return normalizeChainId(this.chain)
    }

    async getSigner() {
        if (!this.auth) {
            this.auth = await this.getAuth()
        }
        return await this.auth?.getSigner()
    }

    async switchChain(chainId) {
        const id = normalizeChainId(chainId)
        this.chain = id
        const chain = this.chains.find((x) => x.id === chainId);
        if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
        await configureEnvironment({chain: chainId})

        this.emit("change", { chain: { id: this.chain, unsupported: false } });
        return chain
    }

    async isAuthorized() {
        try {
            const account = await this.getAccount()
            return !!account
        } catch {
            return false
        }
    }
}