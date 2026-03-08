import type { Metadata } from "next";
import { Inter, Inconsolata } from "next/font/google";
import "./globals.css";
import Providers from "@/providers";
import { cn } from "@/lib/utils";

// Load Inter for Sans
const inter = Inter({
    variable: "--font-sans",
    subsets: ["latin"]
});

// Load Inconsolata for Mono
const inconsolata = Inconsolata({
    variable: "--font-mono",
    subsets: ["latin"]
});

export const metadata: Metadata = {
    title: "Velox — AI-Powered Financial News.",
    description:
        "Stop drowning in financial news. Velox analyzes sentiment, summarizes key takeaways, and lets you chat with any article — instantly.",
    openGraph: {
        title: "Velox — AI-Powered Financial News.",
        description:
            "Stop drowning in financial news. Velox analyzes sentiment, summarizes key takeaways, and lets you chat with any article — instantly.",
        siteName: "Velox",
        images: [
            {
                url: "https://raw.githubusercontent.com/sutarrohit/Velox/main/apps/web/assets/meta.png",
                width: 1200,
                height: 630,
                alt: "Velox — AI-Powered Financial News"
            }
        ],
        locale: "en_US",
        type: "website"
    },
    twitter: {
        card: "summary_large_image",
        title: "Velox — AI-Powered Financial News.",
        description:
            "Stop drowning in financial news. Velox analyzes sentiment, summarizes key takeaways, and lets you chat with any article — instantly.",
        images: ["https://raw.githubusercontent.com/sutarrohit/Velox/main/apps/web/assets/meta.png"]
    }
};

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning className={cn("font-sans", inter.variable)}>
            <body className={`${inter.variable} ${inconsolata.variable} antialiased`}>
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
