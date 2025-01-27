const fs = require("fs").promises;
const path = require("path");
const myData = require("../assets/questionAnswers.json");

async function createSimplifiedJson() {
  try {
    let i = 1;
    const simplifiedData = [];

    for (const { Body, AcceptedAnswerPost, AnswerPosts } of myData.slice(
      0,
      myData.length,
    )) {
      if (Body && AcceptedAnswerPost) {
        simplifiedData.push({
          question: Body,
          answer: AcceptedAnswerPost.Body,
        });
      } else if (Body && AnswerPosts) {
        simplifiedData.push({
          question: Body,
          answer: AnswerPosts.map((post) => post.Body).join("\n"),
        });
      }
      i++;
    }

    const outputPath = path.join(
      __dirname,
      "../assets/simplifiedQuestionAnswers.json",
    );
    await fs.writeFile(
      outputPath,
      JSON.stringify(simplifiedData, null, 2),
      "utf8",
    );

    console.log("Successfully created simplified JSON at:", outputPath);
    console.log("Number of items processed:", simplifiedData.length);

    return simplifiedData;
  } catch (error) {
    console.error("Error creating simplified JSON:", error);
    throw error;
  }
}

createSimplifiedJson();
