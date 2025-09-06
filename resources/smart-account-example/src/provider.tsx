import { WEB3AUTH_NETWORK, type Web3AuthOptions } from "@web3auth/modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { type ReactNode } from "react";
import { Web3AuthProvider } from "@web3auth/modal/react";

const clientId = "BJFT2n2Nc-2HY9yJCacDygMvuJQc8do8bF7GMWig2KiZgJJ5ks-Hiw_JvcJvqiJ5yYTkRptfwoeQFkqJZAG65do"; // get from https://dashboard.web3auth.io

const web3AuthOptions: Web3AuthOptions = {
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
};

const web3authConfig = {
  web3AuthOptions,
};

const queryClient = new QueryClient();

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Web3AuthProvider config={web3authConfig}>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider>
        {children}
      </WagmiProvider>
    </QueryClientProvider>
  </Web3AuthProvider>
  );
}