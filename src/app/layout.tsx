import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "南京火烧云",
  description: "南京火烧云预报 - 实时监测火烧云和空气质量数据",
  metadataBase: new URL('http://njsky.cc'),
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
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'http://njsky.cc',
    languages: {
      'zh-CN': [
        { url: 'http://njsky.cc', hreflang: 'zh-CN' },
        { url: 'http://www.njsky.cc', hreflang: 'zh-CN' },
        { url: 'http://njsky.liuliang.world', hreflang: 'zh-CN' }
      ],
    },
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
