import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon';
import { useTheme } from '../../contexts/ThemeContext';
import { getStreamingChatCompletion } from '../../services/openaiService';

const ChatInterface = ({ setIsLoading }) => {
  const { theme } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Create assistant message placeholder
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Use streaming for real-time response
      await getStreamingChatCompletion(
        userMessage.content,
        (chunk) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        }
      );

      // Reset retry count on success
      setRetryCount(0);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the empty assistant message
      setMessages(prev => prev.filter(msg => msg.id !== Date.now() + 1));
      
      // Create error message with specific handling
      const errorMessage = {
        id: Date.now() + 2,
        type: 'assistant',
        content: error?.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        isError: true
      };

      // Add retry option for rate limit errors
      if (error?.isRateLimit) {
        errorMessage.content = `${errorMessage.content}\n\n💡 **Suggestions:**\n• Wait a few minutes before trying again\n• Check your OpenAI account billing and usage\n• Consider upgrading your plan if needed`;
        errorMessage.showRetry = retryCount < 3;
      }

      setMessages(prev => [...prev, errorMessage]);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (messages.length > 0) {
      const lastUserMessage = messages.filter(msg => msg.type === 'user').pop();
      if (lastUserMessage) {
        setInputMessage(lastUserMessage.content);
        // Remove the error message
        setMessages(prev => prev.filter(msg => !msg.isError));
      }
    }
  };

  const quickActions = [
    { label: 'Help me write', icon: 'Edit3' },
    { label: 'Generate ideas', icon: 'Lightbulb' },
    { label: 'Summarize', icon: 'FileText' },
    { label: 'Translate', icon: 'Globe' }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-3 space-y-3 ${
        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
      }`}>
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-2 text-sm ${
                  message.type === 'user' ?'bg-primary text-white'
                    : message.isError
                    ? theme === 'dark' ?'bg-red-900 text-red-100 border border-red-700' :'bg-red-50 text-red-800 border border-red-200'
                    : theme === 'dark' ?'bg-gray-700 text-gray-100' :'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.showRetry && (
                  <button
                    onClick={handleRetry}
                    className={`mt-2 px-3 py-1 rounded text-xs transition-colors ${
                      theme === 'dark' ?'bg-red-800 hover:bg-red-700 text-red-100' :'bg-red-100 hover:bg-red-200 text-red-800'
                    }`}
                  >
                    🔄 Retry
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className={`rounded-lg p-2 text-sm ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div className={`p-2 border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex flex-wrap gap-1">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => setInputMessage(action.label)}
              className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                theme === 'dark' ?'bg-gray-700 text-gray-300 hover:bg-gray-600' :'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon name={action.icon} size={12} />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} className={`p-3 border-t ${
        theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
      }`}>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className={`flex-1 px-3 py-2 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-primary ${
              theme === 'dark' ?'bg-gray-700 border-gray-600 text-white placeholder-gray-400' :'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="Send" size={16} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;