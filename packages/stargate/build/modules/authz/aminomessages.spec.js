"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
const proto_signing_1 = require("@cosmjs/proto-signing");
const authz_1 = require("cosmjs-types/cosmos/authz/v1beta1/authz");
const tx_1 = require("cosmjs-types/cosmos/bank/v1beta1/tx");
const timestamp_1 = require("cosmjs-types/google/protobuf/timestamp");
const aminotypes_1 = require("../../aminotypes");
const aminomessages_1 = require("../bank/aminomessages");
const aminomessages_2 = require("./aminomessages");
describe("AminoTypes", () => {
    describe("toAmino", () => {
        it("works for MsgGrant", async () => {
            const msg = {
                granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
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
            const aminoTypes = new aminotypes_1.AminoTypes((0, aminomessages_2.createAuthzAminoConverters)());
            const aminoMsg = aminoTypes.toAmino({
                typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
                value: msg,
            });
            const expected = {
                "@type": "/cosmos.authz.v1beta1.MsgGrant",
                granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                grant: {
                    authorization: {
                        "@type": "/cosmos.authz.v1beta1.GenericAuthorization",
                        msg: "/cosmos.gov.v1beta1.MsgVote",
                    },
                    expiration: "2025-11-08T08:11:23.000Z",
                },
            };
            expect(aminoMsg).toEqual(expected);
        });
        it("works for MsgExec", async () => {
            const msg = {
                grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                msgs: [
                    {
                        typeUrl: "/cosmos.bank.v1beta1.MsgSend",
                        value: tx_1.MsgSend.encode({
                            fromAddress: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                            toAddress: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                            amount: (0, proto_signing_1.coins)(1234, "ucosm"),
                        }).finish(),
                    },
                ],
            };
            const aminoTypes = new aminotypes_1.AminoTypes({
                ...(0, aminomessages_2.createAuthzAminoConverters)(),
                ...(0, aminomessages_1.createBankAminoConverters)(),
            });
            const aminoMsg = aminoTypes.toAmino({
                typeUrl: "/cosmos.authz.v1beta1.MsgExec",
                value: msg,
            });
            const expected = {
                "@type": "/cosmos.authz.v1beta1.MsgExec",
                grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                msgs: [
                    {
                        "@type": "/cosmos.bank.v1beta1.MsgSend",
                        from_address: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                        to_address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                        amount: (0, proto_signing_1.coins)(1234, "ucosm"),
                    },
                ],
            };
            expect(aminoMsg).toEqual(expected);
        });
        it("works for MsgRevoke", async () => {
            const msg = {
                grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                msgTypeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
            };
            const aminoTypes = new aminotypes_1.AminoTypes((0, aminomessages_2.createAuthzAminoConverters)());
            const aminoMsg = aminoTypes.toAmino({
                typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
                value: msg,
            });
            const expected = {
                "@type": "/cosmos.authz.v1beta1.MsgRevoke",
                grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                msg_type_url: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
            };
            expect(aminoMsg).toEqual(expected);
        });
    });
});
describe("fromAmino", () => {
    it("works for MsgGrant", () => {
        const aminoMsg = {
            "@type": "/cosmos.authz.v1beta1.MsgGrant",
            granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
            grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
            grant: {
                authorization: {
                    "@type": "/cosmos.authz.v1beta1.GenericAuthorization",
                    msg: "/cosmos.gov.v1beta1.MsgVote",
                },
                expiration: "2025-11-08T08:11:23.000Z",
            },
        };
        const msg = new aminotypes_1.AminoTypes((0, aminomessages_2.createAuthzAminoConverters)()).fromAmino(aminoMsg);
        const expectedValue = {
            granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
            grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
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
        expect(msg).toEqual({
            typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
            value: expectedValue,
        });
    });
});
//# sourceMappingURL=aminomessages.spec.js.map