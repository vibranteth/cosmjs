import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { AminoConverters } from "../../aminotypes";
export interface AminoMsgGrant {
    readonly granter: string;
    readonly grantee: string;
    readonly grant?: {
        readonly authorization?: GenericAuthorization;
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
export declare function createAuthzAminoConverters(): AminoConverters;
