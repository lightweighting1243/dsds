import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

export const getWalletBalance = async (walletAddress: string): Promise<number | null> => {
  try {
    const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=828db138-8f74-4b26-9b05-65f10c27958f", "confirmed");

    const publicKey = new PublicKey(walletAddress);

    const balanceInLamports = await connection.getBalance(publicKey);

    const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;

    return balanceInSOL;
  } catch (error) {
    console.error("Error getting wallet balance:", error);
    return null;
  }
};
