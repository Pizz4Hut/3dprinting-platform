'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Mail, Lock, KeyRound, Shield, AlertCircle, ArrowRight } from 'lucide-react';

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('กรุณากรอกอีเมล');
      return;
    }
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      callbackUrl,
    });

    setLoading(false);
    if (res?.error) {
      setError('เกิดข้อผิดพลาดในการเข้าสู่ระบบ');
    } else {
      router.push(callbackUrl);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      pin: pin || undefined,
      email: email || undefined,
      password: password || undefined,
      callbackUrl: '/admin',
    });

    setLoading(false);
    if (res?.error) {
      setError('ข้อมูลผู้ดูแลระบบไม่ถูกต้อง (ใช้ PIN 9876 หรือ master password)');
    } else {
      router.push('/admin');
    }
  };

  const handleGoogleSignIn = () => {
    signIn('google', { callbackUrl });
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 bg-slate-50">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 shadow-card space-y-6">
        {/* Brand */}
        <div className="text-center">
          <div className="w-12 h-12 rounded border border-slate-900 bg-slate-900 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Box className="w-6 h-6 text-blue-400" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
            PRINTCRAFT AUTHENTICATION
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            เข้าสู่ระบบแพลตฟอร์ม 3D Print
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            เข้าสู่ระบบเพื่อติดตามสถานะและประวัติคำสั่งพิมพ์ของคุณ
          </p>
        </div>

        {/* Tab switch between Customer & Admin */}
        <div className="flex border border-slate-200 rounded-lg p-1 bg-slate-50 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CUSTOMER');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded text-center transition-all ${
              activeTab === 'CUSTOMER'
                ? 'bg-white text-slate-900 font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ลูกค้า (Customer)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded text-center transition-all ${
              activeTab === 'ADMIN'
                ? 'bg-slate-900 text-white font-bold shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            ผู้ดูแลร้าน (Staff / Admin)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CUSTOMER TAB */}
        {activeTab === 'CUSTOMER' && (
          <div className="space-y-4">
            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 text-xs font-mono font-semibold shadow-technical transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google Account</span>
            </button>

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[10px] font-mono text-slate-400 uppercase">
                หรือใช้อีเมล
              </span>
            </div>

            <form onSubmit={handleCustomerLogin} className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-slate-700 mb-1">
                  อีเมลของคุณ (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs font-sans rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>เข้าสู่ระบบด้วยอีเมล</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded font-sans leading-relaxed">
              🛡️ <span className="font-semibold">ระบบรักษาความปลอดภัย:</span> เฉพาะช่างและเจ้าหน้าที่ร้านเท่านั้น กรอก PIN หรือ Master Password เพื่อเข้าแดชบอร์ด
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1">
                Admin PIN (รหัสผ่านด่วน 4 หลัก)
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="•••• (ค่าเริ่มต้น: 9876)"
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Shield className="w-4 h-4" />
              <span>{loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบหลังบ้าน (Admin)'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><span className="text-xs font-mono text-slate-400">Loading auth...</span></div>}>
      <SignInContent />
    </React.Suspense>
  );
}
