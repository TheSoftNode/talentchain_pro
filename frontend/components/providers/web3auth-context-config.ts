// Web3Auth configuration file following official multichain pattern  
import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

// Get client ID from environment
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

if (!clientId) {
  throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required in environment variables");
}

// Web3Auth configuration for true multichain support
// Based on the official multi-chain example
const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    ssr: false,
    // NO chainConfig - this allows Web3Auth to handle multiple chains
    // and enables external wallet connectors to work properly
    uiConfig: {
      appName: "TalentChain Pro",
      mode: "light",
      logoLight: "https://web3auth.io/images/w3a-L-Favicon-1.svg",
      logoDark: "https://web3auth.io/images/w3a-D-Favicon-1.svg",
      defaultLanguage: "en",
      theme: {
        primary: "#768729",
      },
      loginMethodsOrder: [
        "google", "facebook", "twitter", "discord", "email_passwordless",
        "metamask", "wallet_connect_v2"
      ],
      primaryButton: "socialLogin",
    },
  },
};

export default web3AuthContextConfig;