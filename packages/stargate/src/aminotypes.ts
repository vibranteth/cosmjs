/* eslint-disable @typescript-eslint/naming-convention */
import { EncodeObject } from "@cosmjs/proto-signing";

export interface AminoConverter {
  readonly aminoType: string;
  readonly toAmino: (value: any, aminoTypes: AminoTypes) => any;
  readonly fromAmino: (value: any, aminoTypes: AminoTypes) => any;
  readonly requiresCustomAminoType?: boolean;
}

/** A map from protobuf type URL to the AminoConverter implementation if supported on chain */
export type AminoConverters = Record<string, AminoConverter | "not_supported_by_chain">;

export function tryGetConverter(typeUrl: string, register: AminoConverters): AminoConverter {
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

  public constructor(types: AminoConverters) {
    this.register = types;
  }

  public toAmino({ typeUrl, value }: EncodeObject): any {
    const converter = tryGetConverter(typeUrl, this.register);

    if (converter.requiresCustomAminoType) {
      return converter.toAmino(value, this);
    }

    return {
      type: converter.aminoType,
      value: converter.toAmino(value, this),
    };
  }

  public fromAmino(amino: any): EncodeObject {
    if (amino.type) {
      const matches = Object.entries(this.register)
        .filter(isAminoConverter)
        .filter(([_typeUrl, { aminoType }]) => aminoType === amino.type);

      switch (matches.length) {
        case 0: {
          throw new Error(
            `Amino type identifier '${amino.type}' does not exist in the Amino message type register. ` +
              "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
              "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
          );
        }
        case 1: {
          const [typeUrl, converter] = matches[0];
          return {
            typeUrl: typeUrl,
            value: converter.fromAmino(amino.value, this),
          };
        }
        default:
          throw new Error(
            `Multiple types are registered with Amino type identifier '${amino.type}': '` +
              matches
                .map(([key, _value]) => key)
                .sort()
                .join("', '") +
              "'. Thus fromAmino cannot be performed.",
          );
      }
    } else if (amino["@type"]) {
      const converter = tryGetConverter(amino["@type"], this.register);

      return {
        typeUrl: amino["@type"],
        value: converter.fromAmino(amino, this),
      };
    }

    throw new Error("Amino type does not exist in the Amino message type register.");
  }
}
