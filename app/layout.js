import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "./components/providers/NextAuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import HeaderWrapper from "@/components/design/HeaderWrapper";
import FooterWrapper from "@/components/design/FooterWrapper";
import ScrollToTopButton from "@/components/design/ScrollToTopButton";
import InstallPWA from "@/components/InstallPWA";
// import TopProgressBar from "@/components/ui/TopProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// app/layout.js or app/page.js

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
  ),
  title: {
    default: "Mero Kamaal Cafe",
    template: "%s | Mero Kamaal Cafe",
  },
  description:
    "Complete restaurant management system with POS, orders, and billing.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mero Kamaal",
  },
  formatDetection: {
    telephone: false,
  },

  // ✅ Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    title: "Mero Kamaal Cafe – Restaurant Management",
    description:
      "Complete restaurant management system with POS, orders, and billing.",
    url: "https://merokamaal.com",
    siteName: "Mero Kamaal Cafe",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "Mero Kamaal Cafe",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // ✅ Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Mero Kamaal Cafe",
    description: "Restaurant management system",
    images: ["/icon-512x512.png"],
  },

  // ✅ Favicons and icons
  icons: {
    icon: "/icon-192x192.png",
    shortcut: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Berkshire+Swash&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Karla:ital,wght@0,200..800;1,200..800&family=Montserrat:ital,wght@0,100..900;1,100..900&family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Poppins:wght@300;400;500;600;700&family=Sansita:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700;1,800;1,900&display=swap"
          rel="stylesheet"
        ></link>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0ea5e9" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-[150vw]`}
      >
        <CartProvider>
          <NextAuthProvider>
            {/* <TopProgressBar /> client-only progress bar */}
            <HeaderWrapper />
            {children}
            <ScrollToTopButton />
            <FooterWrapper />
            <InstallPWA />
          </NextAuthProvider>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
