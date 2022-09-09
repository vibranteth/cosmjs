"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthzAminoConverters = void 0;
const authz_1 = require("cosmjs-types/cosmos/authz/v1beta1/authz");
const any_1 = require("cosmjs-types/google/protobuf/any");
const long_1 = __importDefault(require("long"));
const aminotypes_1 = require("../../aminotypes");
const encoding_1 = require("@cosmjs/encoding");
function toTimestamp(date) {
    const seconds = long_1.default.fromNumber(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    return { seconds, nanos };
}
function fromTimestamp(t) {
    let millis = t.seconds.toNumber() * 1000;
    millis += t.nanos / 1000000;
    return new Date(millis);
}
function toAminoAuthorization(authorization) {
    const { typeUrl, value } = authorization;
    switch (typeUrl) {
        case "/cosmos.authz.v1beta1.GenericAuthorization":
            return authz_1.GenericAuthorization.decode(value);
        default:
            throw new Error("Grant authorization types other than GenericAuthorization are not supported at this time.");
    }
}
function fromAminoAuthorization(authorization) {
    if (!authorization.msgs) {
        throw new Error("Grant authorization types other than GenericAuthorization are not supported at this time.");
    }
    return {
        typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
        value: authorization.msgs
    };
}
function createAuthzAminoConverters() {
    return {
        "/cosmos.authz.v1beta1.MsgGrant": {
            requiresCustomAminoType: true,
            aminoType: "cosmos-sdk/MsgGrant",
            toAmino: ({ grant, granter, grantee }) => {
                return {
                    grant: (!grant) ? undefined : {
                        authorization: (grant.authorization) ? toAminoAuthorization(grant.authorization) : undefined,
                        expiration: (grant.expiration) ? fromTimestamp(grant.expiration).toISOString() : undefined
                    },
                    granter: granter,
                    grantee: grantee
                };
            },
            fromAmino: ({ grant, granter, grantee }) => {
                return {
                    grant: (!grant) ? undefined : authz_1.Grant.fromPartial({
                        authorization: (grant.authorization) ? fromAminoAuthorization(grant.authorization) : undefined,
                        expiration: (grant.expiration) ? toTimestamp(new Date(grant.expiration)) : undefined
                    }),
                    granter: granter,
                    grantee: grantee
                };
            },
        },
        "/cosmos.authz.v1beta1.MsgExec": {
            requiresCustomAminoType: true,
            aminoType: "cosmos-sdk/MsgExec",
            toAmino: ({ grantee, msgs }, register, registry) => {
                return {
                    msgs: Array.isArray(msgs) ? msgs.map((msg) => {
                        var _a;
                        let encodeObject = any_1.Any.toJSON(msg);
                        let generatedType = (_a = registry.lookupType(encodeObject.typeUrl)) === null || _a === void 0 ? void 0 : _a.decode((0, encoding_1.fromBase64)(encodeObject.value));
                        let converter = (0, aminotypes_1.tryGetConverter)(encodeObject.typeUrl, register);
                        return converter.toAmino(generatedType, register, registry);
                    }) : [],
                    grantee: grantee,
                };
            },
            fromAmino: ({ msgs, grantee }) => {
                return {
                    msgs: Array.isArray(msgs) ? msgs.map((e) => any_1.Any.fromJSON(e)) : [],
                    grantee: grantee
                };
            },
        },
        "/cosmos.authz.v1beta1.MsgRevoke": {
            requiresCustomAminoType: true,
            aminoType: "cosmos-sdk/MsgRevoke",
            toAmino: ({ msgTypeUrl, granter, grantee }) => {
                return {
                    msg_type_url: msgTypeUrl,
                    granter: granter,
                    grantee: grantee,
                };
            },
            fromAmino: ({ msg_type_url, granter, grantee }) => {
                return {
                    msgTypeUrl: msg_type_url,
                    granter: granter,
                    grantee: grantee,
                };
            },
        },
    };
}
exports.createAuthzAminoConverters = createAuthzAminoConverters;
//# sourceMappingURL=aminomessages.js.map