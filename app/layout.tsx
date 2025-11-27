// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import "@/styles/globals.css";
import { SessionProvider } from "@/components/providers/session-provider";

export const metadata: Metadata = {
  title: "Elshadai Apartments",
  description: "Manage apartments, tenants and payments with ease",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
