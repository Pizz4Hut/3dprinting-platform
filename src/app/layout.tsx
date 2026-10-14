import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { Navbar } from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'PrintCraft 3D // Precision Fabrication Platform',
  description:
    'Palantir-inspired autonomous 3D printing platform: Instant STL quoting, slicing layer preview, PromptPay payment, and backoffice manufacturing pipeline.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full">
      <body className="min-h-screen flex flex-col font-sans bg-white text-slate-900 selection:bg-slate-900 selection:text-white">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          {/* Palantir White Technical Footer */}
          <footer className="border-t border-slate-200 bg-slate-50 py-8 px-6 text-xs text-slate-500 font-mono">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="font-bold text-slate-900">PRINTCRAFT FAB-OS</span>
                <span className="text-slate-300">|</span>
                <span>BUILD: 2026.10-ALPHA</span>
                <span className="text-slate-300">|</span>
                <span>STATION: BKK-NODE-01</span>
              </div>
              <div className="flex items-center gap-6 text-slate-500">
                <span>SECURITY: ENCRYPTED // ROLE-PROTECTED</span>
                <span>PROMPTPAY EMVCO COMPLIANT</span>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
