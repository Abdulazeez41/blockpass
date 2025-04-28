"use client"; // Ensure this runs only on the client side

import React, { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { useRouter } from "next/router";

export default function ConnectWalletModal() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setOpen(false);
          router.reload(); // Reload the page to update the connection status
        }
      } catch (error) {
        console.error("Error connecting to MetaMask:", error);
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const handleClose = () => {
    setOpen(false);
    router.push("/"); // Use Next.js router to navigate
  };

  return (
    <Dialog open={open} onClose={handleClose} className="relative z-10">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black bg-opacity-30"
      />
      
      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full"
          >
            <DialogTitle as="h3" className="text-lg leading-6 font-medium text-gray-900">
              Connect Wallet
            </DialogTitle>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Please connect your MetaMask wallet to continue.
              </p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                onClick={handleConnect}
              >
                Connect MetaMask
              </button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
}
