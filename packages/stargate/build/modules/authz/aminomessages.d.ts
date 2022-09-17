import { AminoAny } from "@cosmjs/amino";
import { AminoConverters } from "../../aminotypes";
export interface AminoAuthorization extends AminoAny {
}
export interface AminoGenericAuthorization extends AminoAuthorization {
    readonly msg: string;
}
export interface AminoGrant extends AminoAny {
    "@type": "/cosmos.authz.v1beta1.Grant";
    readonly authorization?: AminoAny;
    readonly expiration?: string;
}
export interface AminoMsgGrant extends AminoAny {
    readonly "@type": "/cosmos.authz.v1beta1.MsgGrant";
    readonly granter: string;
    readonly grantee: string;
    readonly grant?: AminoGrant;
}
export interface AminoMsgExec extends AminoAny {
    readonly "@type": "/cosmos.authz.v1beta1.MsgExec";
    readonly grantee: string;
    readonly msgs: readonly any[];
}
export interface AminoMsgRevoke extends AminoAny {
    readonly "@type": "/cosmos.authz.v1beta1.MsgRevoke";
    readonly granter: string;
    readonly grantee: string;
    readonly msg_type_url: string;
}
export declare function createAuthzAminoConverters(): AminoConverters;
