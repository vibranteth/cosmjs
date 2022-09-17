"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMsgRevokeEncodeObject = exports.isMsgExecEncodeObject = exports.isMsgGrantEncodeObject = exports.isGenericAuthorizationEncodeObject = exports.isGrantEncodeObject = exports.authzTypes = void 0;
const authz_1 = require("cosmjs-types/cosmos/authz/v1beta1/authz");
const tx_1 = require("cosmjs-types/cosmos/authz/v1beta1/tx");
exports.authzTypes = [
    ["/cosmos.authz.v1beta1.MsgExec", tx_1.MsgExec],
    ["/cosmos.authz.v1beta1.MsgGrant", tx_1.MsgGrant],
    ["/cosmos.authz.v1beta1.MsgRevoke", tx_1.MsgRevoke],
    ["/cosmos.authz.v1beta1.GenericAuthorization", authz_1.GenericAuthorization],
    ["/cosmos.authz.v1beta1.Grant", authz_1.GenericAuthorization],
];
function isGrantEncodeObject(encodeObject) {
    return encodeObject.typeUrl === "/cosmos.authz.v1beta1.Grant";
}
exports.isGrantEncodeObject = isGrantEncodeObject;
function isGenericAuthorizationEncodeObject(encodeObject) {
    return (encodeObject.typeUrl ===
        "/cosmos.authz.v1beta1.GenericAuthorization");
}
exports.isGenericAuthorizationEncodeObject = isGenericAuthorizationEncodeObject;
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