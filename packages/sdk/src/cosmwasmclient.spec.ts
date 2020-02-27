/* eslint-disable @typescript-eslint/camelcase */
import { Sha256 } from "@iov/crypto";
import { Bech32, Encoding } from "@iov/encoding";
import { assert, sleep } from "@iov/utils";
import { ReadonlyDate } from "readonly-date";

import { CosmWasmClient } from "./cosmwasmclient";
import { makeSignBytes } from "./encoding";
import { findAttribute } from "./logs";
import { Secp256k1Pen } from "./pen";
import { RestClient } from "./restclient";
import { SigningCosmWasmClient } from "./signingcosmwasmclient";
import cosmoshub from "./testdata/cosmoshub.json";
import {
  getRandomizedHackatom,
  makeRandomAddress,
  pendingWithoutWasmd,
  tendermintIdMatcher,
  wasmdEnabled,
} from "./testutils.spec";
import { CosmosSdkTx, MsgSend, StdFee } from "./types";

const { fromAscii, fromHex, fromUtf8, toAscii } = Encoding;

const httpUrl = "http://localhost:1317";

const faucet = {
  mnemonic:
    "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone",
  pubkey: {
    type: "tendermint/PubKeySecp256k1",
    value: "A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ",
  },
  address: "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6",
};

const unused = {
  address: "cosmos1cjsxept9rkggzxztslae9ndgpdyt2408lk850u",
};

const guest = {
  address: "cosmos17d0jcz59jf68g52vq38tuuncmwwjk42u6mcxej",
};

interface HackatomInstance {
  readonly initMsg: {
    readonly verifier: string;
    readonly beneficiary: string;
  };
  readonly address: string;
}

