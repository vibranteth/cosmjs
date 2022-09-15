"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthzAminoConverters = void 0;
const authz_1 = require("cosmjs-types/cosmos/authz/v1beta1/authz");
const any_1 = require("cosmjs-types/google/protobuf/any");
const long_1 = __importDefault(require("long"));
function fromTimestamp(t) {
    let millis = t.seconds.toNumber() * 1000;
    millis += t.nanos / 1000000;
    return new Date(millis);
}
function toTimestamp(date) {
    const seconds = long_1.default.fromNumber(date.getTime() / 1000);
    const nanos = (date.getTime() % 1000) * 1000000;
    return { seconds, nanos };
}
function createAuthzAminoConverters() {
    return {
        "/cosmos.authz.v1beta1.GenericAuthorization": {
            encodeAsAminoAny: true,
            aminoType: "cosmos-sdk/GenericAuthorization",
            toAmino(bytes) {
                return {
                    "@type": "/cosmos.authz.v1beta1.GenericAuthorization",
                    msg: any_1.Any.decode(bytes).typeUrl,
                };
            },
            fromAmino({ msg }) {
                return authz_1.GenericAuthorization.encode(authz_1.GenericAuthorization.fromPartial({
                    msg: msg,
                })).finish();
            },
        },
        "/cosmos.authz.v1beta1.MsgGrant": {
            encodeAsAminoAny: true,
            aminoType: "cosmos-sdk/MsgGrant",
            toAmino({ granter, grantee, grant }, aminoTypes) {
                return {
                    "@type": "/cosmos.authz.v1beta1.MsgGrant",
                    granter: granter,
                    grantee: grantee,
                    grant: grant
                        ? {
                            authorization: grant.authorization ? aminoTypes.toAmino(grant.authorization) : undefined,
                            expiration: grant.expiration ? fromTimestamp(grant.expiration).toISOString() : undefined,
                        }
                        : undefined,
                };
            },
            fromAmino({ granter, grantee, grant }, aminoTypes) {
                return {
                    granter: granter,
                    grantee: grantee,
                    grant: grant
                        ? {
                            authorization: grant.authorization ? aminoTypes.fromAmino(grant.authorization) : undefined,
                            expiration: grant.expiration ? toTimestamp(new Date(grant.expiration)) : undefined,
                        }
                        : undefined,
                };
            },
        },
    };
}
exports.createAuthzAminoConverters = createAuthzAminoConverters;
//# sourceMappingURL=aminomessages.js.map