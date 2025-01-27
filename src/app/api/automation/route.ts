import { solanaDataIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import { getEmbedding } from "@/lib/openai";
import { createAutomationSolanaDataSchema } from "@/lib/validation/solanaData";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parseResult = createAutomationSolanaDataSchema.safeParse(body);
    if (!parseResult.success) {
      console.error(parseResult.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    const { key, title, content } = parseResult.data;

    if (key !== process.env.NEXT_PUBLIC_AUTOMATION_KEY) {
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

async function getEmbeddingForSolanaData(
  title: string,
  content: string | undefined,
) {
  return getEmbedding(title + "\n\n" + (content ?? ""));
}
