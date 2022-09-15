/* eslint-disable @typescript-eslint/naming-convention */
import { AminoAny } from "@cosmjs/amino";
import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import Long from "long";

import { AminoConverters, AminoTypes } from "../../aminotypes";

export interface AminoAuthorization extends AminoAny {}

export interface AminoGenericAuthorization extends AminoAuthorization {
  readonly msg: string;
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds.toNumber() * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

function toTimestamp(date: Date): Timestamp {
  const seconds = Long.fromNumber(date.getTime() / 1_000);
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

export interface AminoGrant {
  readonly authorization?: AminoAuthorization;
  readonly expiration?: string;
}

export interface AminoMsgGrant extends AminoAny {
  readonly granter: string;
  readonly grantee: string;
  readonly grant?: AminoGrant;
}

export interface AminoMsgExec extends AminoAny {
  readonly grantee: string;
  readonly msgs: readonly any[];
}

export interface AminoMsgRevoke extends AminoAny {
  readonly granter: string;
  readonly grantee: string;
  readonly msg_type_url: string;
}

export function createAuthzAminoConverters(): AminoConverters {
  return {
    "/cosmos.authz.v1beta1.GenericAuthorization": {
      encodeAsAminoAny: true,
      aminoType: "cosmos-sdk/GenericAuthorization",
      toAmino(bytes: Any["value"]): AminoGenericAuthorization {
        return {
          "@type": "/cosmos.authz.v1beta1.GenericAuthorization",
          msg: Any.decode(bytes).typeUrl,
        };
      },
      fromAmino({ msg }: AminoGenericAuthorization): Any["value"] {
        return GenericAuthorization.encode(
          GenericAuthorization.fromPartial({
            msg: msg,
          }),
        ).finish();
      },
    },
    "/cosmos.authz.v1beta1.MsgGrant": {
      encodeAsAminoAny: true,
      aminoType: "cosmos-sdk/MsgGrant",
      toAmino({ granter, grantee, grant }: MsgGrant, aminoTypes: AminoTypes): AminoMsgGrant {
        return {
          "@type": "/cosmos.authz.v1beta1.MsgGrant",
          granter: granter,
          grantee: grantee,
          grant: grant
            ? {
                authorization: grant.authorization ? aminoTypes.toAmino(grant.authorization) : undefined,
                expiration: grant.expiration ? fromTimestamp(grant.expiration).toISOString() : undefined,
              }
            : undefined,
        };
      },
      fromAmino({ granter, grantee, grant }: AminoMsgGrant, aminoTypes: AminoTypes): MsgGrant {
        return {
          granter: granter,
          grantee: grantee,
          grant: grant
            ? {
                authorization: grant.authorization ? aminoTypes.fromAmino(grant.authorization) : undefined,
                expiration: grant.expiration ? toTimestamp(new Date(grant.expiration)) : undefined,
              }
            : undefined,
        };
      },
    },
  };
}
