import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';

export const Config = ({ children }) => {
    return (
        <ConnectionProvider endpoint={"https://solana-devnet.g.alchemy.com/v2/VmEzDYFo0IS8z1keY_Yc2gapqpBjpHLc"}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};

