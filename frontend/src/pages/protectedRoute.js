"use client"; // Ensure it runs on the client side

import React, { useEffect, useState } from "react";
import ConnectWalletModal from "@/components/ConnectWalletModal";
import { useRouter } from "next/router";

const ProtectedRoute = ({ children }) => {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [account, setAccount] = useState(null);

  useEffect(() => {
    setIsClient(true);

    const checkMetaMaskConnection = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setIsWalletConnected(true);
          } else {
            router.push("/"); // Redirect to home if no wallet connected
          }
        } catch (error) {
          console.error("Error checking MetaMask connection:", error);
          router.push("/"); // Redirect to home if an error occurs
        }
      } else {
        console.error("MetaMask is not installed");
        router.push("/"); // Redirect to home if MetaMask is not installed
      }
    };

    checkMetaMaskConnection();
  }, [router]);

  if (!isClient) return null;

  if (!isWalletConnected) {
    return <ConnectWalletModal />;
  }

  return children;
};

export default ProtectedRoute;
