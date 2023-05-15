import './App.css';
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { mainnet, goerli, polygon, bsc } from 'wagmi/chains'
import { publicProvider } from 'wagmi/providers/public'
import { GoogleLoginConnector } from './GoogleLoginConnector';
import { TwitterLoginConnector } from './TwitterLoginConnector';
import { DiscordLoginConnector } from './DiscordLoginConnector';
import { AppleLoginConnector } from './AppleLoginConnector';
import Connect from './components/connect';

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet, goerli, polygon, bsc],
  [
    publicProvider()
  ],
)

const client = createClient({
  autoConnect: true,
  connectors: [
    new GoogleLoginConnector({
      chains,
      options: {
        chainId: 5
      },
    }),
    new TwitterLoginConnector({
      chains,
      options: {
        chainId: 5
      },
    }),
    new DiscordLoginConnector({
      chains,
      options: {
        chainId: 5
      },
    }),
    new AppleLoginConnector({
      chains,
      options: {
        chainId: 5
      },
    }),
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
