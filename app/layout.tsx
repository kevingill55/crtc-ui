import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css"; // Import the CSS
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically

import type { Metadata, Viewport } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import { AppNotifications } from "./AppNotifications";
import "./globals.css";
import { NotificationsProvider } from "./providers/Notifications";
import { TanstackQuery } from "./providers/TanstackQuery";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
});

const geistFont = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  width: "device-width",
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Charles River Tennis Club",
  description: "Charles River Tennis Club (CRTC) — member portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistFont.variable} ${playfairDisplay.variable} antialiased h-full w-full no-scrollbar`}
      >
        <TanstackQuery>
          <NotificationsProvider>
            <AppNotifications />
            {children}
          </NotificationsProvider>
        </TanstackQuery>
      </body>
    </html>
  );
}
