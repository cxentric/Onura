/**
 * Client for cxentric's AI endpoints. All OpenAI calls happen on the server
 * (see server/api.mjs) so the API key is never shipped to the browser.
 */

async function toError(response, fallback) {
  const body = await response.json().catch(() => ({}));
  const error = new Error(body.error || fallback);
  error.status = response.status;
  error.isRateLimit = response.status === 429;
  return error;
}

async function postJson(path, payload, fallback) {
  let response;
  try {
    response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (networkError) {
    console.error(`Network error calling ${path}:`, networkError);
    throw new Error('Network connection error. Please check your internet connection and try again.');
  }
  if (!response.ok) throw await toError(response, fallback);
  return response.json();
}

/**
 * Generate a basic chat completion response
 * @param {string} userMessage - The user's input message
 * @returns {Promise<string>} The assistant's response
 */
export async function getBasicChatCompletion(userMessage) {
  const { content } = await postJson('/api/ai/chat', { message: userMessage }, 'Failed to generate response. Please try again.');
  return content;
}

/**
 * Stream chat completion response in real-time
 * @param {string} userMessage - The user's input message
 * @param {Function} onChunk - Callback to handle each streamed chunk
 */
export async function getStreamingChatCompletion(userMessage, onChunk) {
  let response;
  try {
    response = await fetch('/api/ai/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
    });
  } catch (networkError) {
    console.error('Network error in streaming chat completion:', networkError);
    throw new Error('Network connection error. Please check your internet connection and try again.');
  }
  if (!response.ok) throw await toError(response, 'Failed to generate response. Please try again.');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    if (text) onChunk(text);
  }
}

/**
 * Generate hashtags for social media content
 * @param {string} content - The content to generate hashtags for
 * @returns {Promise<string[]>} Array of hashtags
 */
export async function generateHashtags(content) {
  const { hashtags } = await postJson('/api/ai/hashtags', { content }, 'Failed to generate hashtags. Please try again.');
  return hashtags;
}

/**
 * Generate an image using DALL-E
 * @param {string} prompt - Description of the desired image
 * @param {string} size - Image size (1024x1024, 1792x1024, or 1024x1792)
 * @returns {Promise<string>} URL of the generated image
 */
export async function generateImage(prompt, size = '1024x1024') {
  const { url } = await postJson('/api/ai/image', { prompt, size }, 'Failed to generate image. Please try again.');
  return url;
}

/**
 * Moderate text content for policy violations
 * @param {string} text - The text to moderate
 * @returns {Promise<object>} Moderation results
 */
export async function moderateText(text) {
  const { result } = await postJson('/api/ai/moderate', { text }, 'Failed to moderate content. Please try again.');
  return result;
}

/**
 * Get networking suggestions based on user profile
 * @param {string} userProfile - User's profile information
 * @returns {Promise<string>} Networking suggestions
 */
export async function getNetworkingSuggestions(userProfile) {
  const { content } = await postJson(
    '/api/ai/networking-suggestions',
    { profile: userProfile },
    'Failed to generate networking suggestions. Please try again.'
  );
  return content;
}

/**
 * Generate content ideas based on a topic and content type
 * @param {string} topic - The topic to generate content ideas for
 * @param {string} contentType - The type of content (post, article, etc.)
 * @returns {Promise<object>} Object containing title, content, and ideas array
 */
export async function generateContentIdeas(topic, contentType = 'post') {
  return postJson('/api/ai/content-ideas', { topic, contentType }, 'Failed to generate content ideas. Please try again.');
}
