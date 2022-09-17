"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeegrantAminoConverters = void 0;
function createFeegrantAminoConverters() {
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "/cosmos.feegrant.v1beta1.MsgGrantAllowance": "not_supported_by_chain",
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "/cosmos.feegrant.v1beta1.MsgRevokeAllowance": "not_supported_by_chain",
    };
}
exports.createFeegrantAminoConverters = createFeegrantAminoConverters;
//# sourceMappingURL=aminomessages.js.map