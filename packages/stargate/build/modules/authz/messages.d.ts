import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { GenericAuthorization, Grant } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
export declare const authzTypes: ReadonlyArray<[string, GeneratedType]>;
export interface GrantEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.Grant";
    readonly value: Partial<Grant>;
}
export declare function isGrantEncodeObject(encodeObject: EncodeObject): encodeObject is GrantEncodeObject;
export interface GenericAuthorizationEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization";
    readonly value: Partial<GenericAuthorization>;
}
export declare function isGenericAuthorizationEncodeObject(encodeObject: EncodeObject): encodeObject is GenericAuthorizationEncodeObject;
export interface MsgGrantEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgGrant";
    readonly value: Partial<MsgGrant>;
}
export declare function isMsgGrantEncodeObject(encodeObject: EncodeObject): encodeObject is MsgGrantEncodeObject;
export interface MsgExecEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgExec";
    readonly value: Partial<MsgExec>;
}
export declare function isMsgExecEncodeObject(encodeObject: EncodeObject): encodeObject is MsgExecEncodeObject;
export interface MsgRevokeEncodeObject extends EncodeObject {
    readonly typeUrl: "/cosmos.authz.v1beta1.MsgRevoke";
    readonly value: Partial<MsgRevoke>;
}
export declare function isMsgRevokeEncodeObject(encodeObject: EncodeObject): encodeObject is MsgRevokeEncodeObject;
