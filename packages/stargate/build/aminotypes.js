"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AminoTypes = exports.tryGetConverter = void 0;
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
/**
 * A map from Stargate message types as used in the messages's `Any` type
 * to Amino types.
 */
class AminoTypes {
    constructor(types) {
        this.register = types;
    }
    toAmino({ typeUrl, value }) {
        const converter = tryGetConverter(typeUrl, this.register);
        if (converter.requiresCustomAminoType) {
            return converter.toAmino(value, this);
        }
        return {
            type: converter.aminoType,
            value: converter.toAmino(value, this),
        };
    }
    fromAmino(amino) {
        if (amino.type) {
            const matches = Object.entries(this.register)
                .filter(isAminoConverter)
                .filter(([_typeUrl, { aminoType }]) => aminoType === amino.type);
            switch (matches.length) {
                case 0: {
                    throw new Error(`Amino type identifier '${amino.type}' does not exist in the Amino message type register. ` +
                        "If you need support for this message type, you can pass in additional entries to the AminoTypes constructor. " +
                        "If you think this message type should be included by default, please open an issue at https://github.com/cosmos/cosmjs/issues.");
                }
                case 1: {
                    const [typeUrl, converter] = matches[0];
                    return {
                        typeUrl: typeUrl,
                        value: converter.fromAmino(amino.value, this),
                    };
                }
                default:
                    throw new Error(`Multiple types are registered with Amino type identifier '${amino.type}': '` +
                        matches
                            .map(([key, _value]) => key)
                            .sort()
                            .join("', '") +
                        "'. Thus fromAmino cannot be performed.");
            }
        }
        else if (amino["@type"]) {
            const converter = tryGetConverter(amino["@type"], this.register);
            return {
                typeUrl: amino["@type"],
                value: converter.fromAmino(amino, this),
            };
        }
        throw new Error("Amino type does not exist in the Amino message type register.");
    }
}
exports.AminoTypes = AminoTypes;
//# sourceMappingURL=aminotypes.js.map