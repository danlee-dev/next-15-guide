import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/JetBrainsMono.woff2",
  variable: "--font-jbmono",
  weight: "100 800",
  display: "swap",
});

const description = "NEXT 15기 개발 세션. 세션별 실습 노트와 제출 현황, 바이브 코딩 가이드, 개발 세팅과 디자인 자료.";

export const metadata: Metadata = {
  metadataBase: new URL("https://next-guide-15.vercel.app"),
  title: "NEXT 15기 개발 세션",
  description,
  // 제출 현황판에 본명이 떠서 검색엔진에는 올리지 않는다
  robots: { index: false, follow: false },
  // 잡담방 링크 미리보기용. 이미지는 app/opengraph-image.png 를 Next가 자동으로 붙인다
  openGraph: { title: "NEXT 15기 개발 세션", description, siteName: "NEXT", locale: "ko_KR", type: "website" },
};

export const viewport: Viewport = { themeColor: "#ffffff", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
