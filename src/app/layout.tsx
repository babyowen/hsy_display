import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "南京火烧云",
  description: "南京火烧云预报 - 实时监测火烧云和空气质量数据",
  icons: {
    icon: [
      { rel: 'icon', url: '/favicon.ico' },
      { rel: 'icon', url: '/icon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', url: '/apple-icon.png' }
    ],
  },
  openGraph: {
    title: '南京火烧云',
    description: '南京火烧云预报 - 实时监测火烧云和空气质量数据',
    images: [
      {
        url: '/images/cover/sunset.jpg',
        width: 1200,
        height: 630,
        alt: '南京火烧云',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: '南京火烧云',
    description: '南京火烧云预报 - 实时监测火烧云和空气质量数据',
    images: ['/images/cover/sunset.jpg'],
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
