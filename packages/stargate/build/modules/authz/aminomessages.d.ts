import { AminoAny } from "@cosmjs/amino";
import { AminoConverters } from "../../aminotypes";
export interface AminoAuthorization extends AminoAny {
}
export interface AminoGenericAuthorization extends AminoAuthorization {
    readonly msg: string;
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
export declare function createAuthzAminoConverters(): AminoConverters;
