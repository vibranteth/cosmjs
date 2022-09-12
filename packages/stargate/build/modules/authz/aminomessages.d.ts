import { AminoConverters } from "../../aminotypes";
export interface AminoAny {
    readonly "@type": string;
    readonly [x: string | number | symbol]: unknown;
}
export interface AminoAuthorization extends AminoAny {
    readonly "@type": string;
}
export interface AminoGenericAuthorization extends AminoAuthorization {
    readonly "@type": string;
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
