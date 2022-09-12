"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention,no-bitwise */
const amino_1 = require("@cosmjs/amino");
const proto_signing_1 = require("@cosmjs/proto-signing");
const tendermint_rpc_1 = require("@cosmjs/tendermint-rpc");
const utils_1 = require("@cosmjs/utils");
const authz_1 = require("cosmjs-types/cosmos/authz/v1beta1/authz");
const tx_1 = require("cosmjs-types/cosmos/bank/v1beta1/tx");
const coin_1 = require("cosmjs-types/cosmos/base/v1beta1/coin");
const feegrant_1 = require("cosmjs-types/cosmos/feegrant/v1beta1/feegrant");
const tx_2 = require("cosmjs-types/cosmos/feegrant/v1beta1/tx");
const tx_3 = require("cosmjs-types/cosmos/staking/v1beta1/tx");
const tx_4 = require("cosmjs-types/cosmos/tx/v1beta1/tx");
const timestamp_1 = require("cosmjs-types/google/protobuf/timestamp");
const long_1 = __importDefault(require("long"));
const minimal_1 = __importDefault(require("protobufjs/minimal"));
const aminotypes_1 = require("./aminotypes");
const modules_1 = require("./modules");
const queryclient_1 = require("./queryclient");
const signingstargateclient_1 = require("./signingstargateclient");
const stargateclient_1 = require("./stargateclient");
const testutils_spec_1 = require("./testutils.spec");
describe("SigningStargateClient", () => {
    describe("constructor", () => {
        it("can be constructed with custom registry", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const registry = new proto_signing_1.Registry();
            registry.register("/custom.MsgCustom", tx_1.MsgSend);
            const options = { ...testutils_spec_1.defaultSigningClientOptions, registry: registry };
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, options);
            const openedClient = client;
            expect(openedClient.registry.lookupType("/custom.MsgCustom")).toEqual(tx_1.MsgSend);
        });
    });
    describe("simulate", () => {
        it("works", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
            const msg = tx_3.MsgDelegate.fromPartial({
                delegatorAddress: testutils_spec_1.faucet.address0,
                validatorAddress: testutils_spec_1.validator.validatorAddress,
                amount: (0, proto_signing_1.coin)(1234, "ustake"),
            });
            const msgAny = {
                typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                value: msg,
            };
            const memo = "Use your power wisely";
            const gasUsed = await client.simulate(testutils_spec_1.faucet.address0, [msgAny], memo);
            expect(gasUsed).toBeGreaterThanOrEqual(101000);
            expect(gasUsed).toBeLessThanOrEqual(200000);
            client.disconnect();
        });
    });
    describe("sendTokens", () => {
        it("works with direct signer", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
            const amount = (0, proto_signing_1.coins)(7890, "ucosm");
            const beneficiaryAddress = (0, testutils_spec_1.makeRandomAddress)();
            const memo = "for dinner";
            // no tokens here
            const before = await client.getBalance(beneficiaryAddress, "ucosm");
            expect(before).toEqual({
                denom: "ucosm",
                amount: "0",
            });
            // send
            const result = await client.sendTokens(testutils_spec_1.faucet.address0, beneficiaryAddress, amount, testutils_spec_1.defaultSendFee, memo);
            (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            expect(result.rawLog).toBeTruthy();
            // got tokens
            const after = await client.getBalance(beneficiaryAddress, "ucosm");
            expect(after).toEqual(amount[0]);
        });
        it("works with legacy Amino signer", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
            const amount = (0, proto_signing_1.coins)(7890, "ucosm");
            const beneficiaryAddress = (0, testutils_spec_1.makeRandomAddress)();
            const memo = "for dinner";
            // no tokens here
            const before = await client.getBalance(beneficiaryAddress, "ucosm");
            expect(before).toEqual({
                denom: "ucosm",
                amount: "0",
            });
            // send
            const result = await client.sendTokens(testutils_spec_1.faucet.address0, beneficiaryAddress, amount, testutils_spec_1.defaultSendFee, memo);
            (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            expect(result.rawLog).toBeTruthy();
            // got tokens
            const after = await client.getBalance(beneficiaryAddress, "ucosm");
            expect(after).toEqual(amount[0]);
        });
        it("works with feegrant granter", async () => {
            (0, testutils_spec_1.pendingWithoutSimapp)();
            const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic, {
                hdPaths: [(0, proto_signing_1.makeCosmoshubPath)(0), (0, proto_signing_1.makeCosmoshubPath)(1)],
            });
            const [{ address: signer }, { address: payer }] = await wallet.getAccounts();
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
            const tmClient = await tendermint_rpc_1.Tendermint34Client.connect(testutils_spec_1.simapp.tendermintUrl);
            const queryClient = queryclient_1.QueryClient.withExtensions(tmClient, modules_1.setupFeegrantExtension);
            let allowanceExists;
            try {
                const _existingAllowance = await queryClient.feegrant.allowance(payer, signer);
                allowanceExists = true;
            }
            catch (_a) {
                allowanceExists = false;
            }
            if (!allowanceExists) {
                // Create feegrant allowance
                const allowance = {
                    typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
                    value: Uint8Array.from(feegrant_1.BasicAllowance.encode({
                        spendLimit: [
                            {
                                denom: "ucosm",
                                amount: "1234567",
                            },
                        ],
                    }).finish()),
                };
                const grantMsg = {
                    typeUrl: "/cosmos.feegrant.v1beta1.MsgGrantAllowance",
                    value: tx_2.MsgGrantAllowance.fromPartial({
                        granter: payer,
                        grantee: signer,
                        allowance: allowance,
                    }),
                };
                const grantResult = await client.signAndBroadcast(payer, [grantMsg], "auto", "Create allowance");
                (0, stargateclient_1.assertIsDeliverTxSuccess)(grantResult);
            }
            const balanceSigner1 = await client.getBalance(signer, "ucosm");
            const balancePayer1 = await client.getBalance(payer, "ucosm");
            const sendAmount = (0, proto_signing_1.coins)(7890, "ucosm");
            const feeAmount = (0, proto_signing_1.coins)(4444, "ucosm");
            // send
            const result = await client.sendTokens(signer, (0, testutils_spec_1.makeRandomAddress)(), sendAmount, {
                amount: feeAmount,
                gas: "120000",
                granter: payer,
            });
            (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            const balanceSigner2 = await client.getBalance(signer, "ucosm");
            const balancePayer2 = await client.getBalance(payer, "ucosm");
            const diffSigner = Number(BigInt(balanceSigner1.amount) - BigInt(balanceSigner2.amount));
            const diffPayer = Number(BigInt(balancePayer1.amount) - BigInt(balancePayer2.amount));
            expect(diffSigner).toEqual(7890); // the send amount
            expect(diffPayer).toEqual(4444); // the fee
        });
    });
    describe("sendIbcTokens", () => {
        it("works with direct signing", async () => {
            pending("We cannot test this easily anymore since the IBC module was removed from simapp");
            const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
            const memo = "Cross-chain fun";
            const fee = {
                amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                gas: "222000", // 222k
            };
            // both timeouts set
            {
                const result = await client.sendIbcTokens(testutils_spec_1.faucet.address0, testutils_spec_1.faucet.address1, (0, proto_signing_1.coin)(1234, "ucosm"), "fooPort", "fooChannel", { revisionHeight: long_1.default.fromNumber(123), revisionNumber: long_1.default.fromNumber(456) }, Math.floor(Date.now() / 1000) + 60, fee, memo);
                // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
                expect((0, stargateclient_1.isDeliverTxFailure)(result)).toEqual(true);
            }
            // no height timeout
            {
                const result = await client.sendIbcTokens(testutils_spec_1.faucet.address0, testutils_spec_1.faucet.address1, (0, proto_signing_1.coin)(1234, "ucosm"), "fooPort", "fooChannel", undefined, Math.floor(Date.now() / 1000) + 60, fee, memo);
                // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
                expect((0, stargateclient_1.isDeliverTxFailure)(result)).toEqual(true);
            }
        });
        it("works with Amino signing", async () => {
            pending("We cannot test this easily anymore since the IBC module was removed from simapp");
            const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
            const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
            const memo = "Cross-chain fun";
            const fee = {
                amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                gas: "222000", // 222k
            };
            // both timeouts set
            {
                const result = await client.sendIbcTokens(testutils_spec_1.faucet.address0, testutils_spec_1.faucet.address1, (0, proto_signing_1.coin)(1234, "ucosm"), "fooPort", "fooChannel", { revisionHeight: long_1.default.fromNumber(123), revisionNumber: long_1.default.fromNumber(456) }, Math.floor(Date.now() / 1000) + 60, fee, memo);
                // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
                expect((0, stargateclient_1.isDeliverTxFailure)(result)).toEqual(true);
            }
            // no height timeout
            {
                const result = await client.sendIbcTokens(testutils_spec_1.faucet.address0, testutils_spec_1.faucet.address1, (0, proto_signing_1.coin)(1234, "ucosm"), "fooPort", "fooChannel", undefined, Math.floor(Date.now() / 1000) + 60, fee, memo);
                // CheckTx must pass but the execution must fail in DeliverTx due to invalid channel/port
                expect((0, stargateclient_1.isDeliverTxFailure)(result)).toEqual(true);
            }
        });
    });
    describe("signAndBroadcast", () => {
        describe("direct mode", () => {
            it("works", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = tx_3.MsgDelegate.fromPartial({
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                });
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "222000", // 222k
                };
                const memo = "Use your power wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
                expect(result.code).toEqual(0);
                expect(result.gasWanted).toEqual(222000);
                expect(result.gasUsed).toBeLessThanOrEqual(222000);
                expect(result.gasUsed).toBeGreaterThan(100000);
            });
            it("returns DeliverTxFailure on DeliverTx failure", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = tx_1.MsgSend.fromPartial({
                    fromAddress: testutils_spec_1.faucet.address0,
                    toAddress: (0, testutils_spec_1.makeRandomAddress)(),
                    amount: (0, proto_signing_1.coins)(Number.MAX_SAFE_INTEGER, "ustake"),
                });
                const msgAny = {
                    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "99000",
                };
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee);
                (0, stargateclient_1.assertIsDeliverTxFailure)(result);
                expect(result.code).toBeGreaterThan(0);
                expect(result.gasWanted).toEqual(99000);
                expect(result.gasUsed).toBeLessThanOrEqual(99000);
                expect(result.gasUsed).toBeGreaterThan(40000);
            });
            it("works with auto gas", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, {
                    ...testutils_spec_1.defaultSigningClientOptions,
                    gasPrice: testutils_spec_1.defaultGasPrice,
                });
                const msg = tx_3.MsgDelegate.fromPartial({
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                });
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], "auto");
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with a modifying signer", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await testutils_spec_1.ModifyingDirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = tx_3.MsgDelegate.fromPartial({
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                });
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "222000", // 222k
                };
                const memo = "Use your power wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
                await (0, utils_1.sleep)(1000);
                const searchResult = await client.getTx(result.transactionHash);
                (0, utils_1.assert)(searchResult, "Must find transaction");
                const tx = (0, proto_signing_1.decodeTxRaw)(searchResult.tx);
                // From ModifyingDirectSecp256k1HdWallet
                expect(tx.body.memo).toEqual("This was modified");
                expect({ ...tx.authInfo.fee.amount[0] }).toEqual((0, proto_signing_1.coin)(3000, "ucosm"));
                expect(tx.authInfo.fee.gasLimit.toNumber()).toEqual(333333);
            });
        });
        describe("legacy Amino mode", () => {
            it("works with bank MsgSend", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgSend = {
                    fromAddress: testutils_spec_1.faucet.address0,
                    toAddress: (0, testutils_spec_1.makeRandomAddress)(),
                    amount: (0, proto_signing_1.coins)(1234, "ucosm"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                    value: msgSend,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with staking MsgDelegate", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgDelegate = {
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msgDelegate,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ustake"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with a custom registry and custom message", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const customRegistry = new proto_signing_1.Registry();
                const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";
                const baseCustomMsgDelegate = {
                    customDelegatorAddress: "",
                    customValidatorAddress: "",
                };
                const CustomMsgDelegate = {
                    // Adapted from autogenerated MsgDelegate implementation
                    encode(message, writer = minimal_1.default.Writer.create()) {
                        var _a, _b;
                        writer.uint32(10).string((_a = message.customDelegatorAddress) !== null && _a !== void 0 ? _a : "");
                        writer.uint32(18).string((_b = message.customValidatorAddress) !== null && _b !== void 0 ? _b : "");
                        if (message.customAmount !== undefined && message.customAmount !== undefined) {
                            coin_1.Coin.encode(message.customAmount, writer.uint32(26).fork()).ldelim();
                        }
                        return writer;
                    },
                    decode() {
                        throw new Error("decode method should not be required");
                    },
                    fromJSON() {
                        throw new Error("fromJSON method should not be required");
                    },
                    fromPartial(object) {
                        const message = { ...baseCustomMsgDelegate };
                        if (object.customDelegatorAddress !== undefined && object.customDelegatorAddress !== null) {
                            message.customDelegatorAddress = object.customDelegatorAddress;
                        }
                        else {
                            message.customDelegatorAddress = "";
                        }
                        if (object.customValidatorAddress !== undefined && object.customValidatorAddress !== null) {
                            message.customValidatorAddress = object.customValidatorAddress;
                        }
                        else {
                            message.customValidatorAddress = "";
                        }
                        if (object.customAmount !== undefined && object.customAmount !== null) {
                            message.customAmount = coin_1.Coin.fromPartial(object.customAmount);
                        }
                        else {
                            message.customAmount = undefined;
                        }
                        return message;
                    },
                    toJSON() {
                        throw new Error("toJSON method should not be required");
                    },
                };
                customRegistry.register(msgDelegateTypeUrl, CustomMsgDelegate);
                const customAminoTypes = new aminotypes_1.AminoTypes({
                    "/cosmos.staking.v1beta1.MsgDelegate": {
                        aminoType: "cosmos-sdk/MsgDelegate",
                        toAmino: ({ customDelegatorAddress, customValidatorAddress, customAmount, }) => {
                            (0, utils_1.assert)(customDelegatorAddress, "missing customDelegatorAddress");
                            (0, utils_1.assert)(customValidatorAddress, "missing validatorAddress");
                            (0, utils_1.assert)(customAmount, "missing amount");
                            return {
                                delegator_address: customDelegatorAddress,
                                validator_address: customValidatorAddress,
                                amount: {
                                    amount: customAmount.amount,
                                    denom: customAmount.denom,
                                },
                            };
                        },
                        fromAmino: ({ delegator_address, validator_address, amount, }) => ({
                            customDelegatorAddress: delegator_address,
                            customValidatorAddress: validator_address,
                            customAmount: coin_1.Coin.fromPartial(amount),
                        }),
                    },
                });
                const options = {
                    ...testutils_spec_1.defaultSigningClientOptions,
                    registry: customRegistry,
                    aminoTypes: customAminoTypes,
                };
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, options);
                const msg = {
                    customDelegatorAddress: testutils_spec_1.faucet.address0,
                    customValidatorAddress: testutils_spec_1.validator.validatorAddress,
                    customAmount: (0, proto_signing_1.coin)(1234, "ustake"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your power wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with a modifying signer", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await testutils_spec_1.ModifyingSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = {
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your power wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
                await (0, utils_1.sleep)(1000);
                const searchResult = await client.getTx(result.transactionHash);
                (0, utils_1.assert)(searchResult, "Must find transaction");
                const tx = (0, proto_signing_1.decodeTxRaw)(searchResult.tx);
                // From ModifyingSecp256k1HdWallet
                expect(tx.body.memo).toEqual("This was modified");
                expect({ ...tx.authInfo.fee.amount[0] }).toEqual((0, proto_signing_1.coin)(3000, "ucosm"));
                expect(tx.authInfo.fee.gasLimit.toNumber()).toEqual(333333);
            });
        });
    });
    describe("sign", () => {
        describe("direct mode", () => {
            it("works", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await proto_signing_1.DirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = tx_3.MsgDelegate.fromPartial({
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                });
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "222000", // 222k
                };
                const memo = "Use your power wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with a modifying signer", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await testutils_spec_1.ModifyingDirectSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = tx_3.MsgDelegate.fromPartial({
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                });
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "222000", // 222k
                };
                const memo = "Use your power wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                const body = tx_4.TxBody.decode(signed.bodyBytes);
                const authInfo = tx_4.AuthInfo.decode(signed.authInfoBytes);
                // From ModifyingDirectSecp256k1HdWallet
                expect(body.memo).toEqual("This was modified");
                expect({ ...authInfo.fee.amount[0] }).toEqual((0, proto_signing_1.coin)(3000, "ucosm"));
                expect(authInfo.fee.gasLimit.toNumber()).toEqual(333333);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
        });
        describe("legacy Amino mode", () => {
            it("works with authz MsgGrant", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgGrant = {
                    granter: testutils_spec_1.faucet.address0,
                    grantee: (0, testutils_spec_1.makeRandomAddress)(),
                    grant: {
                        authorization: {
                            typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
                            value: authz_1.GenericAuthorization.encode({
                                msg: "/cosmos.gov.v1beta1.MsgVote",
                            }).finish(),
                        },
                        expiration: timestamp_1.Timestamp.fromPartial({
                            seconds: 1762589483,
                        }),
                    },
                };
                const msgAny = {
                    typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
                    value: msgGrant,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const result = await client.signAndBroadcast(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with authz MsgExec", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgExec = {
                    grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                    msgs: [
                        {
                            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                            value: tx_1.MsgSend.encode(tx_1.MsgSend.fromPartial({
                                fromAddress: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                                toAddress: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                                amount: (0, proto_signing_1.coins)(1234, "ucosm"),
                            })).finish(),
                        },
                    ],
                };
                const msgAny = {
                    typeUrl: "/cosmos.authz.v1beta1.MsgExec",
                    value: msgExec,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with authz MsgRevoke", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgRevoke = {
                    grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                    granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                    msgTypeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
                };
                const msgAny = {
                    typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
                    value: msgRevoke,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with bank MsgSend", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgSend = {
                    fromAddress: testutils_spec_1.faucet.address0,
                    toAddress: (0, testutils_spec_1.makeRandomAddress)(),
                    amount: (0, proto_signing_1.coins)(1234, "ucosm"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                    value: msgSend,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with staking MsgDelegate", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msgDelegate = {
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msgDelegate,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ustake"),
                    gas: "200000",
                };
                const memo = "Use your tokens wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with a custom registry and custom message", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await amino_1.Secp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const customRegistry = new proto_signing_1.Registry();
                const msgDelegateTypeUrl = "/cosmos.staking.v1beta1.MsgDelegate";
                const baseCustomMsgDelegate = {
                    customDelegatorAddress: "",
                    customValidatorAddress: "",
                };
                const CustomMsgDelegate = {
                    // Adapted from autogenerated MsgDelegate implementation
                    encode(message, writer = minimal_1.default.Writer.create()) {
                        var _a, _b;
                        writer.uint32(10).string((_a = message.customDelegatorAddress) !== null && _a !== void 0 ? _a : "");
                        writer.uint32(18).string((_b = message.customValidatorAddress) !== null && _b !== void 0 ? _b : "");
                        if (message.customAmount !== undefined && message.customAmount !== undefined) {
                            coin_1.Coin.encode(message.customAmount, writer.uint32(26).fork()).ldelim();
                        }
                        return writer;
                    },
                    decode() {
                        throw new Error("decode method should not be required");
                    },
                    fromJSON() {
                        throw new Error("fromJSON method should not be required");
                    },
                    fromPartial(object) {
                        const message = { ...baseCustomMsgDelegate };
                        if (object.customDelegatorAddress !== undefined && object.customDelegatorAddress !== null) {
                            message.customDelegatorAddress = object.customDelegatorAddress;
                        }
                        else {
                            message.customDelegatorAddress = "";
                        }
                        if (object.customValidatorAddress !== undefined && object.customValidatorAddress !== null) {
                            message.customValidatorAddress = object.customValidatorAddress;
                        }
                        else {
                            message.customValidatorAddress = "";
                        }
                        if (object.customAmount !== undefined && object.customAmount !== null) {
                            message.customAmount = coin_1.Coin.fromPartial(object.customAmount);
                        }
                        else {
                            message.customAmount = undefined;
                        }
                        return message;
                    },
                    toJSON() {
                        throw new Error("toJSON method should not be required");
                    },
                };
                customRegistry.register(msgDelegateTypeUrl, CustomMsgDelegate);
                const customAminoTypes = new aminotypes_1.AminoTypes({
                    "/cosmos.staking.v1beta1.MsgDelegate": {
                        aminoType: "cosmos-sdk/MsgDelegate",
                        toAmino: ({ customDelegatorAddress, customValidatorAddress, customAmount, }) => {
                            (0, utils_1.assert)(customDelegatorAddress, "missing customDelegatorAddress");
                            (0, utils_1.assert)(customValidatorAddress, "missing validatorAddress");
                            (0, utils_1.assert)(customAmount, "missing amount");
                            return {
                                delegator_address: customDelegatorAddress,
                                validator_address: customValidatorAddress,
                                amount: {
                                    amount: customAmount.amount,
                                    denom: customAmount.denom,
                                },
                            };
                        },
                        fromAmino: ({ delegator_address, validator_address, amount, }) => ({
                            customDelegatorAddress: delegator_address,
                            customValidatorAddress: validator_address,
                            customAmount: coin_1.Coin.fromPartial(amount),
                        }),
                    },
                });
                const options = {
                    ...testutils_spec_1.defaultSigningClientOptions,
                    registry: customRegistry,
                    aminoTypes: customAminoTypes,
                };
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, options);
                const msg = {
                    customDelegatorAddress: testutils_spec_1.faucet.address0,
                    customValidatorAddress: testutils_spec_1.validator.validatorAddress,
                    customAmount: (0, proto_signing_1.coin)(1234, "ustake"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your power wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
            it("works with a modifying signer", async () => {
                (0, testutils_spec_1.pendingWithoutSimapp)();
                const wallet = await testutils_spec_1.ModifyingSecp256k1HdWallet.fromMnemonic(testutils_spec_1.faucet.mnemonic);
                const client = await signingstargateclient_1.SigningStargateClient.connectWithSigner(testutils_spec_1.simapp.tendermintUrl, wallet, testutils_spec_1.defaultSigningClientOptions);
                const msg = {
                    delegatorAddress: testutils_spec_1.faucet.address0,
                    validatorAddress: testutils_spec_1.validator.validatorAddress,
                    amount: (0, proto_signing_1.coin)(1234, "ustake"),
                };
                const msgAny = {
                    typeUrl: "/cosmos.staking.v1beta1.MsgDelegate",
                    value: msg,
                };
                const fee = {
                    amount: (0, proto_signing_1.coins)(2000, "ucosm"),
                    gas: "200000",
                };
                const memo = "Use your power wisely";
                const signed = await client.sign(testutils_spec_1.faucet.address0, [msgAny], fee, memo);
                const body = tx_4.TxBody.decode(signed.bodyBytes);
                const authInfo = tx_4.AuthInfo.decode(signed.authInfoBytes);
                // From ModifyingSecp256k1HdWallet
                expect(body.memo).toEqual("This was modified");
                expect({ ...authInfo.fee.amount[0] }).toEqual((0, proto_signing_1.coin)(3000, "ucosm"));
                expect(authInfo.fee.gasLimit.toNumber()).toEqual(333333);
                // ensure signature is valid
                const result = await client.broadcastTx(Uint8Array.from(tx_4.TxRaw.encode(signed).finish()));
                (0, stargateclient_1.assertIsDeliverTxSuccess)(result);
            });
        });
    });
});
//# sourceMappingURL=signingstargateclient.spec.js.map