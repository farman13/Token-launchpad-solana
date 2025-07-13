import { createAssociatedTokenAccountInstruction, createInitializeMetadataPointerInstruction, createInitializeMintInstruction, createMintToInstruction, ExtensionType, getAssociatedTokenAddressSync, getMintLen, LENGTH_SIZE, TOKEN_2022_PROGRAM_ID, TYPE_SIZE } from "@solana/spl-token";
import { createInitializeInstruction, pack } from "@solana/spl-token-metadata";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, } from "@solana/web3.js";
import { useRef } from "react";

export function TokenLaunchpad() {

    const nameRef = useRef();
    const symbolRef = useRef();
    const imageRef = useRef();
    const supplyRef = useRef();

    const { connection } = useConnection();
    const wallet = useWallet();

    const createToken = async () => {

        const name = nameRef.current.value;
        const symbol = symbolRef.current.value;
        const imageurl = imageRef.current.value;
        const supply = supplyRef.current.value * LAMPORTS_PER_SOL;

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
            createInitializeMintInstruction(keypair.publicKey, 9, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
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

    }
    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-4">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">Solana Token Launchpad</h1>

            <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={nameRef}
            />

            <input
                type="text"
                placeholder="Symbol"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={symbolRef}
            />

            <input
                type="text"
                placeholder="Image URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={imageRef}
            />

            <input
                type="text"
                placeholder="Initial Supply"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                ref={supplyRef}
            />

            <button
                className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                onClick={createToken}
            >
                Create a token
            </button>
        </div>
    );
}

