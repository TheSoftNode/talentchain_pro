// SPDX-License-Identifier: MIT

import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, BpfLoader, BPF_LOADER_PROGRAM_ID, TransactionExpiredBlockheightExceededError } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import fs from 'fs';
import path from 'path';

const endpoint: string = process.env.RPC_URL || "http://127.0.0.1:8899";

/**
 * Load contract and call constructor
 */
export async function loadContractAndCallConstructor(
    name: string, 
    args: any[] = [], 
    space: number = 8192
): Promise<{ program: Program, payer: Keypair, provider: AnchorProvider, storage: Keypair, program_key: PublicKey }> {
    
    const { program, payer, provider, program_key } = await loadContract(name);

    const storage = Keypair.generate();
    await createAccount(storage, program_key, space);

    await program.methods.new(...args)
        .accounts({ dataAccount: storage.publicKey })
        .rpc();

    return { provider, program, payer, storage, program_key: program_key };
}

/**
 * Load contract without calling constructor
 */
export async function loadContract(name: string): Promise<{ program: Program, payer: Keypair, provider: AnchorProvider, program_key: PublicKey }> {
    const idlPath = path.join(__dirname, '..', `${name}.json`);
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    const payer = loadKey('payer.key');

    process.env['ANCHOR_WALLET'] = path.join(__dirname, '..', 'keys', 'payer.key');

    const provider = AnchorProvider.local(endpoint);
    const program_key = loadKey(`${name}.key`);
    const program = new Program(idl, program_key.publicKey, provider);
    
    return { program, payer, provider, program_key: program_key.publicKey };
}

/**
 * Create a new account for program data
 */
export async function createAccount(account: Keypair, programId: PublicKey, space: number) {
    const provider = AnchorProvider.local(endpoint);
    const lamports = await provider.connection.getMinimumBalanceForRentExemption(space);

    const transaction = new Transaction();

    transaction.add(
        SystemProgram.createAccount({
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: account.publicKey,
            lamports,
            space,
            programId,
        })
    );

    await provider.sendAndConfirm(transaction, [account], { commitment: 'confirmed' });
}

/**
 * Create new connection and payer keypair
 */
export function newConnectionAndPayer(): [Connection, Keypair] {
    const connection = newConnection();
    const payerAccount = loadKey('payer.key');
    return [connection, payerAccount];
}

/**
 * Load contract with custom provider
 */
export async function loadContractWithProvider(
    provider: AnchorProvider, 
    name: string, 
    args: any[] = [], 
    space: number = 8192
): Promise<{ program: Program, storage: Keypair, program_key: PublicKey }> {

    const idlPath = path.join(__dirname, '..', `${name}.json`);
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    const storage = Keypair.generate();
    const program_key = loadKey(`${name}.key`);

    await createAccount(storage, program_key.publicKey, space);

    const program = new Program(idl, program_key.publicKey, provider);

    await program.methods.new(...args)
        .accounts({ dataAccount: storage.publicKey })
        .rpc();

    return { program, storage, program_key: program_key.publicKey };
}

/**
 * Load keypair from file
 */
function loadKey(filename: string): Keypair {
    const keyPath = path.join(__dirname, '..', 'keys', filename);
    if (!fs.existsSync(keyPath)) {
        throw new Error(`Key file not found: ${keyPath}. Run 'npm run setup' first.`);
    }
    
    const contents = fs.readFileSync(keyPath).toString();
    const bs = Uint8Array.from(JSON.parse(contents));
    
    return Keypair.fromSecretKey(bs);
}

/**
 * Create new account with lamports (for testing)
 */
async function newAccountWithLamports(connection: Connection, amount: number = 100): Promise<Keypair> {
    const account = Keypair.generate();

    console.log(`Airdropping ${amount} SOL to new wallet ${account.publicKey.toString()}...`);
    
    let signature = await connection.requestAirdrop(account.publicKey, amount * LAMPORTS_PER_SOL);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature,
    }, 'confirmed');
    
    return account;
}

/**
 * Setup test environment (create payer and deploy programs)
 */
export async function setup() {
    const writeKey = (fileName: string, key: Keypair) => {
        const keyPath = path.join(__dirname, '..', 'keys', fileName);
        fs.writeFileSync(keyPath, JSON.stringify(Array.from(key.secretKey)));
        console.log(`Created key: ${keyPath}`);
    };

    let connection = newConnection();
    const payer = await newAccountWithLamports(connection);

    writeKey('payer.key', payer);

    const projectRoot = path.join(__dirname, '..');
    const files = fs.readdirSync(projectRoot);
    
    for (const file of files) {
        if (file.endsWith('.so')) {
            const name = file.slice(0, -3);
            let program: Keypair;

            const keyPath = path.join(projectRoot, 'keys', `${name}.key`);
            if (fs.existsSync(keyPath)) {
                program = loadKey(`${name}.key`);
            } else {
                program = Keypair.generate();
            }

            console.log(`Loading program ${name} at ${program.publicKey.toString()}...`);
            
            const programSo = fs.readFileSync(path.join(projectRoot, file));
            
            for (let retries = 5; retries > 0; retries -= 1) {
                try {
                    await BpfLoader.load(connection, payer, program, programSo, BPF_LOADER_PROGRAM_ID);
                    break;
                } catch (e) {
                    if (e instanceof TransactionExpiredBlockheightExceededError) {
                        console.log('Transaction expired, retrying...');
                        connection = newConnection();
                    } else {
                        throw e;
                    }
                }
            }
            
            console.log(`Successfully loaded ${name}`);
            writeKey(`${name}.key`, program);
        }
    }
}

/**
 * Create new Solana connection
 */
function newConnection(): Connection {
    return new Connection(endpoint, {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
    });
}

/**
 * Utility function to sleep for testing
 */
export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get program IDL
 */
export function getIdl(name: string): any {
    const idlPath = path.join(__dirname, '..', `${name}.json`);
    return JSON.parse(fs.readFileSync(idlPath, 'utf8'));
}

// Run setup if this file is executed directly
if (require.main === module) {
    (async () => {
        console.log('Setting up test environment...');
        await setup();
        console.log('Setup complete!');
        process.exit(0);
    })().catch(error => {
        console.error('Setup failed:', error);
        process.exit(1);
    });
}
