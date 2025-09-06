/* eslint-disable no-console */
import "./App.css";
import { useEnableMFA, useManageMFA, useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser } from "@web3auth/modal/react";
import { WALLET_CONNECTORS, AUTH_CONNECTION } from "@web3auth/modal";
import { useAccount } from "wagmi";
import { SendTransaction } from "./components/sendTransaction";
import { Balance } from "./components/getBalance";
import { SwitchChain } from "./components/switchNetwork";

function App() {
  const { connectTo, isConnected, connectorName } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { userInfo } = useWeb3AuthUser();
  const { address } = useAccount();
  const { manageMFA, loading: manageMFALoading, error: manageMFAError } = useManageMFA();
  const { enableMFA, loading: enableMFALoading, error: enableMFAError } = useEnableMFA();

  const loginWithAuth0 = async () => {
    await connectTo(WALLET_CONNECTORS.AUTH, {
      authConnection: AUTH_CONNECTION.CUSTOM,
      authConnectionId: "w3a-auth0-demo",
    });
  };

  function uiConsole(...args: any[]): void {
    const el = document.querySelector("#console>p");
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2);
      console.log(...args);
    }
  }

  const loggedInView = (
    <>
      <h2>Connected to {connectorName}</h2>
      <div>{address}</div>
      <div className="flex-container"> 
        <div>
          <button onClick={() => uiConsole(userInfo)} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={() => disconnect()} className="card">
            Log Out
          </button>
        </div>
        <div>
          <button onClick={() => enableMFA()} className="card">
            Enable MFA
          </button>
          {enableMFALoading && <div className="loading">Enabling MFA...</div>}
          {enableMFAError && <div className="error">{enableMFAError.message}</div>}
        </div>
        <div>
          <button onClick={() => manageMFA()} className="card">
            Manage MFA
          </button>
          {manageMFALoading && <div className="loading">Managing MFA...</div>}
          {manageMFAError && <div className="error">{manageMFAError.message}</div>}
        </div>
      </div>
      
      <SendTransaction />
      <Balance />
      <SwitchChain />
    </>
  );

  const unloggedInView = (
    <div className="flex-container">
      <button onClick={loginWithAuth0} className="card">
        Login with Auth0
      </button>
    </div>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/no-modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        & React No Modal with Auth0
      </h1>

      <div className="grid">{isConnected ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-examples/tree/main/custom-authentication/single-connection/auth0-implicit-example"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  );
}

export default App;
