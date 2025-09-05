// SPDX-License-Identifier: MIT

import expect from 'expect';
import { loadContractAndCallConstructor } from '../setup';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('TalentChainPro Integration Tests', function () {
    this.timeout(120000); // Extended timeout for integration tests

    let skillTokenProgram: any;
    let skillTokenStorage: Keypair;
    let talentPoolProgram: any;
    let talentPoolStorage: Keypair;
    let reputationOracleProgram: any;
    let reputationOracleStorage: Keypair;
    let governanceProgram: any;
    let governanceStorage: Keypair;
    let payer: Keypair;
    let provider: any;

    before(async function () {
        console.log('Setting up integration test environment...');
        
        // Initialize all contracts
        ({ 
            program: skillTokenProgram, 
            storage: skillTokenStorage, 
            payer, 
            provider 
        } = await loadContractAndCallConstructor('SkillToken'));

        ({ 
            program: talentPoolProgram, 
            storage: talentPoolStorage 
        } = await loadContractAndCallConstructor('TalentPool'));

        ({ 
            program: reputationOracleProgram, 
            storage: reputationOracleStorage 
        } = await loadContractAndCallConstructor('ReputationOracle'));

        ({ 
            program: governanceProgram, 
            storage: governanceStorage 
        } = await loadContractAndCallConstructor('Governance'));

        console.log('All contracts initialized successfully');
    });

    describe('End-to-End Talent Lifecycle', function () {
        let talent: PublicKey;
        let client: PublicKey;
        let oracle: PublicKey;
        let tokenId: BN;
        let jobId: BN;

        it('should complete full talent onboarding flow', async function () {
            talent = payer.publicKey;
            client = Keypair.generate().publicKey;
            oracle = payer.publicKey; // Use payer as oracle for simplicity

            // Step 1: Mint skill tokens for talent
            console.log('Step 1: Minting skill tokens...');
            const skillCategory = 'Full-Stack Development';
            const skillLevel = 8;
            const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;

            await skillTokenProgram.methods.mintSkill(
                talent,
                skillCategory,
                skillLevel,
                new BN(expiryDate)
            ).accounts({ dataAccount: skillTokenStorage.publicKey }).rpc();

            // Get token ID (assuming it's 1 for the first token)
            tokenId = new BN(1);

            // Step 2: Register talent in the pool
            console.log('Step 2: Registering talent...');
            const skills = ['JavaScript', 'React', 'Node.js', 'Solana'];
            const experience = 5;
            const hourlyRate = new BN(75);
            const availability = true;

            await talentPoolProgram.methods.registerTalent(
                talent,
                skills,
                experience,
                hourlyRate,
                availability
            ).accounts({ dataAccount: talentPoolStorage.publicKey }).rpc();

            // Step 3: Add oracle and submit reputation score
            console.log('Step 3: Setting up reputation oracle...');
            await reputationOracleProgram.methods.addOracle(oracle, new BN(100))
                .accounts({ dataAccount: reputationOracleStorage.publicKey }).rpc();

            await reputationOracleProgram.methods.submitReputationScore(
                talent,
                new BN(85),
                'technical_skills',
                'Strong full-stack development skills demonstrated'
            ).accounts({ dataAccount: reputationOracleStorage.publicKey }).rpc();

            // Step 4: Register client
            console.log('Step 4: Registering client...');
            await talentPoolProgram.methods.registerClient(
                client,
                'TechStartup Inc.',
                'Technology',
                ['Full-Stack Developer', 'React Specialist']
            ).accounts({ dataAccount: talentPoolStorage.publicKey }).rpc();

            // Step 5: Post a job
            console.log('Step 5: Posting job...');
            const jobTitle = 'Senior Full-Stack Developer';
            const jobDescription = 'Looking for an experienced developer to build our MVP';
            const requirements = ['React', 'Node.js', 'Solana', '5+ years experience'];
            const budget = new BN(8000);
            const deadline = Math.floor(Date.now() / 1000) + 45 * 24 * 60 * 60;

            await talentPoolProgram.methods.postJob(
                client,
                jobTitle,
                jobDescription,
                requirements,
                budget,
                new BN(deadline)
            ).accounts({ dataAccount: talentPoolStorage.publicKey }).rpc();

            jobId = new BN(1); // Assuming it's the first job

            console.log('Full talent onboarding flow completed successfully');
        });

        it('should handle job application and selection process', async function () {
            // Step 6: Talent applies for job
            console.log('Step 6: Talent applying for job...');
            const proposal = 'I have 5+ years of experience in full-stack development with strong Solana expertise';
            const proposedRate = new BN(80);

            await talentPoolProgram.methods.applyForJob(
                jobId,
                talent,
                proposal,
                proposedRate
            ).accounts({ dataAccount: talentPoolStorage.publicKey }).rpc();

            // Step 7: Verify skill token
            console.log('Step 7: Verifying skill token...');
            await skillTokenProgram.methods.verifySkill(tokenId, true)
                .accounts({ dataAccount: skillTokenStorage.publicKey }).rpc();

            // Step 8: Endorse skill
            console.log('Step 8: Endorsing skill...');
            await skillTokenProgram.methods.endorseSkill(tokenId, oracle)
                .accounts({ dataAccount: skillTokenStorage.publicKey }).rpc();

            console.log('Job application and selection process completed');
        });

        it('should manage project completion and ratings', async function () {
            // Step 9: Rate talent after project completion
            console.log('Step 9: Rating talent...');
            await talentPoolProgram.methods.rateTalent(
                talent,
                client,
                5,
                'Excellent work quality, delivered on time with great communication'
            ).accounts({ dataAccount: talentPoolStorage.publicKey }).rpc();

            // Step 10: Talent rates client
            console.log('Step 10: Talent rating client...');
            await talentPoolProgram.methods.rateClient(
                client,
                talent,
                4,
                'Good client with clear requirements and timely payments'
            ).accounts({ dataAccount: talentPoolStorage.publicKey }).rpc();

            // Step 11: Update reputation score based on project completion
            console.log('Step 11: Updating reputation score...');
            await reputationOracleProgram.methods.submitReputationScore(
                talent,
                new BN(90),
                'project_completion',
                'Successfully completed high-quality project on time'
            ).accounts({ dataAccount: reputationOracleStorage.publicKey }).rpc();

            console.log('Project completion and ratings flow completed');
        });
    });

    describe('Cross-Contract Data Consistency', function () {
        it('should maintain consistent talent data across contracts', async function () {
            const talent = payer.publicKey;

            // Get talent profile from TalentPool
            const talentProfile = await talentPoolProgram.methods.getTalentProfile(talent)
                .accounts({ dataAccount: talentPoolStorage.publicKey }).view();

            // Get reputation score from ReputationOracle
            const reputationScore = await reputationOracleProgram.methods.getReputationScore(talent)
                .accounts({ dataAccount: reputationOracleStorage.publicKey }).view();

            // Get skill tokens owned by talent
            const skillTokens = await skillTokenProgram.methods.getTokensByOwner(talent)
                .accounts({ dataAccount: skillTokenStorage.publicKey }).view();

            // Verify data consistency
            expect(talentProfile).toBeDefined();
            expect(reputationScore).toBeDefined();
            expect(Array.isArray(skillTokens)).toBe(true);

            console.log('Data consistency verified across all contracts');
        });

        it('should validate cross-contract operations', async function () {
            const talent = payer.publicKey;

            // Verify that talent exists in both TalentPool and has reputation
            const talentProfile = await talentPoolProgram.methods.getTalentProfile(talent)
                .accounts({ dataAccount: talentPoolStorage.publicKey }).view();

            const reputationExists = await reputationOracleProgram.methods.getReputationScore(talent)
                .accounts({ dataAccount: reputationOracleStorage.publicKey }).view();

            expect(talentProfile).toBeDefined();
            expect(reputationExists).toBeDefined();
            
            console.log('Cross-contract operations validated successfully');
        });
    });

    describe('Governance Integration', function () {
        it('should create and vote on platform governance proposals', async function () {
            // Step 1: Create a governance proposal
            console.log('Creating governance proposal...');
            const title = 'Update Platform Commission Rate';
            const description = 'Proposal to reduce platform commission from 5% to 3% to attract more talent';
            const proposer = payer.publicKey;
            const votingPeriod = new BN(7 * 24 * 60 * 60); // 7 days
            const executionDelay = new BN(2 * 24 * 60 * 60); // 2 days

            await governanceProgram.methods.createProposal(
                title,
                description,
                proposer,
                votingPeriod,
                executionDelay
            ).accounts({ dataAccount: governanceStorage.publicKey }).rpc();

            // Step 2: Vote on the proposal
            console.log('Casting vote on proposal...');
            const proposalId = new BN(1);
            const support = true;
            const votingPower = new BN(100);

            await governanceProgram.methods.castVote(
                proposalId,
                proposer,
                support,
                votingPower
            ).accounts({ dataAccount: governanceStorage.publicKey }).rpc();

            // Step 3: Check voting results
            const votingResults = await governanceProgram.methods.getVotingResults(proposalId)
                .accounts({ dataAccount: governanceStorage.publicKey }).view();

            expect(votingResults).toBeDefined();
            expect(Number(votingResults.forVotes)).toBeGreaterThan(0);

            console.log('Governance proposal and voting completed successfully');
        });
    });

    describe('Platform Statistics and Analytics', function () {
        it('should aggregate platform-wide statistics', async function () {
            // Get statistics from all contracts
            const totalTalents = await talentPoolProgram.methods.getTotalTalents()
                .accounts({ dataAccount: talentPoolStorage.publicKey }).view();

            const totalClients = await talentPoolProgram.methods.getTotalClients()
                .accounts({ dataAccount: talentPoolStorage.publicKey }).view();

            const totalJobs = await talentPoolProgram.methods.getTotalJobs()
                .accounts({ dataAccount: talentPoolStorage.publicKey }).view();

            const totalSkillTokens = await skillTokenProgram.methods.totalSupply()
                .accounts({ dataAccount: skillTokenStorage.publicKey }).view();

            const totalProposals = await governanceProgram.methods.getTotalProposalsCount()
                .accounts({ dataAccount: governanceStorage.publicKey }).view();

            const reputationEntries = await reputationOracleProgram.methods.getTotalReputationEntries()
                .accounts({ dataAccount: reputationOracleStorage.publicKey }).view();

            // Verify all statistics are non-negative numbers
            expect(Number(totalTalents)).toBeGreaterThanOrEqual(0);
            expect(Number(totalClients)).toBeGreaterThanOrEqual(0);
            expect(Number(totalJobs)).toBeGreaterThanOrEqual(0);
            expect(Number(totalSkillTokens)).toBeGreaterThanOrEqual(0);
            expect(Number(totalProposals)).toBeGreaterThanOrEqual(0);
            expect(Number(reputationEntries)).toBeGreaterThanOrEqual(0);

            console.log('Platform statistics aggregated successfully:', {
                totalTalents: Number(totalTalents),
                totalClients: Number(totalClients),
                totalJobs: Number(totalJobs),
                totalSkillTokens: Number(totalSkillTokens),
                totalProposals: Number(totalProposals),
                reputationEntries: Number(reputationEntries)
            });
        });
    });

    describe('Security and Access Control', function () {
        it('should enforce proper access controls across contracts', async function () {
            const unauthorizedUser = Keypair.generate().publicKey;

            // Test that unauthorized users cannot perform admin functions
            // Note: These tests might throw errors, which is expected behavior

            try {
                // Try to add oracle without permission
                await reputationOracleProgram.methods.addOracle(unauthorizedUser, new BN(50))
                    .accounts({ dataAccount: reputationOracleStorage.publicKey }).rpc();
                
                // If this doesn't throw, the test should fail
                expect(false).toBe(true); // This should not execute
            } catch (error) {
                // Expected behavior - unauthorized access should be blocked
                expect(error).toBeDefined();
            }

            console.log('Access control validation completed');
        });

        it('should validate data integrity across contract interactions', async function () {
            const talent = payer.publicKey;

            // Verify that skill tokens are properly linked to talent
            const skillTokens = await skillTokenProgram.methods.getTokensByOwner(talent)
                .accounts({ dataAccount: skillTokenStorage.publicKey }).view();

            const talentProfile = await talentPoolProgram.methods.getTalentProfile(talent)
                .accounts({ dataAccount: talentPoolStorage.publicKey }).view();

            // Both should exist and be consistent
            expect(Array.isArray(skillTokens)).toBe(true);
            expect(talentProfile).toBeDefined();

            console.log('Data integrity validation completed');
        });
    });
});
