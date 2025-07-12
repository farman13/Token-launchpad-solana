import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const ConnectButton = () => {
    return (
        <div className="absolute top-4 right-4 flex space-x-2 z-50">
            <WalletMultiButton />
            <WalletDisconnectButton />
        </div>
    );
};

