import { getAddress } from 'ethers/lib/utils';
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
        this.wallet = null
        this.apiKey = options.apiKey
        this.uniqueId = options.uniqueId
        this.index = options.index ? options.index : 0
    }

    async getAuth() {
    }

    async connect() {
        const provider = await this.getProvider()
        if (provider.on) {
            provider.on('accountsChanged', this.onAccountsChanged)
            provider.on('chainChanged', this.onChainChanged)
            provider.on('disconnect', this.onDisconnect)
        }

        this.emit("message", { type: "connecting" });

        const chainId = await this.getChainId()
        
        if (await this.isAuthorized()) {
            return {
                account: await this.getAccount(),
                chain: {
                    id: chainId,
                    unsupported: false,
                },
                provider
            }
        }

        if (!this.apiKey || !this.chain) {
            throw new Error("missing apiKey and chainId")
        }

        this.wallet = await this.getFunWallet()

        return {
            account: await this.getAccount(),
            chain: {
                id: chainId,
                unsupported: false,
            },
            provider
        }
    }

    async getFunWallet(chainId=this.chain, force=false) {
        if (force || !this.wallet) {
            try {
                await configureEnvironment({chain: chainId, apiKey: this.apiKey})
                console.log("before get auth")
                this.auth = await this.getAuth()
                if (!this.auth) {
                    throw new Error("missing auth")
                }
                console.log("after get auth", this.auth)

                console.log("within getFunWallet, this.auth: ", this.auth)
        
                const uniqueId = this.uniqueId ? this.uniqueId : await this.auth.getUniqueId()
                this.uniqueId = uniqueId

                console.log("within getFunWallet, this.uniqueId: ", this.uniqueId)
        
                this.wallet = new FunWallet({ uniqueId, index: this.index })
            } catch (error) {
                throw new Error("Connect Fun Wallet Failed" + error)
            }
        }

        return this.wallet
    }

    async disconnect() {
        this.auth = null
        this.wallet = null
    }

    async getAccount() {
        const wallet = await this.getFunWallet()
        if (wallet) {
            return await wallet.getAddress()
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