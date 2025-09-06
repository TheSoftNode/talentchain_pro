import { WEB3AUTH_NETWORK } from "@web3auth/modal";
import { type Web3AuthContextConfig } from "@web3auth/modal/react";

// Get client ID from environment
const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID;

if (!clientId) {
  throw new Error("NEXT_PUBLIC_WEB3AUTH_CLIENT_ID is required in environment variables");
}


const web3AuthContextConfig: Web3AuthContextConfig = {
  web3AuthOptions: {
    clientId,
    web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
    ssr: false, 
    sessionTime: 86400, // 24 hours in seconds for session persistence
    
    uiConfig: {
      appName: "TalentChain Pro",
      mode: "dark",
      logoLight: "/talentchainpro.png",
      logoDark: "/talentchainpro.png",
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
};export default web3AuthContextConfig;