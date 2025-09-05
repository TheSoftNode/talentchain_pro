// SPDX-License-Identifier: MIT

import expect from 'expect';
import { loadContractAndCallConstructor } from '../setup';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('SkillToken Contract', function () {
    this.timeout(60000);

    let program: any;
    let storage: Keypair;
    let payer: Keypair;
    let provider: any;

    before(async function () {
        ({ program, storage, payer, provider } = await loadContractAndCallConstructor('SkillToken'));
    });

    describe('Initialization', function () {
        it('should initialize with correct name and symbol', async function () {
            const name = await program.methods.name()
                .accounts({ dataAccount: storage.publicKey })
                .view();
            
            const symbol = await program.methods.symbol()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(name).toBe('TalentChain Skill Token');
            expect(symbol).toBe('TCST');
        });
    });

    describe('Skill Token Management', function () {
        it('should mint skill token successfully', async function () {
            const recipient = Keypair.generate().publicKey;
            const skillCategory = 'Programming';
            const level = 5;
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60; // 1 year from now

            const tx = await program.methods.mintSkill(
                recipient,
                skillCategory,
                level,
                new BN(expiryDate)
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should validate skill level constraints', async function () {
            const recipient = Keypair.generate().publicKey;
            const skillCategory = 'Design';
            const invalidLevel = 15; // Should be 1-10
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

            await expect(
                program.methods.mintSkill(
                    recipient,
                    skillCategory,
                    invalidLevel,
                    new BN(expiryDate)
                )
                    .accounts({ dataAccount: storage.publicKey })
                    .rpc()
            ).rejects.toThrow();
        });

        it('should get token by owner', async function () {
            const tokens = await program.methods.getTokensByOwner(payer.publicKey)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(tokens)).toBe(true);
        });

        it('should check if skill is active', async function () {
            // Assuming we have token ID 1 from previous minting
            const isActive = await program.methods.isSkillActive(new BN(1))
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isActive).toBe('boolean');
        });
    });

    describe('Skill Endorsement', function () {
        it('should endorse a skill successfully', async function () {
            const tokenId = new BN(1);
            const endorser = payer.publicKey;

            const tx = await program.methods.endorseSkill(tokenId, endorser)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get endorsement count', async function () {
            const tokenId = new BN(1);
            
            const count = await program.methods.getEndorsementCount(tokenId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(count)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Skill Verification', function () {
        it('should verify a skill', async function () {
            const tokenId = new BN(1);
            const verifier = payer.publicKey;

            const tx = await program.methods.verifySkill(tokenId, true)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should check verification status', async function () {
            const tokenId = new BN(1);
            
            const isVerified = await program.methods.isSkillVerified(tokenId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isVerified).toBe('boolean');
        });
    });

    describe('Token Metadata', function () {
        it('should get skill data', async function () {
            const tokenId = new BN(1);
            
            const skillData = await program.methods.getSkillData(tokenId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(skillData).toBeDefined();
            expect(skillData.category).toBeDefined();
            expect(skillData.level).toBeDefined();
            expect(skillData.expiryDate).toBeDefined();
        });

        it('should get total supply', async function () {
            const totalSupply = await program.methods.totalSupply()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(totalSupply)).toBeGreaterThan(0);
        });
    });

    describe('Access Control', function () {
        it('should respect minter role', async function () {
            // Test will depend on actual implementation
            // This is a placeholder for role-based access control tests
            expect(true).toBe(true);
        });

        it('should respect verifier role', async function () {
            // Test will depend on actual implementation
            // This is a placeholder for role-based access control tests
            expect(true).toBe(true);
        });
    });
});
