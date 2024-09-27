import { ethers } from 'ethers';
import { useEffect } from 'react';

const Navigation = ({ account, setAccount }) => {

  // Check if MetaMask is installed
  const checkIfMetaMaskInstalled = () => {
    if (typeof window.ethereum === 'undefined') {
      console.error("MetaMask is not installed.");
      return false;
    }
    return true;
  };

  const connectHandler = async () => {
    try {
      if (!checkIfMetaMaskInstalled()) {
        alert("Please install MetaMask to connect your wallet.");
        return;
      }

      // Request account access from MetaMask
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      // Validate the first account returned
      const account = ethers.utils.getAddress(accounts[0]);

      // Set account in the state
      setAccount(account);
      console.log(`Connected account: ${account}`);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
      alert("Failed to connect to wallet. Please try again.");
    }
  };

  useEffect(() => {
    if (!checkIfMetaMaskInstalled()) return;

    // Listen for account changes (user changes wallet account in MetaMask)
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length > 0) {
        const account = ethers.utils.getAddress(accounts[0]);
        setAccount(account);
        console.log(`Account changed to: ${account}`);
      } else {
        setAccount(null); // No account connected
      }
    });

    // Listen for network changes (user changes network in MetaMask)
    window.ethereum.on('chainChanged', (chainId) => {
      console.log(`Network changed to: ${chainId}`);
      window.location.reload(); // Reload the page to reflect network change
    });

    return () => {
      // Cleanup event listeners on unmount
      window.ethereum.removeListener('accountsChanged', () => { });
      window.ethereum.removeListener('chainChanged', () => { });
    };
  }, [setAccount]);

  return (
    <nav>
      <div className='nav__brand'>
        <h1>Discord</h1>
      </div>

      {account ? (
        <button
          type="button"
          className='nav__connect'
        >
          {account.slice(0, 6) + '...' + account.slice(38, 42)}
        </button>
      ) : (
        <button
          type="button"
          className='nav__connect'
          onClick={connectHandler}
        >
          Connect
        </button>
      )}
    </nav>
  );
};

export default Navigation;
