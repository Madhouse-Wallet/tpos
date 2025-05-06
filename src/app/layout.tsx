import { Metadata } from "next";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../assets/styles/globals.css";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
import { Oxanium } from "next/font/google";
import bg from "@/assets/images/bg.jpg";

import localFont from "next/font/local";
import { ToastContainer } from "react-toastify";
import { headers } from "next/headers";
import Image from "next/image";

const oxanium = Oxanium({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"], // pick what you need
  variable: "--font-oxanium", // optional if using as a CSS variable
});
export const metadata: Metadata = {
  title: "Tpos ",
  description: "Tpos ",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieHeader = await headers();
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/fav.png?v=2" />
      </head>
      <body>
        <Image
          src={bg}
          className="max-w-full h-full w-full fixed top-0 left-0 object-cover z-[-1] blur-lg"
          height={10000}
          width={10000}
          alt=""
        />
        <div className={` ${oxanium.className}`}>
          <ToastContainer />
          <ThemeProvider>{children}</ThemeProvider>
        </div>
      </body>
    </html>
  );
}
