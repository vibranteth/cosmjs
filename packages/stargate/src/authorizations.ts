// import { assert } from "@cosmjs/utils";
// import { GenericAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
// import { Any } from "cosmjs-types/google/protobuf/any";

// import { AminoAuthorization } from "./modules/authz/aminomessages";

// export function authorizationFromAny(input: Any): AminoAuthorization {
//   const { typeUrl, value } = input;

//   switch (typeUrl) {
//     // authz

//     case "/cosmos.authz.v1beta1.GenericAuthorization": {
//       const authorization = GenericAuthorization.decode(value);
//       return {
//         "@type": "/cosmos.authz.v1beta1.GenericAuthorization",
//         msg: authorization.msg ?? ""
//     }

//     // bank
//     case "/cosmos.bank.v1beta1.SendAuthorization": {
//       const authorization = SendAuthorization.decode(value).baseAuthorization;
//       assert(baseAuthorization);
//       return authorizationFromBaseAuthorization(baseAuthorization);
//     }

//     // staking
//     case "/cosmos.staking.v1beta1.StakeAuthorization": {
//       const baseAuthorization = ModuleAccount.decode(value).baseAuthorization;
//       assert(baseAuthorization);
//       return authorizationFromBaseAuthorization(baseAuthorization);
//     }

//     default:
//       throw new Error(`Unsupported type: '${typeUrl}'`);
//   }
// }
