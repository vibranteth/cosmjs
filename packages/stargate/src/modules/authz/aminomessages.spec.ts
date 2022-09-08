import { coins, Registry } from "@cosmjs/proto-signing";
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import { AminoTypes } from "../../aminotypes";
import { createBankAminoConverters } from "../bank/aminomessages";
import { bankTypes } from "../bank/messages";
import { AminoMsgExec, AminoMsgGrant, AminoMsgRevoke, createAuthzAminoConverters } from "./aminomessages";

describe("AminoTypes", () => {
  describe("toAmino", () => {
    it("works for MsgGrant", async () => {
      const msg: MsgGrant = {
        granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
        grant: {
          authorization: {
            typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
            value: GenericAuthorization.encode(
              GenericAuthorization.fromPartial({
                msg: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
              }),
            ).finish(),
          },
          expiration: Timestamp.fromJSON({
            seconds: 1762589483
          }),
        },
      };

      const registry = new Registry([
        ...bankTypes
      ]);
      const aminoTypes = new AminoTypes(createAuthzAminoConverters(), registry);

      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/cosmos.authz.v1beta1.MsgGrant",
        value: msg,
      });

      const expected: AminoMsgGrant = {
        granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
        grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
        grant: {
          authorization: {
            msg: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
          },
          expiration: "2025-11-08T08:11:23.000Z"
        },
      };
      expect(aminoMsg).toEqual(expected);
    });

    it("works for MsgExec", async () => {
      const msg: MsgExec = {
        grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
        msgs: [
          {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: MsgSend.encode(
              MsgSend.fromPartial({
                fromAddress: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
                toAddress: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
                amount: coins(1234, "ucosm"),
              })).finish(),
          },
        ],
      };

      const registry = new Registry([
        ...bankTypes
      ]
      );

      const aminoTypes = new AminoTypes({
        ...createAuthzAminoConverters(),
        ...createBankAminoConverters()
      }, registry);

      const aminoMsg = aminoTypes.toAmino({
        typeUrl: "/cosmos.authz.v1beta1.MsgExec",
        value: msg,
      });

      const expected: AminoMsgExec = {
        grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
        msgs: [
          {
            from_address: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
            to_address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
            amount: coins(1234, "ucosm"),
          }
        ],
      };
      expect(aminoMsg).toEqual(expected);
    });
  });

  it("works for MsgRevoke", async () => {
    const msg: MsgRevoke = {
      grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
      granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
      msgTypeUrl: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
    };

    const aminoTypes = new AminoTypes(createAuthzAminoConverters());
    const aminoMsg = aminoTypes.toAmino({
      typeUrl: "/cosmos.authz.v1beta1.MsgRevoke",
      value: msg,
    });

    const expected: AminoMsgRevoke = {
      grantee: "cosmos10dyr9899g6t0pelew4nvf4j5c3jcgv0r73qga5",
      granter: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
      msg_type_url: "/osmosis.superfluid.MsgLockAndSuperfluidDelegate",
    };
    expect(aminoMsg).toEqual(expected);
  });
});