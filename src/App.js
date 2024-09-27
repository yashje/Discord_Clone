import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { io } from "socket.io-client";

// Components
import Navigation from './components/Navigation';
import Servers from './components/Servers';
import Channels from './components/Channels';
import Messages from './components/Messages';

// ABIs
import discordABI from './abis/discord.json';

// Config
import config from './config.json';

// Socket
const socket = io('ws://localhost:3030');

function App() {
  // React states
  const [provider, setProvider] = useState(null); // Blockchain provider
  const [account, setAccount] = useState(null); // User's wallet account
  const [discord, setDiscord] = useState(null); // Dappcord contract instance
  const [channels, setChannels] = useState([]); // List of channels
  const [currentChannel, setCurrentChannel] = useState(null); // Current selected channel
  const [messages, setMessages] = useState([]); // Messages in the current channel

  // Function to initialize blockchain data
  const loadBlockchainData = async () => {
    try {
      // Check if MetaMask or other provider is installed
      if (!window.ethereum) {
        alert("MetaMask is required to use this application. Please install it.");
        return;
      }

      // Create provider and set it in state
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);

      // Get network info
      const network = await provider.getNetwork();
      const chainId = network.chainId;

      if (!config[chainId]) {
        alert("Unsupported network. Please switch to the appropriate network.");
        return;
      }

      // Initialize contract instance
      const Discord = new ethers.Contract(config[chainId].discordClone.address, discordABI, provider);
      setDiscord(Discord);

      // Fetch channels from contract
      const totalChannels = await Discord.totalChannels();
      const fetchedChannels = [];

      for (let i = 1; i <= totalChannels.toNumber(); i++) {
        const channel = await Discord.getChannel(i);
        fetchedChannels.push(channel);
      }

      setChannels(fetchedChannels);

      // Handle account changes
      window.ethereum.on('accountsChanged', handleAccountChange);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
      alert("Failed to load blockchain data. Make sure you're connected to the correct network.");
    }
  };

  // Function to handle account change
  const handleAccountChange = () => {
    window.location.reload();
  };

  // Function to handle socket connections
  const setupSocketListeners = () => {
    socket.on("connect", () => {
      console.log("Socket connected.");
      socket.emit('get messages');
    });

    socket.on('new message', (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    socket.on('get messages', (fetchedMessages) => {
      setMessages(fetchedMessages);
    });

    return () => {
      socket.off('connect');
      socket.off('new message');
      socket.off('get messages');
    };
  };

  // useEffect to initialize data and socket listeners
  useEffect(() => {
    loadBlockchainData();
    const cleanupSocket = setupSocketListeners();

    return cleanupSocket; // Cleanup function to remove listeners on unmount
  }, []);

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <main>
        <Servers />
        <Channels
          provider={provider}
          account={account}
          discord={discord}
          channels={channels}
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
          setAccount={setAccount}
        />
        <Messages
          account={account}
          messages={messages}
          currentChannel={currentChannel}
        />
      </main>
    </div>
  );
}

export default App;
