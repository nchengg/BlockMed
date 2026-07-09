'use client';
import { useState } from 'react';
import { Header } from './Header';
import { Stepper } from './Stepper';
import { Step1FundsLocked } from './steps/Step1FundsLocked';
import { Step2UploadDocuments } from './steps/Step2UploadDocuments';
import { Step3DocumentCheck } from './steps/Step3DocumentCheck';

const TOTAL_STEPS = 3;

export function SellerFlowShell() {
  const [step, setStep] = useState(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Header step={step} totalSteps={TOTAL_STEPS} />

      <div style={{ display: 'flex' }}>
        <Stepper step={step} />

        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: 'clamp(32px, 6vw, 64px) 24px' }}>
          <div style={{ width: '100%', maxWidth: 640 }}>
            {step === 1 && <Step1FundsLocked onContinue={() => setStep(2)} />}
            {step === 2 && <Step2UploadDocuments onSubmitted={() => setStep(3)} />}
            {step === 3 && <Step3DocumentCheck onReupload={() => setStep(2)} />}
          </div>
        </main>
      </div>
    </div>
  );
}
