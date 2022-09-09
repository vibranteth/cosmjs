"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const amino_1 = require("@cosmjs/amino");
const proto_signing_1 = require("@cosmjs/proto-signing");
const utils_1 = require("@cosmjs/utils");
const gov_1 = require("cosmjs-types/cosmos/gov/v1beta1/gov");
const any_1 = require("cosmjs-types/google/protobuf/any");
const queryclient_1 = require("../../queryclient");
const signingstargateclient_1 = require("../../signingstargateclient");
const stargateclient_1 = require("../../stargateclient");
const testutils_spec_1 = require("../../testutils.spec");
describe("gov messages", () => {
    const defaultFee = {
        amount: (0, amino_1.coins)(25000, "ucosm"),
        gas: "1500000", // 1.5 million
    };
    const textProposal = gov_1.TextProposal.fromPartial({
        title: "Test Proposal",
        description: "This proposal proposes to test whether this proposal passes",
    });
    const initialDeposit = (0, amino_1.coins)(12300000, "ustake");
    const delegationVoter1 = (0, amino_1.coin)(424242, "ustake");
    const delegationVoter2 = (0, amino_1.coin)(777, "ustake");
    const voter1Address = testutils_spec_1.faucet.address1;
    const voter2Address = testutils_spec_1.faucet.address2;
    // Use address 1 and 2 instead of 0 to avoid conflicts with other delegation tests
    // This must match `voterAddress` above.
    const voterPaths = [(0, amino_1.makeCosmoshubPath)(1), (0, amino_1.makeCosmoshubPath)(2)];
    let voterWallet;
    let voterWalletAmino;
    let proposalId;
    beforeAll(async () => {
        if ((0, testutils_spec_1.simappEnabled)()) {
            voterWallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic, { hdPaths: voterPaths });
            voterWalletAmino = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic, { hdPaths: voterPaths });
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, voterWallet, testutils_spec_1.defaultSigningClientOptions);
            const proposalMsg = {
                typeUrl: "/cosmos.gov.v1beta1.MsgSubmitProposal",
                value: {
                    content: any_1.Any.fromPartial({
                        typeUrl: "/cosmos.gov.v1beta1.TextProposal",
                        value: Uint8Array.from(gov_1.TextProposal.encode(textProposal).finish()),
                    }),
                    proposer: voter1Address,
                    initialDeposit: initialDeposit,
                },
            };
            const proposalResult = await client.signAndBroadcast(voter1Address, [proposalMsg], defaultFee, "Test proposal for simd");
            (0, stargateclient_1.assertIsDeliverTxSuccess)(proposalResult);
            const logs = JSON.parse(proposalResult.rawLog || "");
            proposalId = logs[0].events
                .find(({ type }) => type === "submit_proposal")
                .attributes.find(({ key }) => key === "proposal_id").value;
            (0, utils_1.assert)(proposalId, "Proposal ID not found in events");
            (0, utils_1.assert)(proposalId.match(testutils_spec_1.nonNegativeIntegerMatcher));
            // Voter 1
            {
                // My vote only counts when I delegate
                if (!(await client.getDelegation(voter1Address, testutils_spec_1.validator.validatorAddress))) {
                    const msgDelegate = {
                        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                        value: {
                            delegatorAddress: voter1Address,
                            validatorAddress: testutils_spec_1.validator.validatorAddress,
                            amount: delegationVoter1,
                        },
                    };
                    const result = await client.signAndBroadcast(voter1Address, [msgDelegate], defaultFee);
                    (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
                }
            }
            // Voter 2
            {
                // My vote only counts when I delegate
                if (!(await client.getDelegation(voter2Address, testutils_spec_1.validator.validatorAddress))) {
                    const msgDelegate = {
                        typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                        value: {
                            delegatorAddress: voter2Address,
                            validatorAddress: testutils_spec_1.validator.validatorAddress,
                            amount: delegationVoter2,
                        },
                    };
                    const result = await client.signAndBroadcast(voter2Address, [msgDelegate], defaultFee);
                    (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
                }
                const voteMsg = {
                    typeUrl: "/cosmos.gov.v1beta1.MsgVote",
                    value: {
                        proposalId: (0, queryclient_1.longify)(proposalId),
                        voter: voter2Address,
                        option: gov_1.VoteOption.VOTE_OPTION_NO_WITH_VETO,
                    },
                };
                const voteResult = await client.signAndBroadcast(voter2Address, [voteMsg], defaultFee);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(voteResult);
            }
            await (0, utils_1.sleep)(75); // wait until transactions are indexed
            client.disconnect();
        }
    });
    describe("MsgVote", () => {
        it("works", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            (0, utils_1.assert)(voterWallet);
            (0, utils_1.assert)(proposalId, "Missing proposal ID");
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, voterWallet);
            const voteMsg = {
                typeUrl: "/cosmos.gov.v1beta1.MsgVote",
                value: {
                    proposalId: (0, queryclient_1.longify)(proposalId),
                    voter: voter1Address,
                    option: gov_1.VoteOption.VOTE_OPTION_YES,
                },
            };
            const voteResult = await client.signAndBroadcast(voter1Address, [voteMsg], defaultFee);
            (0, stargateclient_1.assertIsDeliverTxSuccess)(voteResult);
            client.disconnect();
        });
        it("works with Amino JSON sign mode", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            (0, utils_1.assert)(voterWalletAmino);
            (0, utils_1.assert)(proposalId, "Missing proposal ID");
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, voterWalletAmino);
            const voteMsg = {
                typeUrl: "/cosmos.gov.v1beta1.MsgVote",
                value: {
                    proposalId: (0, queryclient_1.longify)(proposalId),
                    voter: voter1Address,
                    option: gov_1.VoteOption.VOTE_OPTION_YES,
                },
            };
            const voteResult = await client.signAndBroadcast(voter1Address, [voteMsg], defaultFee);
            (0, stargateclient_1.assertIsDeliverTxSuccess)(voteResult);
            client.disconnect();
        });
    });
    describe("MsgVoteWeighted", () => {
        it("works", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp44Or46)(); // MsgVoteWeighted does not yet exist in Cosmos SDK 0.42
            (0, utils_1.assert)(voterWallet);
            (0, utils_1.assert)(proposalId, "Missing proposal ID");
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, voterWallet);
            const voteMsg = {
                typeUrl: "/cosmos.gov.v1beta1.MsgVoteWeighted",
                value: {
                    proposalId: (0, queryclient_1.longify)(proposalId),
                    voter: voter1Address,
                    options: [
                        {
                            option: gov_1.VoteOption.VOTE_OPTION_YES,
                            weight: "700000000000000000", // 0.7
                        },
                        {
                            option: gov_1.VoteOption.VOTE_OPTION_NO,
                            weight: "200000000000000000", // 0.2
                        },
                        {
                            option: gov_1.VoteOption.VOTE_OPTION_ABSTAIN,
                            weight: "100000000000000000", // 0.1
                        },
                    ],
                },
            };
            const voteResult = await client.signAndBroadcast(voter1Address, [voteMsg], defaultFee);
            (0, stargateclient_1.assertIsDeliverTxSuccess)(voteResult);
            client.disconnect();
        });
        it("works with Amino JSON sign mode", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp44Or46)(); // MsgVoteWeighted does not yet exist in Cosmos SDK 0.42
            (0, utils_1.assert)(voterWalletAmino);
            (0, utils_1.assert)(proposalId, "Missing proposal ID");
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, voterWalletAmino);
            const voteMsg = {
                typeUrl: "/cosmos.gov.v1beta1.MsgVoteWeighted",
                value: {
                    proposalId: (0, queryclient_1.longify)(proposalId),
                    voter: voter1Address,
                    options: [
                        {
                            option: gov_1.VoteOption.VOTE_OPTION_YES,
                            weight: "700000000000000000", // 0.7
                        },
                        {
                            option: gov_1.VoteOption.VOTE_OPTION_NO,
                            weight: "200000000000000000", // 0.2
                        },
                        {
                            option: gov_1.VoteOption.VOTE_OPTION_ABSTAIN,
                            weight: "100000000000000000", // 0.1
                        },
                    ],
                },
            };
            const voteResult = await client.signAndBroadcast(voter1Address, [voteMsg], defaultFee);
            (0, stargateclient_1.assertIsDeliverTxSuccess)(voteResult);
            client.disconnect();
        });
    });
});
//# sourceMappingURL=messages.spec.js.map