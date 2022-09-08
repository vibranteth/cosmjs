/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg } from "@cosmjs/amino";
import { EncodeObject, Registry } from "@cosmjs/proto-signing";

export interface AminoConverter {
  readonly aminoType: string;
  readonly toAmino: (value: any, types : AminoConverters, registry: Registry) => any;
  readonly fromAmino: (value: any) => any;
  readonly requiresCustomAminoType?: boolean;
}

/** A map from protobuf type URL to the AminoConverter implementation if supported on chain */
export type AminoConverters = Record<string, AminoConverter | "not_supported_by_chain">;

export function tryGetConverter(typeUrl : string, register: AminoConverters) : AminoConverter {
  const converter = register[typeUrl];
  if (converter === "not_supported_by_chain") {
    throw new Error(
      `The message type '${typeUrl}' cannot be signed using the Amino JSON sign mode because this is not supported by chain.`,
    );
  }
  if (!converter) {
    throw new Error(
      `Type URL '${typeUrl}' does not exist in the Amino message type register. ` +
        "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
        "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
    );
  }
  return converter;
}

function isAminoConverter(
  converter: [string, AminoConverter | "not_supported_by_chain"],
): converter is [string, AminoConverter] {
  return typeof converter[1] !== "string";
}

/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
export class AminoTypes {
  // The map type here ensures uniqueness of the protobuf type URL in the key.
  // There is no uniqueness guarantee of the Amino type identifier in the type
  // system or constructor. Instead it's the user's responsibility to ensure
  // there is no overlap when fromAmino is called.
  private readonly register: Record<string, AminoConverter | "not_supported_by_chain">;
  private readonly registry: Registry;

  public constructor(types: AminoConverters, registry?: Registry) {
    this.register = types;
    this.registry = registry ?? new Registry();
  }

  public toAmino({ typeUrl, value }: EncodeObject): any {
    let converter = tryGetConverter(typeUrl, this.register);

    if (converter.requiresCustomAminoType) {
      return converter.toAmino(value, this.register, this.registry);
    }

    return {
      type: converter.aminoType,
      value: converter.toAmino(value, this.register, this.registry),
    };
  }

  public fromAmino({ type, value }: AminoMsg): EncodeObject {
    const matches = Object.entries(this.register)
      .filter(isAminoConverter)
      .filter(([_typeUrl, { aminoType }]) => aminoType === type);

    switch (matches.length) {
      case 0: {
        throw new Error(
          `Amino type identifier '${type}' does not exist in the Amino message type register. ` +
            "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
            "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
        );
      }
      case 1: {
        const [typeUrl, converter] = matches[0];
        return {
          typeUrl: typeUrl,
          value: converter.fromAmino(value),
        };
      }
      default:
        throw new Error(
          `Multiple types are registered with Amino type identifier '${type}': '` +
            matches
              .map(([key, _value]) => key)
              .sort()
              .join("', '") +
            "'. Thus fromAmino cannot be performed.",
        );
    }
  }
}
