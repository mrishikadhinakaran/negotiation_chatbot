import OpenAI from 'openai';


const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true 
});

export async function callOpenAI(message: string, context: string) {
  try {
    const completion = await openaiClient.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {role: "system", content: `You are a negotiation bot selling a product. ${context}`},
        {role: "user", content: message}
      ],
    });

    return completion.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}