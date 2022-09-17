import { AminoConverters } from "../..";

export function createFeegrantAminoConverters(): AminoConverters {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "/cosmos.feegrant.v1beta1.MsgGrantAllowance": "not_supported_by_chain",
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "/cosmos.feegrant.v1beta1.MsgRevokeAllowance": "not_supported_by_chain",
  };
}
