import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import Script from "next/script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

export const metadata = {
  title: ' Trustedgebroker - Blockchain Company',
  description:
    'trustedgebroker.com is an investment firm committed to exceptional returns for investors through actively managed portfolios of these blockchain assets.',
  keywords:
    'blockchain, Forex, FX, Crypto, Cryptos, Cryptocurrencies, Stock, Stocks, Bonds, Invest, Investment, Equity',
  openGraph: {
    url: 'https://trustedgebroker.com/',
    type: 'website',
    title: 'Trade With Us',
    description:
      'Earn huge return on investment. With our professional team of traders, you are guaranteed of your earnings.',
    images: [
      'https://static.news.bitcoin.com/wp-content/uploads/2022/07/tesla-sold-btc1.jpg',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    domain: 'trustedgebroker.com',
    url: 'https://trustedgebroker.com/',
    title: 'Trade With Us',
    description:
      'Earn huge return on investment. With our professional team of traders, you are guaranteed of your earnings.',
    images: [
      'https://static.news.bitcoin.com/wp-content/uploads/2022/07/tesla-sold-btc1.jpg',
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${montserrat.variable} antialiased`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>

        {/* <Script
          id="smartsupp-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              var _smartsupp = _smartsupp || {};
              _smartsupp.key = '7aebc69682ab67fb9b99bbafff63432eb9cc3fac';
              _smartsupp.color = '#d900b3';
              _smartsupp.lang = 'en'; // <--- Forces English language
              window.smartsupp||(function(d) {
                var s,c,o=smartsupp=function(){ o._.push(arguments)};o._=[];
                s=d.getElementsByTagName('script')[0];c=d.createElement('script');
                c.type='text/javascript';c.charset='utf-8';c.async=true;
                c.src='https://www.smartsuppchat.com/loader.js?';
                s.parentNode.insertBefore(c,s);
              })(document);
            `,
          }}
        /> */}


      </body>
    </html>
  );
}

