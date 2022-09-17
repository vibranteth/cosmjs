import { EncodeObject, Registry } from "@cosmjs/proto-signing";
export interface AminoConverter {
    readonly aminoType: string;
    readonly toAmino: (value: any, aminoTypes: AminoTypes) => any;
    readonly fromAmino: (value: any, aminoTypes: AminoTypes) => any;
    readonly encodeAsAminoAny?: boolean;
}
/** A map from protobuf type URL to the AminoConverter implementation if supported on chain */
export declare type AminoConverters = Record<string, AminoConverter | "not_supported_by_chain">;
export declare function tryGetConverter(typeUrl: string, register: AminoConverters): AminoConverter;
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
/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
export declare class AminoTypes {
    private readonly aminoTypes;
    private readonly registry;
    constructor(types: AminoConverters, registry?: Registry);
    toAmino({ typeUrl, value }: EncodeObject): any;
    fromAmino(msg: any): EncodeObject;
    fromAminoMsg(msg: AminoMsg): EncodeObject;
    fromAminoAny(msg: AminoAny): EncodeObject;
    private getAminoAnyConverterMatches;
    private getAminoMsgConverterMatches;
}
