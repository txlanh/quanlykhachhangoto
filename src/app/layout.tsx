import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "vietnamese"] });

export const metadata: Metadata = {
  title: "Quản Lý Khách Hàng",
  description: "Ứng dụng quản lý bán xe ô tô",
  manifest: "/manifest.json",
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png', // Thêm dòng này để iPhone nhận logo
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "QL Khách Hàng",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} bg-gray-50 text-slate-900 antialiased min-h-screen pb-safe`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
