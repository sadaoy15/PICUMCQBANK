import type { Metadata } from "next";
import { Activity, ClipboardList } from "lucide-react";
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
              <span aria-hidden="true" className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-teal-200 bg-[#effbf9] text-teal-700 shadow-sm shadow-teal-100">
                <Activity className="h-6 w-6" strokeWidth={1.9} />
              </span>
              <span>
                <span className="block text-base font-black tracking-tight text-slate-950 sm:text-xl">PICU MCQ Bank</span>
                <span className="block text-xs font-medium text-slate-500">Pediatric critical care review</span>
              </span>
            </a>
            <div className="flex items-center gap-3">
              <a href="/PICUMCQBANK" className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-teal-200 hover:text-teal-700 sm:flex">
              <ClipboardList aria-hidden="true" className="h-4 w-4" strokeWidth={1.9} />
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
