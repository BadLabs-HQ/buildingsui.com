import { useEffect, useRef, useState } from 'react';
import { useCurrentAccount, useDAppKit } from '@mysten/dapp-kit-react';
import { ConnectButton } from '@mysten/dapp-kit-react/ui';
import type { WriteBlobFlow } from '@mysten/walrus';
import { CURATOR_ADDRESS, WALRUS } from '../config';
import { prepareMemeUpload } from '../lib/walrusUpload';
import { noPhantom } from '../lib/wallets';

type Stage = 'pick' | 'encoding' | 'ready' | 'storing' | 'stored' | 'submitting' | 'done';

// Each wallet popup gets its own click, so browsers never block it.
// Step 1 registers and uploads the blob. Step 2 certifies it and hands it to the curator for review.
export function SubmitMeme({ onClose }: { onClose: () => void }) {
  const account = useCurrentAccount();
  const dAppKit = useDAppKit();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('pick');
  const [error, setError] = useState<string | null>(null);
  const [blobId, setBlobId] = useState<string | null>(null);
  const flowRef = useRef<WriteBlobFlow | null>(null);
  const blobObjectRef = useRef<string | null>(null);

  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  const pick = async (f: File | undefined) => {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith('image/')) return setError('Images only: PNG, JPG, GIF, WEBP or SVG.');
    if (f.size > WALRUS.maxMemeBytes) return setError('Max size is 5 MB.');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStage('encoding');
    try {
      const { flow, blobId } = await prepareMemeUpload(f);
      flowRef.current = flow;
      setBlobId(blobId);
      setStage('ready');
    } catch (e) {
      setError(`Could not prepare the file. ${(e as Error).message}`);
      setStage('pick');
    }
  };

  const store = async () => {
    const flow = flowRef.current;
    if (!flow || !account) return;
    setError(null);
    setStage('storing');
    try {
      const tx = flow.register({ epochs: WALRUS.memeEpochs, deletable: true, owner: account.address });
      const res = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (res.FailedTransaction) throw new Error(res.FailedTransaction.status.error?.message ?? 'Transaction failed');
      const up = await flow.upload({ digest: res.Transaction.digest });
      blobObjectRef.current = up.blobObjectId;
      setStage('stored');
    } catch (e) {
      setError(friendly(e));
      setStage('ready');
    }
  };

  const submit = async () => {
    const flow = flowRef.current;
    if (!flow || !blobObjectRef.current) return;
    setError(null);
    setStage('submitting');
    try {
      const tx = flow.certify();
      if (CURATOR_ADDRESS) tx.transferObjects([tx.object(blobObjectRef.current)], CURATOR_ADDRESS);
      const res = await dAppKit.signAndExecuteTransaction({ transaction: tx });
      if (res.FailedTransaction) throw new Error(res.FailedTransaction.status.error?.message ?? 'Transaction failed');
      setStage('done');
    } catch (e) {
      setError(friendly(e));
      setStage('stored');
    }
  };

  const busy = stage === 'encoding' || stage === 'storing' || stage === 'submitting';

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Submit a meme" onClick={() => !busy && onClose()}>
      <div className="submit-panel" onClick={(e) => e.stopPropagation()}>
        <div className="submit-head">
          <h3>Submit a meme</h3>
          <button className="icon-btn" onClick={onClose} disabled={busy} aria-label="Close">✕</button>
        </div>

        {!account ? (
          <div className="submit-body center">
            <p>Connect your wallet to submit. Your meme is stored on Walrus and paid from your wallet.</p>
            <ConnectButton modalOptions={noPhantom}>
              <span>Connect Wallet</span>
            </ConnectButton>
          </div>
        ) : (
          <div className="submit-body">
            <label className={`dropzone ${preview ? 'has-file' : ''}`}>
              {preview ? <img src={preview} alt="Your meme preview" /> : <span>Drop an image here or click to choose</span>}
              <input type="file" accept="image/*" disabled={busy || stage === 'stored' || stage === 'done'} onChange={(e) => pick(e.target.files?.[0])} />
            </label>

            <ol className="steps">
              <li className={stepClass(stage, ['encoding'], ['ready', 'storing', 'stored', 'submitting', 'done'])}>
                Prepare file {file && <span className="muted small">({(file.size / 1024).toFixed(0)} KB)</span>}
              </li>
              <li className={stepClass(stage, ['storing'], ['stored', 'submitting', 'done'])}>Store on Walrus (wallet approval 1 of 2)</li>
              <li className={stepClass(stage, ['submitting'], ['done'])}>Submit for review (wallet approval 2 of 2)</li>
            </ol>

            {stage === 'ready' && <button className="btn btn-hazard wide" onClick={store}>Approve storage</button>}
            {stage === 'stored' && <button className="btn btn-hazard wide" onClick={submit}>Submit for review</button>}
            {busy && <button className="btn btn-ghost wide" disabled>Working…</button>}
            {stage === 'done' && (
              <div className="done-note">
                <b>Sent to the crew for review.</b> It goes live on the wall once approved.
                {blobId && <code className="mono small">Blob ID: {blobId}</code>}
              </div>
            )}

            {error && <p className="error">{error}</p>}
            <p className="muted small">
              Storing costs a small amount of WAL plus SUI for gas. Memes are public and kept for about a year.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function stepClass(stage: Stage, active: Stage[], done: Stage[]) {
  if (done.includes(stage)) return 'done';
  if (active.includes(stage)) return 'active';
  return '';
}

function friendly(e: unknown) {
  const msg = (e as Error)?.message ?? String(e);
  if (/reject|denied|cancel/i.test(msg)) return 'You declined in your wallet. Nothing was charged.';
  if (/WAL|insufficient|balance/i.test(msg)) return 'Not enough WAL or SUI in your wallet to pay for storage.';
  return msg;
}
