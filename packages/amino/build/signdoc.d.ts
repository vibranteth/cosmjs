import { Coin } from "./coins";
export interface AminoMsg {
    readonly type: string;
    readonly value: any;
}
export declare function isAminoMsg(msg: any): msg is AminoMsg;
export interface AminoAny {
    readonly "@type": string;
    readonly [x: string | number | symbol]: unknown;
}
export declare function isAminoAny(msg: any): msg is AminoAny;
export interface StdFee {
    readonly amount: readonly Coin[];
    readonly gas: string;
    /** The granter address that is used for paying with feegrants */
    readonly granter?: string;
    /** The fee payer address. The payer must have signed the transaction. */
    readonly payer?: string;
}
/**
 * The document to be signed
 *
 * @see https://docs.cosmos.network/master/modules/auth/03_types.html#stdsigndoc
 */
export interface StdSignDoc {
    readonly chain_id: string;
    readonly account_number: string;
    readonly sequence: string;
    readonly fee: StdFee;
    readonly msgs: readonly any[];
    readonly memo: string;
}
/** Returns a JSON string with objects sorted by key */
export declare function sortedJsonStringify(obj: any): string;
export declare function makeSignDoc(msgs: readonly any[], fee: StdFee, chainId: string, memo: string | undefined, accountNumber: number | string, sequence: number | string): StdSignDoc;
export declare function serializeSignDoc(signDoc: StdSignDoc): Uint8Array;
