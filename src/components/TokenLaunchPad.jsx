import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, } from "@solana/web3.js";
import { useRef, useState } from "react";
import toast from 'react-hot-toast';


export function TokenLaunchpad() {

    const [token, setToken] = useState();

    const nameRef = useRef();
    const symbolRef = useRef();
    const imageRef = useRef();
    const supplyRef = useRef();

    const { connection } = useConnection();
    const wallet = useWallet();

    const createToken = async () => {

        const toastId = toast.loading("Creating token...");

        const name = nameRef.current.value;
        const symbol = symbolRef.current.value;
        const imageurl = imageRef.current.value;
        const supply = supplyRef.current.value * LAMPORTS_PER_SOL;

        try {
            const keypair = Keypair.generate()

            const metadata = {
                mint: keypair.publicKey,
                name: name,
                symbol: symbol,
                uri: imageurl,
                additionalMetadata: [],
            }

            const mintLen = getMintLen([ExtensionType.MetadataPointer]);
            const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

            const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);

            const transaction = new Transaction().add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: keypair.publicKey,
                    space: mintLen,
                    lamports,
                    programId: TOKEN_2022_PROGRAM_ID,
                }),
                createInitializeMetadataPointerInstruction(keypair.publicKey, wallet.publicKey, keypair.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeMintInstruction(keypair.publicKey, 9, wallet.publicKey, wallet.publicKey, TOKEN_2022_PROGRAM_ID),
                createInitializeInstruction({
                    programId: TOKEN_2022_PROGRAM_ID,
                    mint: keypair.publicKey,
                    metadata: keypair.publicKey,
                    name: metadata.name,
                    symbol: metadata.symbol,
                    uri: metadata.uri,
                    mintAuthority: wallet.publicKey,
                    updateAuthority: wallet.publicKey
                })
            );

            //console.log(wallet.publicKey);
            transaction.feePayer = wallet.publicKey;
            transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

            transaction.partialSign(keypair);

            const signature = await wallet.sendTransaction(transaction, connection);
            console.log(signature);
            console.log("Mint Account created !! ", keypair.publicKey.toBase58());

            const associatedToken = getAssociatedTokenAddressSync(
                keypair.publicKey,
                wallet.publicKey,
                false,
                TOKEN_2022_PROGRAM_ID
            );

            console.log(associatedToken.toBase58());

            const transaction2 = new Transaction().add(
                createAssociatedTokenAccountInstruction(
                    wallet.publicKey,
                    associatedToken,
                    wallet.publicKey,
                    keypair.publicKey,
                    TOKEN_2022_PROGRAM_ID
                ),
            );

            await wallet.sendTransaction(transaction2, connection);

            const transaction3 = new Transaction().add(
                createMintToInstruction(keypair.publicKey, associatedToken, wallet.publicKey, supply, [], TOKEN_2022_PROGRAM_ID)
            );

            await wallet.sendTransaction(transaction3, connection);
            console.log("Token Minted !")
            setToken(keypair.publicKey.toBase58());
            toast.success("Token created and minted successfully!", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Token creation failed!", { id: toastId });
        }
    }
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#000000] via-[#16081d] to-[#000000] px-4 space-y-2">
            <img
                src="/solana-banner.png"
                alt="Solana Banner"
                className="w-full object-cover"
            />
            <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl space-y-6">
                <h1 className="text-3xl font-bold text-center text-white">Solana Token Launchpad</h1>

                <input type="text" placeholder="Name" className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9945FF]" ref={nameRef} />
                <input type="text" placeholder="Symbol" className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9945FF]" ref={symbolRef} />
                <input type="text" placeholder="Image URL" className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9945FF]" ref={imageRef} />
                <input type="text" placeholder="Initial Supply" className="w-full bg-white/10 text-white placeholder-gray-400 px-4 py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9945FF]" ref={supplyRef} />

                <button onClick={createToken} className="w-full bg-[#9945FF] hover:bg-[#7e34d3] text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md cursor-pointer">
                    Create a token
                </button>
            </div>

            {token && (
                <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm shadow-lg space-y-2 mb-2">
                    <div className="font-semibold text-[#94a3b8]">✅ Token Created</div>
                    <div className="truncate">
                        <span className="text-[#cbd5e1]">Token Address:</span><br />
                        <a href={`https://explorer.solana.com/address/${token}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="text-[#7dd3fc] hover:underline break-all">
                            {token}
                        </a>
                    </div>
                    <div className="text-[#cbd5e1]">
                        Initial Supply: <span className="font-mono">{supplyRef.current.value}</span> tokens
                    </div>
                </div>
            )}
        </div>
    );
}

