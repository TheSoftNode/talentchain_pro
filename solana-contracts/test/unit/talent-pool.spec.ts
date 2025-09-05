// SPDX-License-Identifier: MIT

import expect from 'expect';
import { loadContractAndCallConstructor } from '../setup';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';

describe('TalentPool Contract', function () {
    this.timeout(60000);

    let program: any;
    let storage: Keypair;
    let payer: Keypair;
    let provider: any;

    before(async function () {
        ({ program, storage, payer, provider } = await loadContractAndCallConstructor('TalentPool'));
    });

    describe('Talent Registration', function () {
        it('should register talent successfully', async function () {
            const talent = payer.publicKey;
            const skills = ['JavaScript', 'React', 'Node.js'];
            const experience = 5;
            const hourlyRate = new BN(50); // $50/hour
            const availability = true;

            const tx = await program.methods.registerTalent(
                talent,
                skills,
                experience,
                hourlyRate,
                availability
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should update talent profile', async function () {
            const talent = payer.publicKey;
            const newSkills = ['JavaScript', 'React', 'Node.js', 'TypeScript'];
            const newExperience = 6;
            const newHourlyRate = new BN(60);
            const newAvailability = false;

            const tx = await program.methods.updateTalentProfile(
                talent,
                newSkills,
                newExperience,
                newHourlyRate,
                newAvailability
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get talent profile', async function () {
            const talent = payer.publicKey;

            const profile = await program.methods.getTalentProfile(talent)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(profile).toBeDefined();
            expect(profile.skills).toBeDefined();
            expect(profile.experience).toBeDefined();
            expect(profile.hourlyRate).toBeDefined();
        });
    });

    describe('Client Registration', function () {
        it('should register client successfully', async function () {
            const client = Keypair.generate().publicKey;
            const companyName = 'TechCorp Inc.';
            const industry = 'Technology';
            const requirements = ['React Developer', 'UI/UX Designer'];

            const tx = await program.methods.registerClient(
                client,
                companyName,
                industry,
                requirements
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get client profile', async function () {
            const client = Keypair.generate().publicKey;
            
            // First register the client
            await program.methods.registerClient(
                client,
                'TestCorp',
                'Tech',
                ['Developer']
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            const profile = await program.methods.getClientProfile(client)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(profile).toBeDefined();
            expect(profile.companyName).toBeDefined();
            expect(profile.industry).toBeDefined();
        });
    });

    describe('Job Management', function () {
        it('should post job successfully', async function () {
            const client = payer.publicKey;
            const title = 'Senior React Developer';
            const description = 'Looking for an experienced React developer...';
            const requirements = ['React', 'TypeScript', '5+ years experience'];
            const budget = new BN(5000);
            const deadline = Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60; // 30 days

            const tx = await program.methods.postJob(
                client,
                title,
                description,
                requirements,
                budget,
                new BN(deadline)
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should apply for job', async function () {
            const jobId = new BN(1);
            const talent = payer.publicKey;
            const proposal = 'I am an experienced React developer...';
            const proposedRate = new BN(55);

            const tx = await program.methods.applyForJob(
                jobId,
                talent,
                proposal,
                proposedRate
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get job details', async function () {
            const jobId = new BN(1);

            const job = await program.methods.getJobDetails(jobId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(job).toBeDefined();
            expect(job.title).toBeDefined();
            expect(job.description).toBeDefined();
            expect(job.budget).toBeDefined();
        });

        it('should get job applications', async function () {
            const jobId = new BN(1);

            const applications = await program.methods.getJobApplications(jobId)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(applications)).toBe(true);
        });
    });

    describe('Talent Matching', function () {
        it('should match talents by skills', async function () {
            const requiredSkills = ['React', 'JavaScript'];
            const minExperience = 3;

            const matches = await program.methods.matchTalentsBySkills(
                requiredSkills,
                minExperience
            )
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(matches)).toBe(true);
        });

        it('should get talent by availability', async function () {
            const available = true;

            const talents = await program.methods.getTalentsByAvailability(available)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(talents)).toBe(true);
        });

        it('should search talents by criteria', async function () {
            const skills = ['JavaScript'];
            const minExperience = 2;
            const maxHourlyRate = new BN(100);
            const availability = true;

            const results = await program.methods.searchTalents(
                skills,
                minExperience,
                maxHourlyRate,
                availability
            )
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Array.isArray(results)).toBe(true);
        });
    });

    describe('Rating and Review System', function () {
        it('should rate talent', async function () {
            const talent = payer.publicKey;
            const client = Keypair.generate().publicKey;
            const rating = 5;
            const review = 'Excellent work quality and communication';

            const tx = await program.methods.rateTalent(
                talent,
                client,
                rating,
                review
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should rate client', async function () {
            const client = payer.publicKey;
            const talent = Keypair.generate().publicKey;
            const rating = 4;
            const review = 'Good client with clear requirements';

            const tx = await program.methods.rateClient(
                client,
                talent,
                rating,
                review
            )
                .accounts({ dataAccount: storage.publicKey })
                .rpc();

            expect(tx).toBeDefined();
        });

        it('should get talent rating', async function () {
            const talent = payer.publicKey;

            const rating = await program.methods.getTalentRating(talent)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(rating).toBeDefined();
            expect(Number(rating.averageRating)).toBeGreaterThanOrEqual(0);
            expect(Number(rating.totalRatings)).toBeGreaterThanOrEqual(0);
        });

        it('should get client rating', async function () {
            const client = payer.publicKey;

            const rating = await program.methods.getClientRating(client)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(rating).toBeDefined();
        });
    });

    describe('Statistics and Analytics', function () {
        it('should get total registered talents', async function () {
            const count = await program.methods.getTotalTalents()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(count)).toBeGreaterThanOrEqual(0);
        });

        it('should get total registered clients', async function () {
            const count = await program.methods.getTotalClients()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(count)).toBeGreaterThanOrEqual(0);
        });

        it('should get total posted jobs', async function () {
            const count = await program.methods.getTotalJobs()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(Number(count)).toBeGreaterThanOrEqual(0);
        });

        it('should get platform statistics', async function () {
            const stats = await program.methods.getPlatformStats()
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(stats).toBeDefined();
            expect(stats.totalTalents).toBeDefined();
            expect(stats.totalClients).toBeDefined();
            expect(stats.totalJobs).toBeDefined();
        });
    });

    describe('Access Control and Security', function () {
        it('should validate talent ownership', async function () {
            const talent = payer.publicKey;
            
            const isOwner = await program.methods.isTalentOwner(talent, payer.publicKey)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isOwner).toBe('boolean');
        });

        it('should validate client ownership', async function () {
            const client = payer.publicKey;
            
            const isOwner = await program.methods.isClientOwner(client, payer.publicKey)
                .accounts({ dataAccount: storage.publicKey })
                .view();

            expect(typeof isOwner).toBe('boolean');
        });
    });
});
