"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AminoTypes = exports.isAminoAny = exports.isAminoMsg = exports.tryGetConverter = void 0;
const proto_signing_1 = require("@cosmjs/proto-signing");
function tryGetConverter(typeUrl, register) {
    const converter = register[typeUrl];
    if (converter === "not_supported_by_chain") {
        throw new Error(`The message type '${typeUrl}' cannot be signed using the Amino JSON sign mode because this is not supported by chain.`);
    }
    if (!converter) {
        throw new Error(`Type URL '${typeUrl}' does not exist in the Amino message type register. ` +
            "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
            "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.");
    }
    return converter;
}
exports.tryGetConverter = tryGetConverter;
function isAminoConverter(converter) {
    return typeof converter[1] !== "string";
}
function isAminoMsgConverter(converter) {
    return !converter.encodeAsAminoAny;
}
function isAminoAnyConverter(converter) {
    var _a;
    return (_a = converter.encodeAsAminoAny) !== null && _a !== void 0 ? _a : false;
}
function isAminoMsg(msg) {
    return "type" in msg;
}
exports.isAminoMsg = isAminoMsg;
function isAminoAny(msg) {
    return "@type" in msg;
}
exports.isAminoAny = isAminoAny;
/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
class AminoTypes {
    constructor(types, registry) {
        this.aminoTypes = types;
        this.registry = registry !== null && registry !== void 0 ? registry : new proto_signing_1.Registry();
    }
    toAmino({ typeUrl, value }) {
        const converter = tryGetConverter(typeUrl, this.aminoTypes);
        if (isAminoAnyConverter(converter)) {
            return converter.toAmino(value, this);
        }
        return {
            type: converter.aminoType,
            value: converter.toAmino(value, this),
        };
    }
    fromAmino(msg) {
        return isAminoMsg(msg) ? this.fromAminoMsg(msg) : this.fromAminoAny(msg);
    }
    fromAminoMsg(msg) {
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
                throw new Error(`Amino type identifier '${msg.type}' does not exist in the Amino message type register. ` +
                    "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
                    "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.");
            }
            default:
                throw new Error(`Multiple types are registered with Amino type identifier '${msg.type}': '` +
                    aminoMsgMatches
                        .map(([key, _value]) => key)
                        .sort()
                        .join("', '") +
                    "'. Thus fromAmino cannot be performed.");
        }
    }
    fromAminoAny(msg) {
        const aminoAnyMatches = this.getAminoAnyConverterMatches(msg);
        switch (aminoAnyMatches.length) {
            case 1: {
                return {
                    typeUrl: msg["@type"],
                    value: aminoAnyMatches[0][1].fromAmino(msg, this),
                };
            }
            case 0: {
                throw new Error(`Msg Type URL '${msg["@type"]}' does not exist in the Amino message type register. ` +
                    "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
                    "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.");
            }
        }
        throw new Error(`Multiple types are registered with Msg Type URL '${msg["@type"]}': '` +
            aminoAnyMatches
                .map(([key, _value]) => key)
                .sort()
                .join("', '") +
            "'. Thus fromAmino cannot be performed.");
    }
    getAminoAnyConverterMatches(msg) {
        return Object.entries(this.aminoTypes)
            .filter(isAminoConverter)
            .filter((aminoConverter) => isAminoAnyConverter(aminoConverter[1]))
            .filter((aminoConverter) => aminoConverter[0] === msg["@type"]);
    }
    getAminoMsgConverterMatches(msg) {
        return Object.entries(this.aminoTypes)
            .filter(isAminoConverter)
            .filter((aminoConverter) => isAminoMsgConverter(aminoConverter[1]))
            .filter((aminoConverter) => aminoConverter[1].aminoType === msg.type);
    }
}
exports.AminoTypes = AminoTypes;
//# sourceMappingURL=aminotypes.js.map