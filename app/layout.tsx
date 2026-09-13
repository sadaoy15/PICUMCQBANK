import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PICU MCQ Bank — Know what comes next",
  description: "Focused pediatric critical care question practice, explanations, and progress tracking.",
  metadataBase: new URL("https://sadaoy15.github.io"),
  openGraph: {
    title: "PICU MCQ Bank",
    description: "Know what comes next. Focused pediatric critical care review.",
    images: [{ url: "/PICUMCQBANK/og.png", width: 1200, height: 630, alt: "PICU MCQ Bank — Know what comes next" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PICU MCQ Bank",
    description: "Know what comes next. Focused pediatric critical care review.",
    images: ["/PICUMCQBANK/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900">
        <nav className="site-nav sticky top-0 z-20 px-4 sm:px-6">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
            <a href="/PICUMCQBANK" className="site-brand flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="signal-mark">
                <span className="signal-dot signal-dot-red" />
                <span className="signal-dot signal-dot-yellow" />
                <span className="signal-dot signal-dot-teal" />
              </span>
              <span>
                <span className="block text-[15px] font-black tracking-[-0.02em] text-[#182126] sm:text-[17px]">PICU MCQ Bank</span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#718089]">Pediatric critical care</span>
              </span>
            </a>
            <div className="flex items-center gap-3">
              <span className="hidden text-xs font-semibold text-[#718089] lg:block">Focused review. Clear progress.</span>
              <a href="/PICUMCQBANK" className="nav-session hidden items-center sm:flex">Sessions</a>
            </div>
          </div>
        </nav>
        <main className="site-main mx-auto max-w-[1440px] px-4 py-5 sm:px-6 sm:py-7">{children}</main>
      </body>
    </html>
  );
}
