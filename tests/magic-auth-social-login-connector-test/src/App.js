import './App.css';
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { mainnet, goerli, polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { GoogleLoginFunWalletConnector } from './GoogleLoginFunWalletConnector'
import Connect from './components/connect';

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, polygon, bsc],
  [
    publicProvider()
  ],
)

const client = createClient({
  autoConnect: false,
  connectors: [
    new GoogleLoginFunWalletConnector({
      chains,
      options: {
        chainId: 5,
        apiKey: 'MYny3w7xJh6PRlRgkJ9604sHouY2MTke6lCPpSHq',
      },
    }),
    // new MetaMaskConnector({ chains })
  ],
  provider,
  webSocketProvider,
})

function App() {

  return (
    <WagmiConfig client={client}>
        <Connect />
    </WagmiConfig>
  );
}

export default App;
