"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthzAminoConverters = void 0;
function createAuthzAminoConverters() {
    return {
        "/cosmos.authz.v1beta1.MsgExec": {
            requiresCustomAminoType: true,
            aminoType: "cosmos-sdk/MsgExec",
            toAmino: ({ msgs, grantee }) => {
                return {
                    msgs: msgs,
                    grantee: grantee,
                };
            },
            fromAmino: ({ msgs, grantee }) => {
                return {
                    msgs: msgs,
                    grantee: grantee,
                };
            },
        },
        "/cosmos.authz.v1beta1.MsgGrant": {
            requiresCustomAminoType: true,
            aminoType: "cosmos-sdk/MsgGrant",
            toAmino: ({ grant, granter, grantee }) => {
                return {
                    grant: grant,
                    granter: granter,
                    grantee: grantee,
                };
            },
            fromAmino: ({ grant, granter, grantee }) => {
                return {
                    grant: grant,
                    granter: granter,
                    grantee: grantee,
                };
            },
        },
        "/cosmos.authz.v1beta1.MsgRevoke": {
            requiresCustomAminoType: true,
            aminoType: "cosmos-sdk/MsgRevoke",
            toAmino: ({ msgTypeUrl, granter, grantee }) => {
                return {
                    msgTypeUrl: msgTypeUrl,
                    granter: granter,
                    grantee: grantee,
                };
            },
            fromAmino: ({ msgTypeUrl, granter, grantee }) => {
                return {
                    msgTypeUrl: msgTypeUrl,
                    granter: granter,
                    grantee: grantee,
                };
            },
        },
    };
}
exports.createAuthzAminoConverters = createAuthzAminoConverters;
//# sourceMappingURL=aminomessages.js.map