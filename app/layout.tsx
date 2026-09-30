import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "NIVARAN X — Investor Rights Intelligence",
  description: "AI-powered investor rights and grievance readiness platform."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}