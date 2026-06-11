'use client';
import React, { useState } from 'react';
import { Bot, X, Send } from 'lucide-react';
import { useAIContext } from './GlobalAIContext';

export function AIChatWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { getAIContextString, incrementToolUsage } = useAIContext();

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Inject the context invisibly before sending
      const contextMessage = { role: 'system', content: getAIContextString() };
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [contextMessage, ...newMessages]
        })
      });

      const data = await response.json();
      
      setMessages([...newMessages, { role: 'assistant', content: data.response }]);
      incrementToolUsage();
    } catch (error) {
      setMessages([...newMessages, { role: 'assistant', content: 'Oops, something went wrong. Could not connect to AI.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform z-50"
      >
        <Bot size={24} />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl overflow-hidden z-50 flex flex-col h-[500px]">
          <div className="bg-primary/10 p-4 border-b border-primary/20 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="text-primary" size={20} />
              <span className="font-bold text-primary">AI Copilot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-foreground/50 text-sm mt-10">
                Ask me anything! I know what page you are on.
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-gray-100 text-foreground rounded-bl-none'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-foreground p-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white/50 border-t border-card-border">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="w-full bg-white border border-card-border rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-primary text-sm shadow-sm"
              />
              <button 
                onClick={handleSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
