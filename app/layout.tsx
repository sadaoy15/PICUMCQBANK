import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PICU MCQ Bank",
  description: "PREP PICU interactive MCQ review sessions",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f4f9fa] text-slate-900">
        <nav className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <a href="/PICUMCQBANK" className="flex min-w-0 items-center gap-3 transition-colors hover:text-teal-700">
              <span aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-teal-200 bg-white shadow-sm shadow-teal-100">
                <svg viewBox="0 0 48 48" className="h-9 w-9" fill="none">
                  <rect x="3" y="3" width="42" height="42" rx="14" fill="#0F766E" />
                  <path d="M9 25h6l3-7 5 14 4-9 2 2h10" stroke="white" strokeWidth="2.7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M34.5 12.5v8M30.5 16.5h8" stroke="#99F6E4" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </span>
              <span>
                <span className="block text-base font-black tracking-tight text-slate-950 sm:text-xl">PICU MCQ Bank</span>
                <span className="block text-xs font-medium text-slate-500">Pediatric critical care review</span>
              </span>
            </a>
            <div className="flex items-center gap-3">
              <a href="/PICUMCQBANK" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-teal-200 hover:text-teal-700 sm:flex">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11h6" />
                <path d="M9 15h6" />
                <path d="M10 3h4" />
                <path d="M8 5h8" />
                <rect x="6" y="5" width="12" height="16" rx="2" />
              </svg>
              Sessions
              </a>
              <span className="hidden h-10 w-10 items-center justify-center rounded-full bg-teal-100 text-sm font-black text-teal-800 sm:flex">SA</span>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-[1440px] px-4 py-4 sm:px-6 sm:py-5">{children}</main>
      </body>
    </html>
  );
}
