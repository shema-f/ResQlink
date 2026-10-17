import React, { useState } from 'react';
import { apiService } from '../services/api';
import { ShieldCheck, Phone, CheckCircle, ArrowRight, RefreshCw, KeyRound, Lock } from 'lucide-react';
import { RNPDoveBadge } from './Logo';

interface PhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { phoneNumber: string; verified: boolean }) => void;
  currentUser: { phoneNumber: string; verified: boolean } | null;
}

export const PhoneAuthModal: React.FC<PhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentUser
}) => {
  const [phone, setPhone] = useState<string>(currentUser?.phoneNumber || '');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'VERIFIED'>('PHONE');
  const [otpCode, setOtpCode] = useState<string>('');
  const [simulatedCode, setSimulatedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 8) {
      setErrorMsg('Please enter a valid Rwanda phone number (MTN or Airtel)');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await apiService.requestOtp(phone);
    setLoading(false);

    if (res.success) {
      setSimulatedCode(res.demoCode || '123456');
      setStep('OTP');
    } else {
      setErrorMsg(res.message || 'Failed to request OTP');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg('Please enter the 6-digit OTP code');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const res = await apiService.verifyOtp(phone, otpCode);
    setLoading(false);

    if (res.success) {
      setStep('VERIFIED');
      onSuccess({ phoneNumber: phone, verified: true });
      setTimeout(() => {
        onClose();
        setStep('PHONE');
      }, 1500);
    } else {
      setErrorMsg(res.message || 'Invalid code');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-panel border-2 border-amber-400/80 w-full max-w-md rounded-3xl p-6 shadow-2xl text-ink-hd space-y-5 relative overflow-hidden">
        {/* Glow halo */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <RNPDoveBadge className="w-8 h-8" />
            <div>
              <h3 className="text-sm font-black text-ink-hd uppercase tracking-wider">
                Rwanda Emergency ID &amp; Auth
              </h3>
              <p className="text-[10px] text-amber-300 font-mono">
                Simulated gateway · no real SMS is sent
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-ink-hd font-bold text-lg"
          >
            ✕
          </button>
        </div>

        {/* Step 1: Input Rwanda Phone Number */}
        {step === 'PHONE' && (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rwanda Mobile Number (+250)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+250 78X XXX XXX"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-mono text-cyan-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Prototype verification only — no real SMS is sent, no number is
                whitelisted, and no identity is registered with any authority.
              </p>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-btn-ink font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Generating demo code...</span>
                </>
              ) : (
                <>
                  <span>Request SMS Verification Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Enter 6-digit OTP code */}
        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {simulatedCode && (
              <div className="bg-emerald-950/80 border border-emerald-500/60 p-3 rounded-2xl text-xs space-y-1 text-emerald-200">
                <div className="font-bold flex items-center gap-1.5 text-emerald-300">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Demo mode · generated code (no SMS was sent):</span>
                </div>
                <p className="font-mono text-xs">
                  Your resQlink emergency security code is: <strong className="text-amber-300 text-sm tracking-widest">{simulatedCode}</strong>
                </p>
              </div>
            )}

            <div className="space-y-1.5 text-left">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Enter 6-Digit OTP Security Code</span>
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-3 text-center text-xl font-mono tracking-widest text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep('PHONE')}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-ink-hd"
              >
                Change Number
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-accent-ink font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Identity</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Verified Success */}
        {step === 'VERIFIED' && (
          <div className="py-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-emerald-600/30 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              ✓
            </div>
            <h4 className="text-base font-bold text-ink-hd">Identity Verified (Demo)</h4>
            <p className="text-xs text-slate-300">
              {phone} verified locally in demo mode. This session lives only in
              your browser — nothing was sent to RNP or any authority.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
