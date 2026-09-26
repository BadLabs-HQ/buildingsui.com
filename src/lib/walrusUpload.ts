import { SuiGrpcClient } from '@mysten/sui/grpc';
import type { WriteBlobFlow } from '@mysten/walrus';
import { SUI_RPC, WALRUS } from '../config';

// The Walrus SDK and its WASM encoder are heavy, so they load only when someone submits a meme.
let clientPromise: Promise<{ writeBlobFlow: (o: { blob: Uint8Array }) => WriteBlobFlow }> | null = null;

async function getWalrus() {
  clientPromise ??= (async () => {
    const [{ walrus }, wasm] = await Promise.all([
      import('@mysten/walrus'),
      import('@mysten/walrus-wasm/web/walrus_wasm_bg.wasm?url'),
    ]);
    const client = new SuiGrpcClient({ network: 'mainnet', baseUrl: SUI_RPC }).$extend(
      walrus({
        wasmUrl: wasm.default,
        uploadRelay: { host: WALRUS.uploadRelay, sendTip: { max: 10_000_000 } },
      }),
    );
    return client.walrus;
  })();
  return clientPromise;
}

export async function prepareMemeUpload(file: File) {
  const walrus = await getWalrus();
  const flow = walrus.writeBlobFlow({ blob: new Uint8Array(await file.arrayBuffer()) });
  const encoded = await flow.encode();
  return { flow, blobId: encoded.blobId };
}
