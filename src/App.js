import logo from './logo.svg';
import './App.css';
import {PeraWalletConnect} from '@perawallet/connect';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import { useEffect, useState } from 'react';

// Create the PeraWalletConnect instance outside the component
const peraWallet = new PeraWalletConnect();

function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    // reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    })
  },[]);
  
  return (
    <Container>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Button
      onClick={
        isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick
      }>
      {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
    </Button>
          AlgoHUB - Lab 2
      </header>
    </Container>
  );

  function handleConnectWalletClick() {
    peraWallet.connect().then((newAccounts) => {
      // setup the disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      setAccountAddress(newAccounts[0]);
    });
  }

    function handleDisconnectWalletClick() {
      peraWallet.disconnect();
      setAccountAddress(null);
    }
}

export default App;
