import { EncodeObject, GeneratedType } from "@cosmjs/proto-signing";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
export declare const authzTypes: ReadonlyArray<[string, GeneratedType]>;
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
