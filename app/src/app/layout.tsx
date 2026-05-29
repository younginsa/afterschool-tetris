import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "방과후 테트리스",
  description:
    "광교 지역 방과후 학원 스케줄을 한눈에. 셔틀, 시간, 공백까지 맞춰드릴게요.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#3182F6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-toss-frame">
        <AppProvider>
          <div className="mx-auto flex min-h-[100dvh] w-full max-w-[430px] flex-col bg-toss-bg shadow-[0_20px_60px_rgba(0,0,0,0.12)] relative">
            {children}
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
