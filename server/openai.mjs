import OpenAI from 'openai';

// Server-only: OPENAI_API_KEY is never exposed to the browser bundle.
let client;
function getClient() {
  if (!process.env.OPENAI_API_KEY) {
    const error = new Error('OPENAI_API_KEY is not configured on the server.');
    error.status = 500;
    throw error;
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}

const DEFAULT_SYSTEM = 'You are a helpful assistant for CXentric, a professional networking platform.';

export async function chatCompletion(userMessage) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: DEFAULT_SYSTEM },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
}

export async function streamChatCompletion(userMessage, onChunk) {
  const stream = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: DEFAULT_SYSTEM },
      { role: 'user', content: userMessage },
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) onChunk(content);
  }
}

export async function generateHashtags(content) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a social media expert for CXentric, a professional networking platform.
          Generate relevant, professional hashtags for the given content.
          Focus on business, networking, professional development, and industry-specific tags.
          Return only hashtags, separated by spaces, without explanations.`,
      },
      { role: 'user', content: `Generate hashtags for this content: ${content}` },
    ],
    temperature: 0.8,
    max_tokens: 200,
  });

  return response.choices[0].message.content
    .split(/\s+/)
    .filter(tag => tag.startsWith('#'))
    .slice(0, 10);
}

const IMAGE_SIZES = ['1024x1024', '1792x1024', '1024x1792'];

export async function generateImage(prompt, size = '1024x1024') {
  const response = await getClient().images.generate({
    model: 'dall-e-3',
    prompt: `Professional business image: ${prompt}. Make it suitable for a professional networking platform.`,
    n: 1,
    size: IMAGE_SIZES.includes(size) ? size : '1024x1024',
    quality: 'standard',
  });
  return response.data[0].url;
}

export async function moderateText(text) {
  const response = await getClient().moderations.create({
    model: 'text-moderation-latest',
    input: text,
  });
  return response.results[0];
}

export async function getNetworkingSuggestions(userProfile) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a networking expert for CXentric. Provide personalized networking suggestions based on the user's profile.
          Focus on professional connections, industry events, skill development, and career growth opportunities.
          Keep suggestions actionable and relevant to their professional goals.`,
      },
      { role: 'user', content: `Based on this profile, provide networking suggestions: ${userProfile}` },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });
  return response.choices[0].message.content;
}

export async function generateContentIdeas(topic, contentType = 'post') {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a content strategist for CXentric, a professional networking platform.
          Generate creative and engaging content ideas based on the given topic and content type.
          Focus on professional, business-oriented content that would engage a networking audience.
          Return a JSON object with the following structure:
          {
            "title": "Engaging title for the content",
            "content": "Brief description or outline of the content",
            "ideas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"]
          }
          Make sure the ideas are specific, actionable, and relevant to professional networking.`,
      },
      { role: 'user', content: `Generate content ideas for a ${contentType} about: ${topic}` },
    ],
    temperature: 0.8,
    max_tokens: 600,
  });

  const contentText = response.choices[0].message.content;

  // Try to parse JSON response, fallback to structured format if needed
  try {
    return JSON.parse(contentText);
  } catch {
    const lines = contentText.split('\n').filter(line => line.trim());
    const ideas = lines.filter(line => line.includes('•') || line.includes('-') || line.match(/^\d+\./))
      .map(line => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .slice(0, 5);

    return {
      title: `Content Ideas for ${topic}`,
      content: `Professional content suggestions for ${contentType} about ${topic}`,
      ideas: ideas.length > 0 ? ideas : [
        `Share insights about ${topic}`,
        `Ask engaging questions about ${topic}`,
        `Share a personal experience related to ${topic}`,
        `Create a how-to guide about ${topic}`,
        `Share industry trends related to ${topic}`,
      ],
    };
  }
}
