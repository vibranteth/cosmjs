import { TxBodyEncodeObject } from "@cosmjs/proto-signing";
import { TxBody } from "cosmjs-types/cosmos/tx/v1beta1/tx";

import { AminoAny, AminoConverters, AminoTypes } from "../..";

export interface AminoTxBody extends AminoAny {
  messages: AminoAny[];
  memo: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  timeout_height: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  extension_options: AminoAny[];
  // eslint-disable-next-line @typescript-eslint/naming-convention
  non_critical_extension_options: AminoAny[];
}

export function createTxAminoConverters(): AminoConverters {
  return {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "/cosmos.authz.v1beta1.TxBody": {
      encodeAsAminoAny: true,
      aminoType: "cosmos-sdk/TxBody",
      toAmino(msg: TxBodyEncodeObject, aminoTypes: AminoTypes): AminoTxBody {
        return {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          "@type": "/cosmos.authz.v1beta1.TxBody",
          ...aminoTypes.toAmino(msg),
        };
      },
      fromAmino(msg: AminoTxBody, aminoTypes: AminoTypes): TxBody {
        return aminoTypes.fromAmino(msg).value;
      },
    },
  };
}
