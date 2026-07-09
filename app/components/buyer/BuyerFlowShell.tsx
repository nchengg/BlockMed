'use client';
import { useState } from 'react';
import { useDeal } from '@/lib/dealStore';
import { Header } from './Header';
import { Stepper } from './Stepper';
import { Step1ConnectWallet } from './steps/Step1ConnectWallet';
import { Step2EnterAmount } from './steps/Step2EnterAmount';
import { Step3ReviewTerms } from './steps/Step3ReviewTerms';
import { Step4ApproveDeposit } from './steps/Step4ApproveDeposit';
import { Step5Confirmation } from './steps/Step5Confirmation';

const TOTAL_STEPS = 5;

export function BuyerFlowShell() {
  const { lockFunds } = useDeal();
  const [step, setStep] = useState(1);
  const [amountRaw, setAmountRaw] = useState('');
  const [amount, setAmount] = useState(0);
  const [confirmedAt, setConfirmedAt] = useState('');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-deep)' }}>
      <Header step={step} totalSteps={TOTAL_STEPS} />

      <div style={{ display: 'flex' }}>
        <Stepper step={step} />

        <main style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: 'clamp(32px, 6vw, 64px) 24px' }}>
          <div style={{ width: '100%', maxWidth: 640 }}>
            {step === 1 && (
              <Step1ConnectWallet onConnected={() => setStep(2)} />
            )}
            {step === 2 && (
              <Step2EnterAmount
                initialAmount={amountRaw}
                onContinue={val => {
                  setAmount(val);
                  setAmountRaw(String(val));
                  setStep(3);
                }}
              />
            )}
            {step === 3 && (
              <Step3ReviewTerms amount={amount} onContinue={() => setStep(4)} />
            )}
            {step === 4 && (
              <Step4ApproveDeposit
                onComplete={() => {
                  lockFunds(amount);
                  setConfirmedAt(new Date().toLocaleString(undefined, {
                    year: 'numeric', month: 'short', day: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  }));
                  setStep(5);
                }}
              />
            )}
            {step === 5 && (
              <Step5Confirmation amount={amount} timestamp={confirmedAt} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
