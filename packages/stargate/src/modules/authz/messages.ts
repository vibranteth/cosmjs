import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { GenericAuthorization, Grant } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";

export const authzTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmos.authz.v1beta1.MsgExec", MsgExec],
  ["/cosmos.authz.v1beta1.MsgGrant", MsgGrant],
  ["/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke],
  ["/cosmos.authz.v1beta1.GenericAuthorization", GenericAuthorization],
  ["/cosmos.authz.v1beta1.Grant", GenericAuthorization],
];

export interface GrantEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.authz.v1beta1.Grant";
  readonly value: Partial<Grant>;
}

export function isGrantEncodeObject(encodeObject: EncodeObject): encodeObject is GrantEncodeObject {
  return (encodeObject as GrantEncodeObject).typeUrl === "/cosmos.authz.v1beta1.Grant";
}

export interface GenericAuthorizationEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization";
  readonly value: Partial<GenericAuthorization>;
}

export function isGenericAuthorizationEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is GenericAuthorizationEncodeObject {
  return (
    (encodeObject as GenericAuthorizationEncodeObject).typeUrl ===
    "/cosmos.authz.v1beta1.GenericAuthorization"
  );
}

export interface MsgGrantEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.authz.v1beta1.MsgGrant";
  readonly value: Partial<MsgGrant>;
}

export function isMsgGrantEncodeObject(encodeObject: EncodeObject): encodeObject is MsgGrantEncodeObject {
  return (encodeObject as MsgGrantEncodeObject).typeUrl === "/cosmos.authz.v1beta1.MsgGrant";
}

export interface MsgExecEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.authz.v1beta1.MsgExec";
  readonly value: Partial<MsgExec>;
}

export function isMsgExecEncodeObject(encodeObject: EncodeObject): encodeObject is MsgExecEncodeObject {
  return (encodeObject as MsgExecEncodeObject).typeUrl === "/cosmos.authz.v1beta1.MsgExec";
}
export interface MsgRevokeEncodeObject extends EncodeObject {
  readonly typeUrl: "/cosmos.authz.v1beta1.MsgRevoke";
  readonly value: Partial<MsgRevoke>;
}

export function isMsgRevokeEncodeObject(encodeObject: EncodeObject): encodeObject is MsgRevokeEncodeObject {
  return (encodeObject as MsgRevokeEncodeObject).typeUrl === "/cosmos.authz.v1beta1.MsgRevoke";
}
