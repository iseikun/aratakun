import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ブラック企業社長シミュレーター // React & Next.js Edition',
  description: 'ReactのHooksとNext.jsのServer Actionsを駆使して社員を限界まで酷使し、労基署の査察をすり抜けてIPO(上場)を目指すブラック企業経営ゲーム！',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="dark">
      <body className="min-h-screen bg-slate-950 cyber-grid text-slate-100 flex flex-col relative antialiased selection:bg-red-500 selection:text-white">
        {/* CRTスキャンライン */}
        <div className="fixed inset-0 scanlines pointer-events-none z-50 opacity-30" />

        <main className="flex-1 flex flex-col relative z-10">{children}</main>

        <footer className="relative z-10 border-t border-slate-900 py-3 text-center text-xs font-mono text-slate-600">
          ブラック企業社長シミュレーター // Powered by React 18 & Next.js App Router (Server Actions)
        </footer>
      </body>
    </html>
  );
}
