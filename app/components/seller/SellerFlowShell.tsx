'use client';
import { useState } from 'react';
import { Header } from './Header';
import { Stepper } from './Stepper';
import { Step1FundsLocked } from './steps/Step1FundsLocked';
import { Step2UploadDocuments } from './steps/Step2UploadDocuments';
import { Step3DocumentCheck } from './steps/Step3DocumentCheck';
import type { Verdict } from '@/lib/escrow/rules';

const TOTAL_STEPS = 3;

// What Step2 hands to Step3. `verdict` is the AUTHORITATIVE result of the real
// deterministic rules engine (via submitBol) when Step2 reached a funded on-chain
// deal; it is `null` when Step2 effectively ran in simulated / no-chain mode, in
// which case Step3 falls back to its clearly-labelled simulation. This is the
// single channel that keeps Step3 honest — it never re-decides the outcome.
export type Step2Result = { verdict: Verdict | null };

export function SellerFlowShell() {
  const [step, setStep] = useState(1);
  // The verdict lifted out of Step2 so Step3 renders THAT instead of running its
  // own independent check. Reset when the seller goes back to re-upload.
  const [result, setResult] = useState<Step2Result>({ verdict: null });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Header step={step} totalSteps={TOTAL_STEPS} />

      <div style={{ display: 'flex' }}>
        <Stepper step={step} />

        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: 'clamp(32px, 6vw, 64px) 24px' }}>
          <div style={{ width: '100%', maxWidth: 640 }}>
            {step === 1 && <Step1FundsLocked onContinue={() => setStep(2)} />}
            {step === 2 && (
              <Step2UploadDocuments
                onSubmitted={(r) => { setResult(r); setStep(3); }}
              />
            )}
            {step === 3 && (
              <Step3DocumentCheck
                verdict={result.verdict}
                onReupload={() => { setResult({ verdict: null }); setStep(2); }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
