import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs";
import { Bot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default function Home() {
  const { userId } = auth();

  if (userId) redirect("/solanaData");

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-5">
      <div className="flex flex-col items-center gap-6">
        <Bot width={100} height={100} />
        <span className="text-4xl font-extrabold tracking-tight lg:text-5xl w-[65ch] text-center">
          Solanisation GPT - Data Scraping & Vectorization
        </span>
      </div>
      <p className="max-w-prose text-center">
        An AI-powered, automated and soon-to-become open source tool built with Python (BeautifulSoup), Node.js (Puppeteer), Express.js to scrape solana data and Pinecone, Upstash, Redis, Next.js, OpenAI, RAG Chat Models, Vector Embeddings to vectorize solana data and make them searchable.
      </p>
      <Button size="lg" asChild>
        <Link href="/solanaData">Open</Link>
      </Button>
    </main>
  );
}
