const myData = require("../assets/simplifiedQuestionAnswers.json");
require("dotenv").config();

async function addSolanaData() {
  try {
    let i = 1;
    const failedUploads = [];

    for (const item of myData) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/automation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: process.env.NEXT_PUBLIC_AUTOMATION_KEY,
              title: "Solana Stack Exchange Question " + i,
              content: JSON.stringify(item),
            }),
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`Successfully uploaded question ${i}`);
      } catch (error) {
        console.error(`Failed to upload question ${i}:`, error);
        failedUploads.push(i);
      }
      i++;
    }

    if (failedUploads.length > 0) {
      console.warn("Failed uploads for questions:", failedUploads);
    } else {
      console.log("Successfully added all Solana data");
    }
  } catch (error) {
    console.error("Error adding Solana data:", error);
    throw error;
  }
}

async function addSolanaDataWithDelay() {
  try {
    console.log("Starting data upload...");
    await addSolanaData();
    console.log("Upload process completed");
  } catch (error) {
    console.error("Upload process failed:", error);
  }
}

addSolanaDataWithDelay();
