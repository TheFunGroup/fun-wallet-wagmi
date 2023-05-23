import { Connector, ConnectorData, Chain as Chain$1 } from '@wagmi/core'
import { OAuthExtension } from '@magic-ext/oauth';
import { ethers } from 'ethers';
import { getAddress } from 'ethers/lib/utils';
import { Magic } from 'magic-sdk';
import { normalizeChainId } from '../../../util';
const IS_SERVER = typeof window === 'undefined'


export type Address = `0x${string}`

export type contructorInputType = {chains: Chain$1[], options: any}

export class MagicAuthSocialLoginConnector extends Connector {
    // MagicAuthSocialLoginConnector Types
    chainId: number
    magicAuthApiKey: string
    oAuthProvider: string
    redirectURI: string
    magic: any // TODO figur eout the proper type from the magic SDK despite it not being exported InstanceWithExtensions<SDKBase, OAuthExtension[]>


    ready = !IS_SERVER
    id = 'social-login-connector'
    name = 'Social Login Connector'

    constructor({ chains, options }: contructorInputType) {
        super({chains, options})
        this.chainId = options.chainId
        this.magicAuthApiKey = options.magicAuthApiKey || 'pk_live_846F1095F0E1303C'
        this.oAuthProvider = options.oAuthProvider || 'magicAuth'
        this.redirectURI = options.redirectURI || window.location.href
    }

    getMagic(chainId=Number(this.chainId), force=false) {
        if (force || !this.magic) {
            const chain = this.chains.find((x) => x.id === chainId);
            if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
            this.magic = new Magic(this.magicAuthApiKey, {
                network: {
                    chainId: chainId,
                    rpcUrl: chain?.rpcUrls.default?.http[0]
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

    async connect(config?: { chainId?: number | undefined; } | undefined):Promise<Required<ConnectorData>> {
        const provider = await this.getProvider(config)
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
                provider, // TODO is this used anywhere?
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
        return {
            account: `0x0000`,
            chain: {id: 0, unsupported: true},
        }
    }

    async disconnect() {
        const magic = this.getMagic()
        await magic.user.logout()
    }

    async getAccount(): Promise<`0x${string}`> {
        const signer = await this.getSigner()
        const account = await signer.getAddress()
        if (account.startsWith('0x')) {
            return account
        } else {
            return '0x' + account
        }
    }

    // TODO: figure out how to get the chainId from the magic SDK or from ethers or from funWallet
    async getChainId(): Promise<number> {
        return normalizeChainId(this.chainId)
    }


    async getProvider(config?: { chainId?: number | undefined; } | undefined) {
        const chainId = config?.chainId || Number(this.chainId)
        const magic = this.getMagic(chainId)
        return new ethers.providers.Web3Provider(magic?.rpcProvider)
    }

    async getSigner(chainId=this.chainId) {
        const provider = await this.getProvider(chainId)
        return provider.getSigner()
    }

    async switchChain(chainId: number): Promise<Chain$1> {
        const id = normalizeChainId(chainId)
        this.chainId = id
        const chain = this.chains.find((x) => x.id === chainId);
        if (!chain) throw new Error(`Unsupported chainId: ${chainId}`);
        
        await this.getMagic(this.chainId, true)
        this.emit("change", { chain: { id: this.chainId, unsupported: false } });
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

    onAccountsChanged(accounts: Address[]) {
        if (accounts.length === 0) {
            this.emit('disconnect')
        } else {
            this.emit('change', {account: getAddress(accounts[0]) as Address })
        }
    }

    onChainChanged(chainId: number | string | bigint) {
        const id = normalizeChainId(chainId)
        const unsupported = this.isChainUnsupported(id)
        this.emit('change', { chain: { id, unsupported } })
    }

    onDisconnect() {
        this.emit('disconnect')
    }

    // This method implements Viem and returns the WalletClient type from viem
    override getWalletClient(): never {
        throw new Error('Method not implemented.');
    }
}