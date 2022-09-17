import { AminoAny, AminoConverters } from "../..";
export interface AminoTxBody extends AminoAny {
    messages: AminoAny[];
    memo: string;
    timeout_height: string;
    extension_options: AminoAny[];
    non_critical_extension_options: AminoAny[];
}
export declare function createTxAminoConverters(): AminoConverters;
