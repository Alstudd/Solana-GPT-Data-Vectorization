import { solanaDataIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import {
  createSolanaDataSchema,
  deleteSolanaDataSchema,
  updateSolanaDataSchema,
} from "@/lib/validation/solanaData";
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = createSolanaDataSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    const { title, content } = parseResult.data;
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForSolanaData(title, content);

    const solanaData = await prisma.$transaction(async (tx) => {
      const solanaData = await tx.solanaData.create({
        data: {
          title,
          content,
        },
      });
      await solanaDataIndex.upsert([
        {
          id: solanaData.id,
          values: embedding,
          metadata: {},
        },
      ]);
      return solanaData;
    });

    return Response.json({ solanaData }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parseResult = updateSolanaDataSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    const { id, title, content } = parseResult.data;
    const solanaData = await prisma.solanaData.findUnique({ where: { id } });
    if (!solanaData) {
      return Response.json({ error: "Solana Data not found" }, { status: 404 });
    }
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const embedding = await getEmbeddingForSolanaData(title, content);

    const updatedSolanaData = await prisma.$transaction(async (tx) => {
      const updatedSolanaData = await tx.solanaData.update({
        where: { id },
        data: { title, content },
      });
      await solanaDataIndex.upsert([
        {
          id,
          values: embedding,
          metadata: {},
        },
      ]);
      return updatedSolanaData;
    });

    return Response.json({ updatedSolanaData }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const parseResult = deleteSolanaDataSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    const { id } = parseResult.data;
    const solanaData = await prisma.solanaData.findUnique({ where: { id } });
    if (!solanaData) {
      return Response.json({ error: "Solana Data not found" }, { status: 404 });
    }
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.solanaData.delete({ where: { id } });
      await solanaDataIndex.deleteOne(id);
    });

    return Response.json({ message: "Solana Data deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

async function getEmbeddingForSolanaData(title: string, content: string | undefined) {
  return getEmbedding(title + "\n\n" + (content ?? ""));
}
