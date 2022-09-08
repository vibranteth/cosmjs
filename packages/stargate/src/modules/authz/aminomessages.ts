import { Grant, GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import Long from "long";
import { AminoConverters, tryGetConverter } from "../../aminotypes";
import { EncodeObject, Registry } from "@cosmjs/proto-signing";
import { fromBase64 } from "@cosmjs/encoding";

function toTimestamp(date: Date): Timestamp {
  const seconds = Long.fromNumber(date.getTime() / 1_000);
  const nanos = (date.getTime() % 1_000) * 1_000_000;
  return { seconds, nanos };
}

function fromTimestamp(t: Timestamp): Date {
  let millis = t.seconds.toNumber() * 1_000;
  millis += t.nanos / 1_000_000;
  return new Date(millis);
}

export interface AminoMsgGrant {
  readonly granter: string;
  readonly grantee: string;
  readonly grant?: {
    readonly authorization?: GenericAuthorization,
    readonly expiration?: string;
  };
}

export interface AminoMsgExec {
  readonly grantee: string;
  readonly msgs: readonly any[];
}

export interface AminoMsgRevoke {
  readonly granter: string;
  readonly grantee: string;
  readonly msg_type_url: string;
}

export interface AminoAuthorization {
}

export interface AminoGenericAuthorization extends AminoAuthorization {
  readonly msg: string;
}

function toAminoAuthorization(authorization: Any): AminoGenericAuthorization {
  const { typeUrl, value } = authorization;

  switch (typeUrl) {
    case "/cosmos.authz.v1beta1.GenericAuthorization":
      return GenericAuthorization.decode(value);
    default:
      throw new Error("Grant authorization types other than GenericAuthorization are not supported at this time.")
  }
}

function fromAminoAuthorization(authorization: any): Any {
  if (!authorization.msgs) {
    throw new Error("Grant authorization types other than GenericAuthorization are not supported at this time.")
  }

  return {
    typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
    value: authorization.msgs
  }
}

export function createAuthzAminoConverters(): AminoConverters {
  return {
    "/cosmos.authz.v1beta1.MsgGrant": {
      requiresCustomAminoType: true,
      aminoType: "cosmos-sdk/MsgGrant",
      toAmino: ({ grant, granter, grantee }: MsgGrant): AminoMsgGrant => {
        return {
          grant: (!grant) ? undefined : {
            authorization: (grant.authorization) ? toAminoAuthorization(grant.authorization) : undefined,
            expiration: (grant.expiration) ? fromTimestamp(grant.expiration).toISOString() : undefined
          },
          granter: granter,
          grantee: grantee
        }
      },
      fromAmino: ({ grant, granter, grantee }: AminoMsgGrant): MsgGrant => {
        return {
          grant: (!grant) ? undefined : Grant.fromPartial({
            authorization: (grant.authorization) ? fromAminoAuthorization(grant.authorization) : undefined,
            expiration: (grant.expiration) ? toTimestamp(new Date(grant.expiration)) : undefined
          }),
          granter: granter,
          grantee: grantee
        }
      },
    },
    "/cosmos.authz.v1beta1.MsgExec": {
      requiresCustomAminoType: true,
      aminoType: "cosmos-sdk/MsgExec",
      toAmino: ({ grantee, msgs }: MsgExec, register: AminoConverters, registry: Registry): AminoMsgExec => {
        return {
          msgs: Array.isArray(msgs) ? msgs.map((msg: Any) => {
            let encodeObject = Any.toJSON(msg) as EncodeObject;
            let generatedType = registry.lookupType(encodeObject.typeUrl)?.decode(fromBase64(encodeObject.value));
            let converter = tryGetConverter(encodeObject.typeUrl, register);
            return converter.toAmino(generatedType, register, registry);
          }) : [],
          grantee: grantee,
        };
      },
      fromAmino: ({ msgs, grantee }: AminoMsgExec): MsgExec => {
        return {
          msgs: Array.isArray(msgs) ? msgs.map((e: any) => Any.fromJSON(e)) : [],
          grantee: grantee
        };
      },
    },
    "/cosmos.authz.v1beta1.MsgRevoke": {
      requiresCustomAminoType: true,
      aminoType: "cosmos-sdk/MsgRevoke",
      toAmino: ({ msgTypeUrl, granter, grantee }: MsgRevoke): AminoMsgRevoke => {
        return {
          msg_type_url: msgTypeUrl,
          granter: granter,
          grantee: grantee,
        };
      },
      fromAmino: ({ msg_type_url, granter, grantee }: AminoMsgRevoke): MsgRevoke => {
        return {
          msgTypeUrl: msg_type_url,
          granter: granter,
          grantee: grantee,
        };
      },
    },
  };
}
