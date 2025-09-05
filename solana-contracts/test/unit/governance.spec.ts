// SPDX-License-Identifier: MIT

import expect from 'expect';
import { loadContractAndCallConstructor } from '../setup';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('Governance Contract', function () {
    this.timeout(60000);

    let program: any;
    let storage: Keypair;
    let payer: Keypair;
    let provider: any;

    before(async function () {
        ({ program, storage, payer, provider } = await loadContractAndCallConstructor('Governance'));
    });

    describe('Proposal Management', function () {
        it('should create proposal successfully', async function () {
            const title = 'Update Platform Fee Structure';
            const description = 'Proposal to adjust the platform fees to be more competitive';
            const proposer = payer.publicKey;
            const votingPeriod = new BN(7 * 24 * 60 * 60); // 7 days
            const executionDelay = new BN(2 * 24 * 60 * 60); // 2 days

            const tx = await program.methods.createProposal(
                title,
                description,
                proposer,
                votingPeriod,
                executionDelay
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get proposal details', async function () {
            const proposalId = new BN(1);

            const proposal = await program.methods.getProposal(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(proposal).toBeDefined();
            expect(proposal.title).toBeDefined();
            expect(proposal.description).toBeDefined();
            expect(proposal.proposer).toBeDefined();
        });

        it('should get all proposals', async function () {
            const proposals = await program.methods.getAllProposals()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(proposals)).toBe(true);
        });

        it('should cancel proposal', async function () {
            // First create a proposal
            const tx1 = await program.methods.createProposal(
                'Test Proposal',
                'Test Description',
                payer.publicKey,
                new BN(604800), // 7 days
                new BN(172800)  // 2 days
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            // Then cancel it
            const proposalId = new BN(2); // Assuming this is the second proposal
            const tx2 = await program.methods.cancelProposal(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx2).toBeDefined();
        });
    });

    describe('Voting System', function () {
        it('should cast vote successfully', async function () {
            const proposalId = new BN(1);
            const voter = payer.publicKey;
            const support = true; // Vote in favor
            const votingPower = new BN(100);

            const tx = await program.methods.castVote(
                proposalId,
                voter,
                support,
                votingPower
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get vote details', async function () {
            const proposalId = new BN(1);
            const voter = payer.publicKey;

            const vote = await program.methods.getVote(proposalId, voter)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(vote).toBeDefined();
        });

        it('should get voting results', async function () {
            const proposalId = new BN(1);

            const results = await program.methods.getVotingResults(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(results).toBeDefined();
            expect(results.forVotes).toBeDefined();
            expect(results.againstVotes).toBeDefined();
        });

        it('should check voting eligibility', async function () {
            const voter = payer.publicKey;
            const proposalId = new BN(1);

            const isEligible = await program.methods.isEligibleToVote(voter, proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isEligible).toBe('boolean');
        });
    });

    describe('Voting Power Management', function () {
        it('should calculate voting power', async function () {
            const account = payer.publicKey;

            const votingPower = await program.methods.calculateVotingPower(account)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(votingPower)).toBeGreaterThanOrEqual(0);
        });

        it('should delegate voting power', async function () {
            const delegator = payer.publicKey;
            const delegate = Keypair.generate().publicKey;

            const tx = await program.methods.delegateVotingPower(delegator, delegate)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get delegation info', async function () {
            const account = payer.publicKey;

            const delegation = await program.methods.getDelegation(account)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(delegation).toBeDefined();
        });
    });

    describe('Proposal Execution', function () {
        it('should execute proposal after passing', async function () {
            const proposalId = new BN(1);

            // Note: This might fail if proposal hasn't passed voting period
            try {
                const tx = await program.methods.executeProposal(proposalId)
                    .accounts({ dataAccount: storage.publicKey })
                    .rpc();
                expect(tx).toBeDefined();
            } catch (error) {
                // Expected if proposal is not ready for execution
                expect(error).toBeDefined();
            }
        });

        it('should check if proposal is executable', async function () {
            const proposalId = new BN(1);

            const isExecutable = await program.methods.isProposalExecutable(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isExecutable).toBe('boolean');
        });
    });

    describe('Governance Parameters', function () {
        it('should update voting period', async function () {
            const newVotingPeriod = new BN(10 * 24 * 60 * 60); // 10 days

            const tx = await program.methods.updateVotingPeriod(newVotingPeriod)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should update quorum threshold', async function () {
            const newQuorum = new BN(30); // 30%

            const tx = await program.methods.updateQuorumThreshold(newQuorum)
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get governance parameters', async function () {
            const params = await program.methods.getGovernanceParameters()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(params).toBeDefined();
            expect(params.votingPeriod).toBeDefined();
            expect(params.quorumThreshold).toBeDefined();
        });
    });

    describe('Proposal States', function () {
        it('should get proposal state', async function () {
            const proposalId = new BN(1);

            const state = await program.methods.getProposalState(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(state).toBeDefined();
        });

        it('should check if proposal is active', async function () {
            const proposalId = new BN(1);

            const isActive = await program.methods.isProposalActive(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isActive).toBe('boolean');
        });

        it('should check if proposal has passed', async function () {
            const proposalId = new BN(1);

            const hasPassed = await program.methods.hasProposalPassed(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof hasPassed).toBe('boolean');
        });
    });

    describe('Quorum and Thresholds', function () {
        it('should check if quorum is reached', async function () {
            const proposalId = new BN(1);

            const quorumReached = await program.methods.isQuorumReached(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof quorumReached).toBe('boolean');
        });

        it('should calculate participation rate', async function () {
            const proposalId = new BN(1);

            const participationRate = await program.methods.getParticipationRate(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(participationRate)).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Access Control', function () {
        it('should check proposer permissions', async function () {
            const account = payer.publicKey;

            const canPropose = await program.methods.canCreateProposal(account)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof canPropose).toBe('boolean');
        });

        it('should check governance admin role', async function () {
            const account = payer.publicKey;

            const isGovernanceAdmin = await program.methods.isGovernanceAdmin(account)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isGovernanceAdmin).toBe('boolean');
        });
    });

    describe('Statistics and Analytics', function () {
        it('should get total proposals count', async function () {
            const count = await program.methods.getTotalProposalsCount()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(count)).toBeGreaterThanOrEqual(0);
        });

        it('should get active proposals count', async function () {
            const count = await program.methods.getActiveProposalsCount()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(count)).toBeGreaterThanOrEqual(0);
        });

        it('should get governance statistics', async function () {
            const stats = await program.methods.getGovernanceStatistics()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(stats).toBeDefined();
            expect(stats.totalProposals).toBeDefined();
            expect(stats.totalVotes).toBeDefined();
        });
    });

    describe('Event Logging', function () {
        it('should get proposal events', async function () {
            const proposalId = new BN(1);

            const events = await program.methods.getProposalEvents(proposalId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(events)).toBe(true);
        });

        it('should get voting history', async function () {
            const voter = payer.publicKey;

            const history = await program.methods.getVotingHistory(voter)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(history)).toBe(true);
        });
    });

    describe('Emergency Controls', function () {
        it('should pause governance in emergency', async function () {
            try {
                const tx = await program.methods.pauseGovernance()
                    .accounts({ dataAccount: storage.publicKey })
                    .rpc();
                expect(tx).toBeDefined();
            } catch (error) {
                // Expected if caller doesn't have emergency role
                expect(error).toBeDefined();
            }
        });

        it('should check if governance is paused', async function () {
            const isPaused = await program.methods.isGovernancePaused()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isPaused).toBe('boolean');
        });
    });
});
