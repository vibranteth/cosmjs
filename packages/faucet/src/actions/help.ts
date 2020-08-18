import { binaryName } from "../constants";

export function help(): void {
  const out = `
Usage: ${binaryName} action [arguments...]

Positional arguments per action are listed below. Arguments in parentheses are optional.

help      Shows a help text and exits

version   Prints the version and exits

generate  Generates a random mnemonic, shows derived faucet addresses and exits

start     Starts the faucet
           1  Node base URL, e.g. http://localhost:1317

Environment variables

FAUCET_CONCURRENCY        Number of distributor accounts. Defaults to 5.
FAUCET_PORT               Port of the webserver. Defaults to 8000.
FAUCET_MEMO               Memo for send transactions. Defaults to unset.
FAUCET_FEE                Fee for send transactions as a comma separated list,
                          e.g. "200ushell,30ureef". Defaults to "2000ucosm".
FAUCET_GAS                Gas for send transactions. Defaults to 80000.
FAUCET_MNEMONIC           Secret mnemonic that serves as the base secret for the
                          faucet HD accounts
FAUCET_ADDRESS_PREFIX     The bech32 address prefix. Defaults to "cosmos".
FAUCET_TOKENS             A comma separated list of tokens configs in the format
                          {DISPLAY}=10^{DIGITS}{base}, e.g.
                          "ATOM=10^6uatom" or "COSM = 10^6ucosm, STAKE = 10^3mstake".
FAUCET_CREDIT_AMOUNT_TKN  Send this amount of TKN to a user requesting TKN. TKN is
                          a placeholder for the token ticker. Defaults to 10.
FAUCET_REFILL_FACTOR      Send factor times credit amount on refilling. Defauls to 8.
FAUCET_REFILL_THRESHOLD   Refill when balance gets below factor times credit amount.
                          Defaults to 20.
`.trim();

  process.stdout.write(`${out}\n`);
}