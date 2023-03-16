import './App.css';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk, { waitForConfirmation } from 'algosdk';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useEffect, useState } from 'react';

// Create the PeraWalletConnect instance outside the component
const peraWallet = new PeraWalletConnect();

// The app ID on testnet
const appIndex = 122184273;

// connect to the algorand node
const algod = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);

function App() {
  const [accountAddress, setAccountAddress] = useState(null);
  const [currentCount, setCurrentCount] = useState(null);
  const isConnectedToPeraWallet = !!accountAddress;

  useEffect(() => {
    checkCounterState();
    // reconnect to session when the component is mounted
    peraWallet.reconnectSession().then((accounts) => {
      // Setup disconnect event listener
      peraWallet.connector?.on('disconnect', handleDisconnectWalletClick);

      if (accounts.length) {
        setAccountAddress(accounts[0]);
      }
    })

  }, []);

  return (
    <Container className='App-header'>
      <meta name="name" content="Your name here" />
      <h1> AlgoHUB - Lab 2</h1>
      <Row>
        <Col><Button className="btn-wallet"
          onClick={
            isConnectedToPeraWallet ? handleDisconnectWalletClick : handleConnectWalletClick
          }>
          {isConnectedToPeraWallet ? "Disconnect" : "Connect to Pera Wallet"}
        </Button></Col>
      </Row>


      <Container>
        <Row>
          <Col><Button className="btn-add"
            onClick={
              () => callCounterApplication('Add')
            }>
            Increase
          </Button></Col>
          <Col>
            <h3>Count</h3>
            <span className='counter-text'>{currentCount}</span>
          </Col>
          <Col><Button className="btn-dec"
            onClick={() => callCounterApplication('Deduct')}>
            Decrease
          </Button></Col>
        </Row>
      </Container>
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

  async function checkCounterState() {
    try {
      const counter = await algod.getApplicationByID(appIndex).do();
      if (!!counter.params['global-state'][0].value.uint) {
        setCurrentCount(counter.params['global-state'][0].value.uint);
      } else {
        setCurrentCount(0);
      }
    } catch (e) {
      console.error('There was an error connecting to the algorand node: ', e)
    }
  }

  async function callCounterApplication(action) {
    try {
      // get suggested params
      const suggestedParams = await algod.getTransactionParams().do();
      const appArgs = [new Uint8Array(Buffer.from(action))];

      const actionTx = algosdk.makeApplicationNoOpTxn(
        accountAddress,
        suggestedParams,
        appIndex,
        appArgs
      );

      const actionTxGroup = [{ txn: actionTx, signers: [accountAddress] }];

      const signedTx = await peraWallet.signTransaction([actionTxGroup]);
      console.log(signedTx);
      const { txId } = await algod.sendRawTransaction(signedTx).do();
      const result = await waitForConfirmation(algod, txId, 2);
      checkCounterState();

    } catch (e) {
      console.error(`There was an error calling the counter app: ${e}`);
    }
  }
}

export default App;
