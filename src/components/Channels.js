import { ethers } from 'ethers';

const Channels = ({ provider, setAccount, account, discord, channels, currentChannel, setCurrentChannel }) => {
  const channelHandler = async (channel) => {
    try {
      if (account) {
        // Check if the user has joined the channel
        const hasJoined = await discord.hasJoined(channel.id.toString(), account);

        if (hasJoined) {
          setCurrentChannel(channel.id);  // Set by ID, not converting to string
        } else {
          const signer = provider.getSigner();
          const transaction = await discord.connect(signer).mint(channel.id, { value: channel.cost });
          await transaction.wait();
          setCurrentChannel(channel.id);
        }
      } else {
        // Request account from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Validate the first account returned
        const validAccount = ethers.utils.getAddress(accounts[0]);

        // Set account in state
        setAccount(validAccount);
      }
    } catch (error) {
      console.error("Error in channelHandler:", error);
    }
  };

  return (
    <div className="channels">
      <div className="channels__text">
        <h2>Text Channels</h2>
        <ul>
          {channels.map((channel, index) => (
            <li
              onClick={() => channelHandler(channel)}
              key={index}
              className={currentChannel === channel.id ? "active" : ""}
            >
              {channel.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="channels__voice">
        <h2>Voice Channels</h2>
        <ul>
          <li>Channel 1</li>
          <li>Channel 2</li>
          <li>Channel 3</li>
        </ul>
      </div>
    </div>
  );
};

export default Channels;
