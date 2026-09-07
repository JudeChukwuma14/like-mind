import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/app/providers/ThemeProvider";
import { QueryProvider } from "@/app/providers/QueryProvider";
import { THEME_KEY } from "@/app/lib/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | LikeMinds Cooperative",
    default: "LikeMinds Cooperative",
  },
  description:
    "LikeMinds Cooperative — a member-owned co-op pooling capital across real estate, agriculture, tech and welfare.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    /**
     * suppressHydrationWarning: the inline script below changes
     * data-theme before React hydrates, so the attribute value will
     * differ from the server-rendered default. This suppresses the
     * resulting hydration warning on <html> only.
     */
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        {/**
         * Inline script — runs synchronously during HTML parsing,
         * BEFORE the browser paints, so there is zero theme flash.
         * Reads localStorage and sets data-theme on <html>.
         * try/catch guards against restricted storage (private mode).
         */}
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("${THEME_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t)}else if(window.matchMedia("(prefers-color-scheme: dark)").matches){document.documentElement.setAttribute("data-theme","dark")}}catch(e){}})()`,
          }}
        />
      </head>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <QueryProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            error: { duration: 7000 },
            style: { maxWidth: "420px", whiteSpace: "pre-line" },
          }}
        />
      </body>
    </html>
  );
}
