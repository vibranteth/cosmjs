import { Grant } from "cosmjs-types/cosmos/authz/v1beta1/authz";
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
export declare function createAuthzAminoConverters(): AminoConverters;
