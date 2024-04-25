import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const runtime = "edge";

async function initialiseStory() {
  // Send the prompt to the OpenAI text completion API to get an enhanced description
  const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are the Game Master of a Dungeons and Dragons game and need to create a compelling adventure story led by decisions made by the user"        },
        {
          role: "user",
          content: "Generate me an adventure story."
        }
      ]
    })
  });

  const completionData = await completionResponse.json();

  // Use the enhanced description as the prompt for the DAL E image generation API
  // const contentPrompt = completionData['choices'][0]['message']['content'].split("~")[0];
  // const enhancedPrompt = completionData['choices'][0]['message']['content'].split("~")[1];
  const enhancedPrompt = completionData['choices'][0]['message']['content'];

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "dall-e-2",
      prompt: enhancedPrompt.substring(0, Math.min(enhancedPrompt.length, 1000)),
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
      n: 1,
    }),
  });

  const responseData = await response.json();

  //console.log(responseData); // Log the entire responseData object

  // Check if responseData.data is defined before trying to access its properties
  if (responseData.data && responseData.data[0]) {
    // Return both the image and the enhanced description
    return new Response(JSON.stringify({
      image: responseData.data[0].b64_json,
      description: enhancedPrompt,
    }));
  } else {
    // Handle the error case
    return new Response(JSON.stringify({
      error: 'The DAL E image generation API did not return the expected data.',
      responseData: responseData, // Include the responseData in the error response for debugging
    }), { status: 500 });
  }
}

export async function POST(req: Request) {
  const { message } = await req.json(); // Receive the user's message

  // Create a prompt that incorporates the user's message and the theme
  const initialPrompt = `${message}`;

  // Send the prompt to the OpenAI text completion API to get an enhanced description
  const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are the Game Master of a Dungeons and Dragons game and need to create a compelling adventure story led by decisions made by the user. (limit your responses to 100 words). At the end of your response, explicitly give a list of actions the user can choose from to take."
        },
        {
          role: "user",
          content: initialPrompt
        }
      ]
    })
  });

  const completionData = await completionResponse.json();

  // Use the enhanced description as the prompt for the DAL E image generation API
  const enhancedPrompt = completionData['choices'][0]['message']['content'];

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "dall-e-2",
      prompt: enhancedPrompt.substring(0, Math.min(enhancedPrompt.length, 1000)),
      size: "1024x1024",
      quality: "standard",
      response_format: "b64_json",
      n: 1,
    }),
  });

  const responseData = await response.json();

  //console.log(responseData); // Log the entire responseData object

  // Check if responseData.data is defined before trying to access its properties
  if (responseData.data && responseData.data[0]) {
    // Return both the image and the enhanced description
    return new Response(JSON.stringify({
      image: responseData.data[0].b64_json,
      description: enhancedPrompt,
    }));
  } else {
    // Handle the error case
    return new Response(JSON.stringify({
      error: 'The DAL E image generation API did not return the expected data.',
      responseData: responseData, // Include the responseData in the error response for debugging
    }), { status: 500 });
  }
}
