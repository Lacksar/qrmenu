import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthProvider from "./components/providers/NextAuthProvider";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "./context/CartContext";
import HeaderWrapper from "@/components/design/HeaderWrapper";
import FooterWrapper from "@/components/design/FooterWrapper";
import ScrollToTopButton from "@/components/design/ScrollToTopButton";
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
  title: {
    default: "Pancetta",
    template: "%s | Pancetta",
  },
  description: "The best food in town, delivered to your door.",

  // ✅ Open Graph (for Facebook, WhatsApp, etc.)
  openGraph: {
    title: "Pancetta – The Best Food in Town",
    description: "Delicious meals delivered fast.",
    url: "https://pancetta.com.au",
    siteName: "Pancetta",
    images: [
      {
        url: "/logo.png", // relative to /public
        width: 1200,
        height: 630,
        alt: "Pancetta",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  // ✅ Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "Pancetta",
    description: "Order your favorite dishes",
    images: ["/logo.jpg"],
    creator: "@pancetta",
  },

  // ✅ Favicons and icons
  icons: {
    icon: "/favicon-new.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
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
          </NextAuthProvider>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
