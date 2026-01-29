
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Loader2 } from 'lucide-react';
import { askAiTutor } from '../services/geminiService';
import { Message } from '../types';

interface AiTutorProps {
  lessonContext: string;
}

const AiTutor: React.FC<AiTutorProps> = ({ lessonContext }) => {
  // State for messages
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "Halo! Saya AI Tutor kamu. Ada yang kurang jelas dari materi ini? Silakan tanya saja." }
  ]);
  
  // State for Input and Loading
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Call service which now uses process.env.API_KEY
    const responseText = await askAiTutor(userMessage.text, lessonContext);
    
    setIsLoading(false);
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- RENDER: CHAT INTERFACE ---
  return (
    <div className="flex flex-col h-[500px] bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-50 to-white px-4 py-3 border-b border-primary-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <div className="bg-primary-100 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary-500" />
            </div>
            <div>
            <h3 className="text-sm font-bold text-zinc-900">AI Tutor</h3>
            <p className="text-xs text-zinc-500">Aktif</p>
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-zinc-50/50">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-primary-500 text-white rounded-tr-none' 
                  : 'bg-white text-zinc-700 border border-zinc-200 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-xs text-zinc-400">Sedang berpikir...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-zinc-200">
        <div className="relative flex items-center">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Tanya sesuatu tentang materi video ini..."
            className="w-full pl-4 pr-12 py-3 bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm text-zinc-700 placeholder-zinc-400 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 p-1.5 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:hover:bg-primary-500 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiTutor;
