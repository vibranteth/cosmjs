import { EncodeObject } from "@cosmjs/proto-signing";
export interface AminoConverter {
    readonly aminoType: string;
    readonly toAmino: (value: any, aminoTypes: AminoTypes) => any;
    readonly fromAmino: (value: any, aminoTypes: AminoTypes) => any;
    readonly requiresCustomAminoType?: boolean;
}
/** A map from protobuf type URL to the AminoConverter implementation if supported on chain */
export declare type AminoConverters = Record<string, AminoConverter | "not_supported_by_chain">;
export declare function tryGetConverter(typeUrl: string, register: AminoConverters): AminoConverter;
/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
export declare class AminoTypes {
    private readonly register;
    constructor(types: AminoConverters);
    toAmino({ typeUrl, value }: EncodeObject): any;
    fromAmino(amino: any): EncodeObject;
}
