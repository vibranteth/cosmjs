import { AminoMsg } from "@cosmjs/amino";
import { EncodeObject, Registry } from "@cosmjs/proto-signing";
export interface AminoConverter {
    readonly aminoType: string;
    readonly toAmino: (value: any, types: AminoConverters, registry: Registry) => any;
    readonly fromAmino: (value: any) => any;
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
    private readonly registry;
    constructor(types: AminoConverters, registry?: Registry);
    toAmino({ typeUrl, value }: EncodeObject): any;
    fromAmino({ type, value }: AminoMsg): EncodeObject;
}
