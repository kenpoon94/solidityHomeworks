// Use this script to cast a vote on a proposal in the TokenizedBallot smart contract
// First command line argument - TokenizedBallot contract address
// Second command line argument - Proposal number sender wants to vote for

// This script self delegates voting power for a given account 
// usage: yarn run ts-node --files <*SelfDelegateMyVote.ts> <MyToken contract address> <account address for which to self-delegate voting power>

import { ethers } from "ethers";
import { MyToken__factory } from "../typechain-types";
import * as dotenv from "dotenv";

// Read the environment into this script
dotenv.config();

// Main function for this script
// Usage: yarn hardhat run MintTokens.ts <contractAddress> <etherAmount> <tokenAddress> 
async function main() {
    // Parse the proposals from command line arguments
    const contractAdress = process.argv[2];
    const tokensAddress = process.argv[4];
    console.log(`Self delegate voting power of account ${tokensAddress} for smart contract at ${contractAdress}...\n`);
    
    // set up a Provider
    const provider = ethers.getDefaultProvider("goerli", process.env.ALCHEMY_API_KEY ?? "");
    const network = await provider.getNetwork();
    
    // connect Wallet to the Provider
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_ENCODE_BC ?? "");
    const signer = wallet.connect(provider);
    const balance = await signer.getBalance();
    console.log(`Connected to the provider ${network.name} with wallet ${signer.address} and a balance of ${balance}\n`);
    if(balance.eq(0)) throw new Error("Cannot buy tokens with zero balance in the account\n");

    // connect to  MyToken smart contract factory
    const tokenContractFactory = new MyToken__factory(signer);
    const tokenContract = await tokenContractFactory.attach(contractAdress);

    // Check the voting power before self-delegation
    const votes = await tokenContract.getVotes(tokensAddress);
    console.log(
        `Account ${tokensAddress} has ${votes.toString()} of MyTokens voting power before self delegating\n`
    );
    // Self delegate
    const delegateTx = await tokenContract.delegate(tokensAddress);
 
   // Check the voting power after self-delegation
   const votesAfter = await tokenContract.getVotes(tokensAddress);
   console.log(
       `Account ${tokensAddress} has ${votesAfter.toString()} of MyTokens voting power after self delegating\n`
   );
}
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
})