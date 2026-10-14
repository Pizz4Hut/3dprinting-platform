'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Box, Layers, Shield, Search, User, LogOut, Cpu } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === 'ADMIN';

  const navLinks = [
    { href: '/', label: '3D Studio & Slicer', icon: Layers },
    { href: '/track', label: 'Track Order', icon: Search },
    { href: '/admin', label: 'Admin Portal', icon: Shield, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
      {/* Top micro status bar */}
      <div className="hidden sm:flex items-center justify-between px-6 py-1 border-b border-slate-100 bg-slate-50 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            FAB-GRID ONLINE
          </span>
          <span className="text-slate-300">|</span>
          <span>BAMBU LAB X1-C & PRUSA MK4 FLEET ACTIVE</span>
          <span className="text-slate-300">|</span>
          <span>SLA 8K RESIN READY</span>
        </div>
        <div className="flex items-center gap-4">
          <span>PROMPTPAY ZERO-FEE PAYMENT</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">ESTIMATION ENGINE V2.4</span>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded border border-slate-900 bg-slate-900 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Box className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-slate-900">
                PRINTCRAFT
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                PALANTIR WHITE
              </span>
            </div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              Autonomous 3D Fabrication Platform
            </p>
          </div>
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            if (link.adminOnly && !isAdmin && pathname !== '/admin') {
              // Still show admin link to allow officers to click & authenticate
            }
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-300' : 'text-slate-500'}`} />
                <span>{link.label}</span>
                {link.adminOnly && (
                  <span className="px-1 text-[9px] font-mono uppercase rounded bg-blue-100 text-blue-700 font-bold border border-blue-200">
                    SECURE
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Auth Section */}
        <div className="flex items-center gap-2.5">
          {session?.user ? (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-slate-900 leading-tight">
                  {session.user.name || session.user.email?.split('@')[0]}
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase">
                  {isAdmin ? 'ADMIN ENGINEER' : 'CLIENT ACCOUNT'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 font-mono">
                {session.user.email?.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-technical transition-all"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Sign In / บัญชี</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
