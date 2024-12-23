import React from "react";
import type { Metadata } from "next";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";
import SolanaData from "@/components/SolanaData";

export const metadata: Metadata = {
  title: "Solana GPT Vectorization - Solana Data",
};

type Props = {};

const SolanaDataPage = async (props: Props) => {
  const { userId } = auth();
  if (!userId) throw Error("userId undefined");

  const allSolanaData = await prisma.solanaData.findMany({});

  // const sortedSolanaData = allSolanaData.sort((a, b) => {
  //   const numberA = parseInt(a.title.match(/\d+/)?.[0] || "0", 10);
  //   const numberB = parseInt(b.title.match(/\d+/)?.[0] || "0", 10);
  //   return numberA - numberB;
  // });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {allSolanaData.map((solanaData) => (
        <SolanaData solanaData={solanaData} key={solanaData.id} />
      )).reverse()}
      {allSolanaData.length === 0 && (
        <div className="col-span-full text-center">
          {
            'No solana data found. Click on the "Add Solana Data" button to add solana data.'
          }
        </div>
      )}
    </div>
  );
};

export default SolanaDataPage;
