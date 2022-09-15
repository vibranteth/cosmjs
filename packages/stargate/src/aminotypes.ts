/* eslint-disable @typescript-eslint/naming-convention */

import { EncodeObject } from "@cosmjs/proto-signing";

export interface AminoConverter {
  readonly aminoType: string;
  readonly toAmino: (value: any, aminoTypes: AminoTypes) => any;
  readonly fromAmino: (value: any, aminoTypes: AminoTypes) => any;
  readonly encodeAsAminoAny?: boolean;
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

function isAminoMsgConverter(converter: AminoConverter): boolean {
  return !converter.encodeAsAminoAny;
}

function isAminoAnyConverter(converter: AminoConverter): boolean {
  return converter.encodeAsAminoAny ?? false;
}

export interface AminoMsg {
  readonly type: string;
  readonly value: any;
}
export function isAminoMsg(msg: any): msg is AminoMsg {
  return "type" in msg;
}

export interface AminoAny {
  readonly "@type": string;
  readonly [x: string | number | symbol]: unknown;
}
export function isAminoAny(msg: any): msg is AminoAny {
  return "@type" in msg;
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
  private readonly aminoTypes: Record<string, AminoConverter | "not_supported_by_chain">;

  public constructor(types: AminoConverters) {
    this.aminoTypes = types;
  }

  public toAmino({ typeUrl, value }: EncodeObject): any {
    const converter = tryGetConverter(typeUrl, this.aminoTypes);

    if (converter.encodeAsAminoAny) {
      return converter.toAmino(value, this);
    }

    return {
      type: converter.aminoType,
      value: converter.toAmino(value, this),
    };
  }

  public fromAmino(msg: any): EncodeObject {
    return isAminoMsg(msg) ? this.fromAminoMsg(msg) : this.fromAminoAny(msg);
  }

  public fromAminoMsg(msg: AminoMsg): EncodeObject {
    const aminoMsgMatches = this.getAminoMsgConverterMatches(msg);

    switch (aminoMsgMatches.length) {
      case 1: {
        const [typeUrl, converter] = aminoMsgMatches[0];
        return {
          typeUrl: typeUrl,
          value: converter.fromAmino(msg.value, this),
        };
      }
      case 0: {
        throw new Error(
          `Amino type identifier '${msg.type}' does not exist in the Amino message type register. ` +
            "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
            "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
        );
      }
      default:
        throw new Error(
          `Multiple types are registered with Amino type identifier '${msg.type}': '` +
            aminoMsgMatches
              .map(([key, _value]) => key)
              .sort()
              .join("', '") +
            "'. Thus fromAmino cannot be performed.",
        );
    }
  }

  public fromAminoAny(msg: AminoAny): EncodeObject {
    const aminoAnyMatches = this.getAminoAnyConverterMatches(msg);
    switch (aminoAnyMatches.length) {
      case 1: {
        return {
          typeUrl: msg["@type"],
          value: aminoAnyMatches[0][1].fromAmino(msg, this),
        };
      }
      case 0: {
        throw new Error(
          `Msg Type URL '${msg["@type"]}' does not exist in the Amino message type register. ` +
            "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
            "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.",
        );
      }
    }

    throw new Error(
      `Multiple types are registered with Msg Type URL '${msg["@type"]}': '` +
        aminoAnyMatches
          .map(([key, _value]) => key)
          .sort()
          .join("', '") +
        "'. Thus fromAmino cannot be performed.",
    );
  }

  private getAminoAnyConverterMatches(msg: any): Array<[string, AminoConverter]> {
    return Object.entries(this.aminoTypes)
      .filter(isAminoConverter)
      .filter((aminoConverter) => isAminoAnyConverter(aminoConverter[1]))
      .filter((aminoConverter) => aminoConverter[0] === msg["@type"]);
  }

  private getAminoMsgConverterMatches(msg: any): Array<[string, AminoConverter]> {
    return Object.entries(this.aminoTypes)
      .filter(isAminoConverter)
      .filter((aminoConverter) => isAminoMsgConverter(aminoConverter[1]))
      .filter((aminoConverter) => aminoConverter[1].aminoType === msg.type);
  }
}