describe("CosmWasmClient", () => {
  describe("makeReadOnly", () => {
    it("can be constructed", () => {
      const client = new CosmWasmClient(httpUrl);
      expect(client).toBeTruthy();
    });
  });

  describe("chainId", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      expect(await client.chainId()).toEqual("testing");
    });
  });

  describe("getNonce", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      expect(await client.getNonce(unused.address)).toEqual({
        accountNumber: 5,
        sequence: 0,
      });
    });

    it("throws for missing accounts", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const missing = makeRandomAddress();
      await client.getNonce(missing).then(
        () => fail("this must not succeed"),
        error => expect(error).toMatch(/account does not exist on chain/i),
      );
    });
  });

  describe("getAccount", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      expect(await client.getAccount(unused.address)).toEqual({
        address: unused.address,
        account_number: 5,
        sequence: 0,
        public_key: "",
        coins: [
          { denom: "ucosm", amount: "1000000000" },
          { denom: "ustake", amount: "1000000000" },
        ],
      });
    });

    it("returns undefined for missing accounts", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const missing = makeRandomAddress();
      expect(await client.getAccount(missing)).toBeUndefined();
    });
  });

  describe("getBlock", () => {
    it("works for latest block", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const response = await client.getBlock();

      // id
      expect(response.block_id.hash).toMatch(tendermintIdMatcher);

      // header
      expect(parseInt(response.block.header.height, 10)).toBeGreaterThanOrEqual(1);
      expect(response.block.header.chain_id).toEqual(await client.chainId());
      expect(new ReadonlyDate(response.block.header.time).getTime()).toBeLessThan(ReadonlyDate.now());
      expect(new ReadonlyDate(response.block.header.time).getTime()).toBeGreaterThanOrEqual(
        ReadonlyDate.now() - 5_000,
      );

      // data
      expect(response.block.data.txs === null || Array.isArray(response.block.data.txs)).toEqual(true);
    });

    it("works for block by height", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const height = parseInt((await client.getBlock()).block.header.height, 10);
      const response = await client.getBlock(height - 1);

      // id
      expect(response.block_id.hash).toMatch(tendermintIdMatcher);

      // header
      expect(response.block.header.height).toEqual(`${height - 1}`);
      expect(response.block.header.chain_id).toEqual(await client.chainId());
      expect(new ReadonlyDate(response.block.header.time).getTime()).toBeLessThan(ReadonlyDate.now());
      expect(new ReadonlyDate(response.block.header.time).getTime()).toBeGreaterThanOrEqual(
        ReadonlyDate.now() - 5_000,
      );

      // data
      expect(response.block.data.txs === null || Array.isArray(response.block.data.txs)).toEqual(true);
    });
  });

  describe("getIdentifier", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      expect(await client.getIdentifier(cosmoshub.tx)).toEqual(cosmoshub.id);
    });
  });

  describe("postTx", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const pen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
      const client = new CosmWasmClient(httpUrl);

      const memo = "My first contract on chain";
      const sendMsg: MsgSend = {
        type: "cosmos-sdk/MsgSend",
        value: {
          from_address: faucet.address,
          to_address: makeRandomAddress(),
          amount: [
            {
              denom: "ucosm",
              amount: "1234567",
            },
          ],
        },
      };

      const fee: StdFee = {
        amount: [
          {
            amount: "5000",
            denom: "ucosm",
          },
        ],
        gas: "890000",
      };

      const chainId = await client.chainId();
      const { accountNumber, sequence } = await client.getNonce(faucet.address);
      const signBytes = makeSignBytes([sendMsg], fee, chainId, memo, accountNumber, sequence);
      const signature = await pen.sign(signBytes);
      const signedTx = {
        msg: [sendMsg],
        fee: fee,
        memo: memo,
        signatures: [signature],
      };
      const { logs, transactionHash } = await client.postTx(signedTx);
      const amountAttr = findAttribute(logs, "transfer", "amount");
      expect(amountAttr.value).toEqual("1234567ucosm");
      expect(transactionHash).toMatch(/^[0-9A-F]{64}$/);
    });
  });

  describe("searchTx", () => {
    let posted:
      | {
          readonly sender: string;
          readonly recipient: string;
          readonly hash: string;
          readonly height: number;
          readonly tx: CosmosSdkTx;
        }
      | undefined;

    beforeAll(async () => {
      if (wasmdEnabled()) {
        const pen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
        const client = new SigningCosmWasmClient(httpUrl, faucet.address, signBytes => pen.sign(signBytes));

        const recipient = makeRandomAddress();
        const transferAmount = [
          {
            denom: "ucosm",
            amount: "1234567",
          },
        ];
        const result = await client.sendTokens(recipient, transferAmount);

        await sleep(50); // wait until tx is indexed
        const txDetails = await new RestClient(httpUrl).txsById(result.transactionHash);
        posted = {
          sender: faucet.address,
          recipient: recipient,
          hash: result.transactionHash,
          height: Number.parseInt(txDetails.height, 10),
          tx: txDetails.tx,
        };
      }
    });

    it("can search by ID", async () => {
      pendingWithoutWasmd();
      assert(posted, "value must be set in beforeAll()");
      const client = new CosmWasmClient(httpUrl);
      const result = await client.searchTx({ id: posted.hash });
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(
        jasmine.objectContaining({
          height: posted.height.toString(),
          txhash: posted.hash,
          tx: posted.tx,
        }),
      );
    });

    it("can search by ID (non existent)", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const nonExistentId = "0000000000000000000000000000000000000000000000000000000000000000";
      const result = await client.searchTx({ id: nonExistentId });
      expect(result.length).toEqual(0);
    });

    it("can search by height", async () => {
      pendingWithoutWasmd();
      assert(posted, "value must be set in beforeAll()");
      const client = new CosmWasmClient(httpUrl);
      const result = await client.searchTx({ height: posted.height });
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(
        jasmine.objectContaining({
          height: posted.height.toString(),
          txhash: posted.hash,
          tx: posted.tx,
        }),
      );
    });

    it("can search by sender", async () => {
      pendingWithoutWasmd();
      assert(posted, "value must be set in beforeAll()");
      const client = new CosmWasmClient(httpUrl);
      const result = await client.searchTx({ sentFromOrTo: posted.sender });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[result.length - 1]).toEqual(
        jasmine.objectContaining({
          height: posted.height.toString(),
          txhash: posted.hash,
          tx: posted.tx,
        }),
      );
    });

    it("can search by recipient", async () => {
      pendingWithoutWasmd();
      assert(posted, "value must be set in beforeAll()");
      const client = new CosmWasmClient(httpUrl);
      const result = await client.searchTx({ sentFromOrTo: posted.recipient });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[result.length - 1]).toEqual(
        jasmine.objectContaining({
          height: posted.height.toString(),
          txhash: posted.hash,
          tx: posted.tx,
        }),
      );
    });

    it("can search by ID and filter by minHeight", async () => {
      pendingWithoutWasmd();
      assert(posted);
      const client = new CosmWasmClient(httpUrl);
      const query = { id: posted.hash };

      {
        const result = await client.searchTx(query, { minHeight: 0 });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { minHeight: posted.height - 1 });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { minHeight: posted.height });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { minHeight: posted.height + 1 });
        expect(result.length).toEqual(0);
      }
    });

    it("can search by recipient and filter by minHeight", async () => {
      pendingWithoutWasmd();
      assert(posted);
      const client = new CosmWasmClient(httpUrl);
      const query = { sentFromOrTo: posted.recipient };

      {
        const result = await client.searchTx(query, { minHeight: 0 });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { minHeight: posted.height - 1 });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { minHeight: posted.height });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { minHeight: posted.height + 1 });
        expect(result.length).toEqual(0);
      }
    });

    it("can search by recipient and filter by maxHeight", async () => {
      pendingWithoutWasmd();
      assert(posted);
      const client = new CosmWasmClient(httpUrl);
      const query = { sentFromOrTo: posted.recipient };

      {
        const result = await client.searchTx(query, { maxHeight: 9999999999999 });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { maxHeight: posted.height + 1 });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { maxHeight: posted.height });
        expect(result.length).toEqual(1);
      }

      {
        const result = await client.searchTx(query, { maxHeight: posted.height - 1 });
        expect(result.length).toEqual(0);
      }
    });
  });

  describe("getCodes", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const result = await client.getCodes();
      expect(result.length).toBeGreaterThanOrEqual(1);
      const [first] = result;
      expect(first).toEqual({
        id: 1,
        checksum: "aff8c8873d79d2153a8b9066a0683fec3c903669267eb806ffa831dcd4b3daae",
        source: undefined,
        builder: undefined,
        creator: faucet.address,
      });
    });
  });

  describe("getCodeDetails", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const result = await client.getCodeDetails(1);
      const checksum = new Sha256(result.wasm).digest();
      expect(checksum).toEqual(fromHex("aff8c8873d79d2153a8b9066a0683fec3c903669267eb806ffa831dcd4b3daae"));
    });
  });

  describe("getContracts", () => {
    it("works", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const result = await client.getContracts(1);
      expect(result.length).toBeGreaterThanOrEqual(3);
      const [jade, hash, isa] = result;
      expect(hash).toEqual({
        address: "cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5",
        codeId: 1,
        creator: faucet.address,
      });
      expect(isa).toEqual({
        address: "cosmos1hqrdl6wstt8qzshwc6mrumpjk9338k0lr4dqxd",
        codeId: 1,
        creator: faucet.address,
      });
      expect(jade).toEqual({
        address: "cosmos18r5szma8hm93pvx6lwpjwyxruw27e0k5uw835c",
        codeId: 1,
        creator: faucet.address,
      });
    });
  });

  describe("getContract", () => {
    it("works for HASH instance", async () => {
      pendingWithoutWasmd();
      const client = new CosmWasmClient(httpUrl);
      const hash = await client.getContract("cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5");
      expect(hash).toEqual({
        address: "cosmos18vd8fpwxzck93qlwghaj6arh4p7c5n89uzcee5",
        codeId: 1,
        creator: faucet.address,
        initMsg: {
          decimals: 5,
          name: "Hash token",
          symbol: "HASH",
          initial_balances: [
            {
              address: faucet.address,
              amount: "11",
            },
            {
              address: unused.address,
              amount: "12812345",
            },
            {
              address: guest.address,
              amount: "22004000000",
            },
          ],
        },
      });
    });
  });

  describe("queryContractRaw", () => {
    const configKey = toAscii("config");
    const otherKey = toAscii("this_does_not_exist");
    let contract: HackatomInstance | undefined;

    beforeAll(async () => {
      if (wasmdEnabled()) {
        pendingWithoutWasmd();
        const pen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
        const client = new SigningCosmWasmClient(httpUrl, faucet.address, signBytes => pen.sign(signBytes));
        const { codeId } = await client.upload(getRandomizedHackatom());
        const initMsg = { verifier: makeRandomAddress(), beneficiary: makeRandomAddress() };
        const contractAddress = await client.instantiate(codeId, initMsg, "random hackatom");
        contract = { initMsg: initMsg, address: contractAddress };
      }
    });

    it("can query existing key", async () => {
      pendingWithoutWasmd();
      assert(contract);

      const client = new CosmWasmClient(httpUrl);
      const raw = await client.queryContractRaw(contract.address, configKey);
      assert(raw, "must get result");
      expect(JSON.parse(fromUtf8(raw))).toEqual({
        verifier: Array.from(Bech32.decode(contract.initMsg.verifier).data),
        beneficiary: Array.from(Bech32.decode(contract.initMsg.beneficiary).data),
        funder: Array.from(Bech32.decode(faucet.address).data),
      });
    });

    it("can query non-existent key", async () => {
      pendingWithoutWasmd();
      assert(contract);

      const client = new CosmWasmClient(httpUrl);
      const raw = await client.queryContractRaw(contract.address, otherKey);
      expect(raw).toBeNull();
    });

    it("errors for non-existent contract", async () => {
      pendingWithoutWasmd();
      assert(contract);

      const nonExistentAddress = makeRandomAddress();
      const client = new CosmWasmClient(httpUrl);
      await client.queryContractRaw(nonExistentAddress, configKey).then(
        () => fail("must not succeed"),
        error => expect(error).toMatch(`No contract found at address "${nonExistentAddress}"`),
      );
    });
  });

  describe("queryContractSmart", () => {
    let contract: HackatomInstance | undefined;

    beforeAll(async () => {
      if (wasmdEnabled()) {
        pendingWithoutWasmd();
        const pen = await Secp256k1Pen.fromMnemonic(faucet.mnemonic);
        const client = new SigningCosmWasmClient(httpUrl, faucet.address, signBytes => pen.sign(signBytes));
        const { codeId } = await client.upload(getRandomizedHackatom());
        const initMsg = { verifier: makeRandomAddress(), beneficiary: makeRandomAddress() };
        const contractAddress = await client.instantiate(codeId, initMsg, "a different hackatom");
        contract = { initMsg: initMsg, address: contractAddress };
      }
    });

    it("works", async () => {
      pendingWithoutWasmd();
      assert(contract);

      const client = new CosmWasmClient(httpUrl);
      const verifier = await client.queryContractSmart(contract.address, { verifier: {} });
      expect(fromAscii(verifier)).toEqual(contract.initMsg.verifier);
    });

    it("errors for malformed query message", async () => {
      pendingWithoutWasmd();
      assert(contract);

      const client = new CosmWasmClient(httpUrl);
      await client.queryContractSmart(contract.address, { broken: {} }).then(
        () => fail("must not succeed"),
        error => expect(error).toMatch(/Error parsing QueryMsg/i),
      );
    });

    it("errors for non-existent contract", async () => {
      pendingWithoutWasmd();

      const nonExistentAddress = makeRandomAddress();
      const client = new CosmWasmClient(httpUrl);
      await client.queryContractSmart(nonExistentAddress, { verifier: {} }).then(
        () => fail("must not succeed"),
        error => expect(error).toMatch(`No contract found at address "${nonExistentAddress}"`),
      );
    });
  });
});