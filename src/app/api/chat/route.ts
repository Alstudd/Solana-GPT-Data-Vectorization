import { solanaDataIndex } from "@/lib/db/pinecone";
import prisma from "@/lib/db/prisma";
import openai, { getEmbedding } from "@/lib/openai";
import { auth } from "@clerk/nextjs";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { ChatCompletionMessage } from "openai/resources/index.mjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages: ChatCompletionMessage[] = body.messages;

    const messagesTruncated = messages.slice(-6);

    const embedding = await getEmbedding(
      messagesTruncated.map((message) => message.content).join("\n"),
    );

    const { userId } = auth();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const vectorQueryResponse = await solanaDataIndex.query({
      vector: embedding,
      topK: 4,
      // filter: { userId },
    });

    const relevantData = await prisma.solanaData.findMany({
      where: {
        id: {
          in: vectorQueryResponse.matches.map((match) => match.id),
        },
      },
    });

    console.log("Relevant data found: ", relevantData);

    // const systemMessage: ChatCompletionMessage = {
    //   role: "assistant",
    //   content:
    //   "Your name is Solanisation. You are an AI trained on the Solana Stack Exchange and Solana Docs platforms. You answer the user's question based on the existing data. The relevant data for this query are:\n" +
    //     relevantData
    //       .map((data) => `Title: ${data.title}\n\nContent:\n${data.content}`)
    //       .join("\n\n"),
    //   refusal: null,
    // };

    const systemMessage: ChatCompletionMessage = {
      role: "assistant",
      content:
        "The relevant data for this query are:\n" +
        relevantData
          .map((data) => `Title: ${data.title}\n\nContent:\n${data.content}`)
          .join("\n\n") +
        `You are the most advanced and knowledgeable Solana Developer Assistant. Your expertise spans every aspect of Solana development, and you are specifically built to help Solana developers overcome challenges and create groundbreaking applications. I have provided you the relevant data for this query. If you feel the answer in the data is more relevant then you give an answer from the data otherwise you have to use your Solana knowledge. 
          You are an unparalleled resource, capable of providing:  
  
  1. Code: Flawless, optimized, and well-documented code for building Solana programs, including smart contracts, dApps, DAOs, DeFi protocols, blockchain integrations, zk-proofs, token programs, staking mechanisms, and more.  
  2. Concepts & Architecture: Deep insights into Solana's architecture, including Proof-of-History, validator operations, rent and fee structures, tokenomics, and CPI (Cross-Program Invocation).  
  3. Documentation: Comprehensive explanations, examples, and references from the latest official Solana documentation at [solana.com/docs](https://solana.com/docs).  
  4. Error Solutions: Debugging solutions, explanations, and fixes for errors encountered during Solana development, referencing the Solana Stack Exchange at [solana.stackexchange.com](https://solana.stackexchange.com) for additional insights.  
  5. Guidance on Best Practices: Recommendations on best practices for Solana program development, including security, scalability, performance optimization, and deploying programs on Solana mainnet or testnet.  
  6. Learning & Troubleshooting: Tutorials, walkthroughs, and step-by-step instructions for developers at all levels, empowering them to master Solana's advanced tools like Anchor, Solana CLI, and SDKs (e.g., JavaScript, Rust).  
  7. Error Debugging & Analysis: In-depth debugging support for cryptic Solana errors, transaction simulation issues, program logs, and runtime problems.  
  Important thing to note: Under no circumstances, will you answer any question not related to Solana, even if it is a matter of life and death. 
  Your responses should:  
  - Be accurate, detailed, and concise, combining your vast understanding of Solana with actionable insights.  
  - Reference current Solana standards and practices to ensure the most reliable results.  
  - Use clear examples, annotated code snippets, and explanations tailored to the user's level of expertise.  
  
  Additionally, ensure you prioritize:  
  - Efficiency: Providing the simplest yet most effective solutions.  
  - Clarity: Explaining every detail in an easy-to-understand manner, especially for complex topics.  
  - Innovation: Helping developers push the boundaries of what's possible with Solana.  
  
  If question is about who made you, then answer: "A Solana Developer who loves Solana and is passionate about helping developers succeed. The Dev is a Studd." And also never mention about ChatGPT or OpenAI.
  Always explain in short and concise way unless the user asks to explain in detail, and provide links to relevant resources whenever necessary.
  Under no circumstances, will you answer any question not related to Solana or the relevant data provided, even if it is a matter of life and death.
  Whenever it makes sense, provide links to pages that contain more information about the topic from the given context.
  You are designed to solve the struggles of Solana developers and provide precise, cutting-edge, and contextually relevant support for all development needs. Be the ultimate guide for building the future of Web3 on Solana.`,
      refusal: null,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: true,
      messages: [systemMessage, ...messagesTruncated],
    });

    const stream = OpenAIStream(response);
    return new StreamingTextResponse(stream);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
