"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMsgRevokeEncodeObject = exports.isMsgExecEncodeObject = exports.isMsgGrantEncodeObject = exports.authzTypes = void 0;
const tx_1 = require("cosmjs-types/cosmos/authz/v1beta1/tx");
exports.authzTypes = [
    ["/cosmos.authz.v1beta1.MsgExec", tx_1.MsgExec],
    ["/cosmos.authz.v1beta1.MsgGrant", tx_1.MsgGrant],
    ["/cosmos.authz.v1beta1.MsgRevoke", tx_1.MsgRevoke],
];
function isMsgGrantEncodeObject(encodeObject) {
    return encodeObject.typeUrl === "/cosmos.authz.v1beta1.MsgGrant";
}
exports.isMsgGrantEncodeObject = isMsgGrantEncodeObject;
function isMsgExecEncodeObject(encodeObject) {
    return encodeObject.typeUrl === "/cosmos.authz.v1beta1.MsgExec";
}
exports.isMsgExecEncodeObject = isMsgExecEncodeObject;
function isMsgRevokeEncodeObject(encodeObject) {
    return encodeObject.typeUrl === "/cosmos.authz.v1beta1.MsgRevoke";
}
exports.isMsgRevokeEncodeObject = isMsgRevokeEncodeObject;
//# sourceMappingURL=messages.js.map