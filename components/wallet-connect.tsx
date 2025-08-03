"use client";

import { ConnectWallet, useConnectionStatus } from "@thirdweb-dev/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WalletConnectButton() {
  const router = useRouter();
  const connectionStatus = useConnectionStatus();

  useEffect(() => {
    if (connectionStatus === "connected") {
      // Add a small delay to ensure the UI updates before navigation
      const timer = setTimeout(() => {
        router.push("/home");
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [connectionStatus, router]);

  return (
    <div className="w-full flex justify-center">
      <ConnectWallet
        theme="dark"
        btnTitle="Connect Wallet"
        className="!bg-gradient-to-r from-blue-500/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-600 !border-0 backdrop-blur-sm !text-white font-light !py-4 !px-8 !rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
      />
    </div>
  );
}
