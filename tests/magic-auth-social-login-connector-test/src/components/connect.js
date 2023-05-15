import { useAccount, useConnect, useDisconnect, useProvider, useNetwork, useSwitchNetwork } from 'wagmi'
import { useEffect } from "react";

const Connect = () => {
    const { connector, isConnected } = useAccount()
    const { address } = useAccount()
    const { chain, chains } = useNetwork()
    const wagmiProvider = useProvider()
    const { switchNetwork } = useSwitchNetwork()
    const { connect, connectors, error, isLoading, pendingConnector } = useConnect()
    const { disconnect } = useDisconnect()

    useEffect(() => {
        async function connectEOA() {
            console.log("Connect.js account", address)
            console.log("Connect.js chainId", chain, chains)
            console.log("Connect.js provider", wagmiProvider)
            console.log("Connect.js connector.signer", await connector.getSigner())
            switchNetwork(1)
        }
        if (isConnected && address) {
            connectEOA()
        }
    }, [isConnected, address])
    
    useEffect(() => { 
        if (chain) {
            console.log("Current ChainId: ", chain)
        }
    }, [chain])

    if (isConnected && address) {
        return (
            <div>
                <div>The wallet is connected at: {address}</div>
                <button onClick={disconnect}>Disconnect</button>
            </div>
        )
    }

    return (
        <div>
            {connectors.map((connector) => (
                <button
                    disabled={!connector.ready}
                    key={connector.id}
                    onClick={() => { connect({ connector }) }}
                >
                    {connector.name}
                    {!connector.ready && ' (unsupported)'}
                    {isLoading &&
                        connector.id === pendingConnector?.id &&
                        ' (connecting)'}
                </button>
            ))}

            {error && <div>{error.message}</div>}
        </div>
    )
}

export default Connect;