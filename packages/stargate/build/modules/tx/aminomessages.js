"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTxAminoConverters = void 0;
function createTxAminoConverters() {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "/cosmos.authz.v1beta1.TxBody": {
            encodeAsAminoAny: true,
            aminoType: "cosmos-sdk/TxBody",
            toAmino(msg, aminoTypes) {
                return {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    "@type": "/cosmos.authz.v1beta1.TxBody",
                    ...aminoTypes.toAmino(msg),
                };
            },
            fromAmino(msg, aminoTypes) {
                return aminoTypes.fromAmino(msg).value;
            },
        },
    };
}
exports.createTxAminoConverters = createTxAminoConverters;
//# sourceMappingURL=aminomessages.js.map