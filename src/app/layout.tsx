
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Sheet } from "@/components/ui/sheet";
import { ThemeProvider } from "@/components/mf/theme-context";
import { ReactQueryProvider } from "@/context";
import { PackageProvider } from "@/components/mf/PackageContext";
import { MenuProvider } from "@/components/mf/MenuContext";
import { DateRangeProvider } from "@/components/mf/DateRangeContext";
import { LoadingProvider } from "@/components/mf/LoadingContext";
import { ScrollToTop } from "@/components/mf/ScrollToTop";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});
export const metadata: Metadata = {
  title: "mFilterIt",
  description: "mFilterIt ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-[calc(100vh_-_3.5rem)]  w-full overflow-hidden dark"
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full h-full`}
      >
        <ReactQueryProvider>
          <ThemeProvider>
            <PackageProvider>
              <MenuProvider>
                <DateRangeProvider>
                  <LoadingProvider>
                    <Toaster />
                    <Sheet>{children}</Sheet>
                  </LoadingProvider>
                </DateRangeProvider>
              </MenuProvider>
            </PackageProvider>
          </ThemeProvider>
        </ReactQueryProvider>
       
      </body>
    </html>
  );
}
