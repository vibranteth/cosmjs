"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const amino_1 = require("@cosmjs/amino");
const tx_1 = require("cosmjs-types/cosmos/vesting/v1beta1/tx");
const long_1 = __importDefault(require("long"));
const aminotypes_1 = require("../../aminotypes");
const aminomessages_1 = require("./aminomessages");
describe("vesting Amino messages", () => {
    describe("toAmino", () => {
        it("works for MsgCreateVestingAccount", () => {
            const msg = tx_1.MsgCreateVestingAccount.fromPartial({
                fromAddress: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                toAddress: "cosmos1xy4yqngt0nlkdcenxymg8tenrghmek4nmqm28k",
                amount: (0, amino_1.coins)(1234, "ucosm"),
                endTime: long_1.default.fromString("1838718434"),
                delayed: true,
            });
            const aminoTypes = new aminotypes_1.AminoTypes((0, aminomessages_1.createVestingAminoConverters)());
            const aminoMsg = aminoTypes.toAmino({
                typeUrl: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
                value: msg,
            });
            const expected = {
                type: "cosmos-sdk/MsgCreateVestingAccount",
                value: {
                    from_address: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                    to_address: "cosmos1xy4yqngt0nlkdcenxymg8tenrghmek4nmqm28k",
                    amount: (0, amino_1.coins)(1234, "ucosm"),
                    end_time: "1838718434",
                    delayed: true,
                },
            };
            expect(aminoMsg).toEqual(expected);
        });
    });
    describe("fromAmino", () => {
        it("works for MsgCreateVestingAccount", () => {
            const aminoMsg = {
                type: "cosmos-sdk/MsgCreateVestingAccount",
                value: {
                    from_address: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                    to_address: "cosmos1xy4yqngt0nlkdcenxymg8tenrghmek4nmqm28k",
                    amount: (0, amino_1.coins)(1234, "ucosm"),
                    end_time: "1838718434",
                    delayed: true,
                },
            };
            const msg = new aminotypes_1.AminoTypes((0, aminomessages_1.createVestingAminoConverters)()).fromAmino(aminoMsg);
            const expectedValue = {
                fromAddress: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                toAddress: "cosmos1xy4yqngt0nlkdcenxymg8tenrghmek4nmqm28k",
                amount: (0, amino_1.coins)(1234, "ucosm"),
                endTime: long_1.default.fromString("1838718434"),
                delayed: true,
            };
            expect(msg).toEqual({
                typeUrl: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
                value: expectedValue,
            });
        });
    });
});
//# sourceMappingURL=aminomessages.spec.js.map