import { Grant } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";

import { AminoConverters } from "../../aminotypes";

export interface AminoMsgGrant {
  readonly granter: string;
  readonly grantee: string;
  readonly grant?: Grant;
}

export interface AminoMsgExec {
  readonly grantee: string;
  readonly msgs: any[];
}

export interface AminoMsgRevoke {
  readonly granter: string;
  readonly grantee: string;
  readonly msgTypeUrl: string;
}

export function createAuthzAminoConverters(): AminoConverters {
  return {
    "/cosmos.authz.v1beta1.MsgExec": {
      requiresCustomAminoType: true,
      aminoType: "cosmos-sdk/MsgExec",
      toAmino: ({ msgs, grantee }: MsgExec): AminoMsgExec => {
        return {
          msgs: msgs,
          grantee: grantee,
        };
      },
      fromAmino: ({ msgs, grantee }: AminoMsgExec): MsgExec => {
        return {
          msgs: msgs,
          grantee: grantee,
        };
      },
    },
    "/cosmos.authz.v1beta1.MsgGrant": {
      requiresCustomAminoType: true,
      aminoType: "cosmos-sdk/MsgGrant",
      toAmino: ({ grant, granter, grantee }: MsgGrant): AminoMsgGrant => {
        return {
          grant: grant,
          granter: granter,
          grantee: grantee,
        };
      },
      fromAmino: ({ grant, granter, grantee }: AminoMsgGrant): MsgGrant => {
        return {
          grant: grant,
          granter: granter,
          grantee: grantee,
        };
      },
    },
    "/cosmos.authz.v1beta1.MsgRevoke": {
      requiresCustomAminoType: true,
      aminoType: "cosmos-sdk/MsgRevoke",
      toAmino: ({ msgTypeUrl, granter, grantee }: MsgRevoke): AminoMsgRevoke => {
        return {
          msgTypeUrl: msgTypeUrl,
          granter: granter,
          grantee: grantee,
        };
      },
      fromAmino: ({ msgTypeUrl, granter, grantee }: AminoMsgRevoke): MsgRevoke => {
        return {
          msgTypeUrl: msgTypeUrl,
          granter: granter,
          grantee: grantee,
        };
      },
    },
  };
}
