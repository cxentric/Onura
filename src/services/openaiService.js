import OpenAI from 'openai';

/**
 * Initialize OpenAI client with API key from environment variables
 */
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage in React
});

/**
 * Generate a basic chat completion response
 * @param {string} userMessage - The user's input message
 * @param {string} systemMessage - System context for the AI
 * @returns {Promise<string>} The assistant's response
 */
export async function getBasicChatCompletion(userMessage, systemMessage = 'You are a helpful assistant for Onura, a professional networking platform.') {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error in basic chat completion:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Stream chat completion response in real-time
 * @param {string} userMessage - The user's input message
 * @param {Function} onChunk - Callback to handle each streamed chunk
 * @param {string} systemMessage - System context for the AI
 */
export async function getStreamingChatCompletion(userMessage, onChunk, systemMessage = 'You are a helpful assistant for Onura, a professional networking platform.') {
  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Error in streaming chat completion:', error);
    throw new Error('Failed to generate response. Please try again.');
  }
}

/**
 * Generate hashtags for social media content
 * @param {string} content - The content to generate hashtags for
 * @returns {Promise<string[]>} Array of hashtags
 */
export async function generateHashtags(content) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a social media expert for Onura, a professional networking platform. 
          Generate relevant, professional hashtags for the given content. 
          Focus on business, networking, professional development, and industry-specific tags.
          Return only hashtags, separated by spaces, without explanations.` 
        },
        { role: 'user', content: `Generate hashtags for this content: ${content}` },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const hashtags = response.choices[0].message.content
      .split(/\s+/)
      .filter(tag => tag.startsWith('#'))
      .slice(0, 10); // Limit to 10 hashtags

    return hashtags;
  } catch (error) {
    console.error('Error generating hashtags:', error);
    throw new Error('Failed to generate hashtags. Please try again.');
  }
}

/**
 * Generate an image using DALL-E
 * @param {string} prompt - Description of the desired image
 * @param {string} size - Image size (1024x1024, 1792x1024, or 1024x1792)
 * @returns {Promise<string>} URL of the generated image
 */
export async function generateImage(prompt, size = '1024x1024') {
  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Professional business image: ${prompt}. Make it suitable for a professional networking platform.`,
      n: 1,
      size,
      quality: 'standard',
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw new Error('Failed to generate image. Please try again.');
  }
}

/**
 * Moderate text content for policy violations
 * @param {string} text - The text to moderate
 * @returns {Promise<object>} Moderation results
 */
export async function moderateText(text) {
  try {
    const response = await openai.moderations.create({
      model: 'text-moderation-latest',
      input: text,
    });

    return response.results[0];
  } catch (error) {
    console.error('Error moderating text:', error);
    throw new Error('Failed to moderate content. Please try again.');
  }
}

/**
 * Get networking suggestions based on user profile
 * @param {string} userProfile - User's profile information
 * @returns {Promise<string>} Networking suggestions
 */
export async function getNetworkingSuggestions(userProfile) {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a networking expert for Onura. Provide personalized networking suggestions based on the user's profile. 
          Focus on professional connections, industry events, skill development, and career growth opportunities.
          Keep suggestions actionable and relevant to their professional goals.` 
        },
        { role: 'user', content: `Based on this profile, provide networking suggestions: ${userProfile}` },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating networking suggestions:', error);
    throw new Error('Failed to generate networking suggestions. Please try again.');
  }
}

/**
 * Generate content ideas based on a topic and content type
 * @param {string} topic - The topic to generate content ideas for
 * @param {string} contentType - The type of content (post, article, etc.)
 * @returns {Promise<object>} Object containing title, content, and ideas array
 */
export async function generateContentIdeas(topic, contentType = 'post') {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: `You are a content strategist for Onura, a professional networking platform. 
          Generate creative and engaging content ideas based on the given topic and content type.
          Focus on professional, business-oriented content that would engage a networking audience.
          Return a JSON object with the following structure:
          {
            "title": "Engaging title for the content",
            "content": "Brief description or outline of the content",
            "ideas": ["Idea 1", "Idea 2", "Idea 3", "Idea 4", "Idea 5"]
          }
          Make sure the ideas are specific, actionable, and relevant to professional networking.` 
        },
        { role: 'user', content: `Generate content ideas for a ${contentType} about: ${topic}` },
      ],
      temperature: 0.8,
      max_tokens: 600,
    });

    const contentText = response.choices[0].message.content;
    
    // Try to parse JSON response, fallback to structured format if needed
    try {
      const parsedContent = JSON.parse(contentText);
      return parsedContent;
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
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
          `Share industry trends related to ${topic}`
        ]
      };
    }
  } catch (error) {
    console.error('Error generating content ideas:', error);
    throw new Error('Failed to generate content ideas. Please try again.');
  }
}

export default openai;