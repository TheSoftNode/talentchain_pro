import "./App.css";
import { useWeb3AuthConnect, useWeb3AuthDisconnect, useWeb3AuthUser} from "@web3auth/modal/react";
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

  const loginWithGoogle = async () => {
    await connectTo(WALLET_CONNECTORS.AUTH, {
      groupedAuthConnectionId: "aggregate-sapphire",
      authConnectionId: "w3a-google",
      authConnection: AUTH_CONNECTION.GOOGLE,
    });
  };

  const loginWithAuth0Google = async () => {
    await connectTo(WALLET_CONNECTORS.AUTH, {
      groupedAuthConnectionId: "aggregate-sapphire",
      authConnectionId: "w3a-a0-github",
      authConnection: AUTH_CONNECTION.CUSTOM,
      extraLoginOptions: {
        connection: "google-oauth2",
      },
    });
  };

  const loginWithAuth0GitHub = async () => {
    await connectTo(WALLET_CONNECTORS.AUTH, {
      groupedAuthConnectionId: "aggregate-sapphire",
      authConnectionId: "w3a-a0-github",
      authConnection: AUTH_CONNECTION.CUSTOM,
      extraLoginOptions: {
        connection: "github",
      },
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
      </div>
      <SendTransaction />
      <Balance />
      <SwitchChain />
    </>
  );

  const unloggedInView = (
    <div className="flex-container">
      <button onClick={loginWithGoogle} className="card">
        Login with Google
      </button>
      <button onClick={loginWithAuth0Google} className="card">
        Login with Auth0 Google
      </button>
      <button onClick={loginWithAuth0GitHub} className="card">
        Login with Auth0 GitHub
      </button>
    </div>
  );

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="https://web3auth.io/docs/sdk/pnp/web/no-modal" rel="noreferrer">
          Web3Auth{" "}
        </a>
        & React No Modal with Auth0 & Google Grouped Connection
      </h1>

      <div className="grid">{isConnected ? loggedInView : unloggedInView}</div>
      <div id="console" style={{ whiteSpace: "pre-line" }}>
        <p style={{ whiteSpace: "pre-line" }}></p>
      </div>

      <footer className="footer">
        <a
          href="https://github.com/Web3Auth/web3auth-examples/tree/main/web-no-modal-sdk/custom-authentication/grouped-connection/auth0-google-implicit-grouped-no-modal-example"
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
