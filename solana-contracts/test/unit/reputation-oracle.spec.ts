// SPDX-License-Identifier: MIT

import expect from 'expect';
import { loadContractAndCallConstructor } from '../setup';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('ReputationOracle Contract', function () {
    this.timeout(60000);

    let program: any;
    let storage: Keypair;
    let payer: Keypair;
    let provider: any;

    before(async function () {
        ({ program, storage, payer, provider } = await loadContractAndCallConstructor('ReputationOracle'));
    });

    describe('Oracle Management', function () {
        it('should add oracle successfully', async function () {
            const oracle = payer.publicKey;
            const weight = new BN(100);

            const tx = await program.methods.addOracle(oracle, weight)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should remove oracle', async function () {
            const oracle = Keypair.generate().publicKey;
            
            // First add oracle
            await program.methods.addOracle(oracle, new BN(50))
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            // Then remove oracle
            const tx = await program.methods.removeOracle(oracle)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should update oracle weight', async function () {
            const oracle = payer.publicKey;
            const newWeight = new BN(150);

            const tx = await program.methods.updateOracleWeight(oracle, newWeight)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should check if oracle is active', async function () {
            const oracle = payer.publicKey;

            const isActive = await program.methods.isOracleActive(oracle)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isActive).toBe('boolean');
        });
    });

    describe('Reputation Scoring', function () {
        it('should submit reputation score', async function () {
            const target = Keypair.generate().publicKey;
            const score = new BN(85);
            const category = 'technical_skills';
            const evidence = 'Completed 5 successful projects with high client satisfaction';

            const tx = await program.methods.submitReputationScore(
                target,
                score,
                category,
                evidence
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get reputation score', async function () {
            const target = Keypair.generate().publicKey;
            
            // First submit a score
            await program.methods.submitReputationScore(
                target,
                new BN(90),
                'communication',
                'Excellent communication throughout projects'
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            const score = await program.methods.getReputationScore(target)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(score).toBeDefined();
            expect(Number(score.overallScore)).toBeGreaterThanOrEqual(0);
        });

        it('should get detailed reputation', async function () {
            const target = payer.publicKey;

            const reputation = await program.methods.getDetailedReputation(target)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(reputation).toBeDefined();
            expect(reputation.scores).toBeDefined();
        });

        it('should calculate weighted score', async function () {
            const target = payer.publicKey;
            const category = 'technical_skills';

            const weightedScore = await program.methods.calculateWeightedScore(target, category)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(weightedScore)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Performance Metrics', function () {
        it('should record performance metric', async function () {
            const target = payer.publicKey;
            const metricType = 'project_completion_rate';
            const value = new BN(95); // 95%
            const timestamp = new BN(Math.floor(Date.now() / 1000));

            const tx = await program.methods.recordPerformanceMetric(
                target,
                metricType,
                value,
                timestamp
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get performance metrics', async function () {
            const target = payer.publicKey;
            const metricType = 'project_completion_rate';

            const metrics = await program.methods.getPerformanceMetrics(target, metricType)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(metrics)).toBe(true);
        });

        it('should calculate average performance', async function () {
            const target = payer.publicKey;
            const metricType = 'project_completion_rate';

            const average = await program.methods.calculateAveragePerformance(target, metricType)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(average)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Reputation Categories', function () {
        it('should update category score', async function () {
            const target = payer.publicKey;
            const category = 'reliability';
            const score = new BN(88);

            const tx = await program.methods.updateCategoryScore(target, category, score)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get category score', async function () {
            const target = payer.publicKey;
            const category = 'reliability';

            const score = await program.methods.getCategoryScore(target, category)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(score)).toBeGreaterThanOrEqual(0);
        });

        it('should get all categories', async function () {
            const target = payer.publicKey;

            const categories = await program.methods.getAllCategories(target)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(categories)).toBe(true);
        });
    });

    describe('Reputation History', function () {
        it('should get reputation history', async function () {
            const target = payer.publicKey;

            const history = await program.methods.getReputationHistory(target)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(history)).toBe(true);
        });

        it('should get reputation trend', async function () {
            const target = payer.publicKey;
            const days = new BN(30);

            const trend = await program.methods.getReputationTrend(target, days)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(trend).toBeDefined();
        });
    });

    describe('Validation and Verification', function () {
        it('should validate reputation data', async function () {
            const target = payer.publicKey;

            const isValid = await program.methods.validateReputationData(target)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isValid).toBe('boolean');
        });

        it('should verify oracle signature', async function () {
            const oracle = payer.publicKey;
            const message = 'reputation_update';
            const signature = 'mock_signature'; // In real scenario, this would be a proper signature

            const isValid = await program.methods.verifyOracleSignature(oracle, message, signature)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isValid).toBe('boolean');
        });
    });

    describe('Aggregation and Analytics', function () {
        it('should aggregate reputation scores', async function () {
            const targets = [payer.publicKey, Keypair.generate().publicKey];

            const aggregated = await program.methods.aggregateReputationScores(targets)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(aggregated).toBeDefined();
        });

        it('should get reputation distribution', async function () {
            const distribution = await program.methods.getReputationDistribution()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(distribution).toBeDefined();
        });

        it('should get top performers', async function () {
            const category = 'technical_skills';
            const limit = new BN(10);

            const topPerformers = await program.methods.getTopPerformers(category, limit)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(topPerformers)).toBe(true);
        });
    });

    describe('Oracle Consensus', function () {
        it('should reach consensus on reputation', async function () {
            const target = payer.publicKey;
            const category = 'overall';

            const consensus = await program.methods.reachConsensus(target, category)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(consensus).toBeDefined();
        });

        it('should check consensus threshold', async function () {
            const target = payer.publicKey;
            const category = 'technical_skills';

            const hasConsensus = await program.methods.hasConsensus(target, category)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof hasConsensus).toBe('boolean');
        });
    });

    describe('Access Control', function () {
        it('should validate oracle permissions', async function () {
            const oracle = payer.publicKey;
            const action = 'submit_score';

            const hasPermission = await program.methods.hasOraclePermission(oracle, action)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof hasPermission).toBe('boolean');
        });

        it('should check admin role', async function () {
            const account = payer.publicKey;

            const isAdmin = await program.methods.isAdmin(account)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isAdmin).toBe('boolean');
        });
    });

    describe('Statistics and Reporting', function () {
        it('should get oracle statistics', async function () {
            const oracle = payer.publicKey;

            const stats = await program.methods.getOracleStatistics(oracle)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(stats).toBeDefined();
        });

        it('should get system health', async function () {
            const health = await program.methods.getSystemHealth()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(health).toBeDefined();
        });

        it('should get total reputation entries', async function () {
            const total = await program.methods.getTotalReputationEntries()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(total)).toBeGreaterThanOrEqual(0);
        });
    });
});
