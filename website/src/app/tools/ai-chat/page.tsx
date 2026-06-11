'use client';
import { useState, useRef, useEffect } from 'react';
import { Send, Plus, X, Bot, User, Sparkles, Code, FileJson, Type, Hash, Settings, Search, MessageSquare, PlusCircle, Menu, Image as ImageIcon } from 'lucide-react';
import { marked } from 'marked';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  image?: string;
}

interface ToolContext {
  id: string;
  name: string;
  icon: React.ReactNode;
  prompt: string;
}

const AVAILABLE_TOOLS: ToolContext[] = [
  { id: 'web', name: 'Live Web Search', icon: <Search className="w-4 h-4" />, prompt: 'SEARCH_WEB_TOOL_ENABLED' },
  { id: 'json', name: 'JSON Formatter', icon: <FileJson className="w-4 h-4" />, prompt: 'You are an expert JSON formatter. The user will provide text or malformed JSON. Validate, format, and return ONLY the pretty-printed JSON enclosed in a ```json code block. Do not add conversational text.' },
  { id: 'ui', name: 'UI Generator', icon: <Code className="w-4 h-4" />, prompt: 'You are an expert Frontend Developer. Generate beautiful, responsive HTML and TailwindCSS code based on the user request. Output only the code enclosed in an HTML block.' },
  { id: 'seo', name: 'SEO & Word Counter', icon: <Type className="w-4 h-4" />, prompt: 'You are an SEO Expert. Analyze the given text, provide Word Count, Character Count, Reading Time, and 3 SEO improvements or keyword suggestions.' },
  { id: 'password', name: 'Password Generator', icon: <Hash className="w-4 h-4" />, prompt: 'You are a Secure Password Generator. Generate 5 highly secure, random passwords (16+ chars, special chars, numbers). Provide them in a list.' },
  { id: 'sql', name: 'SQL Formatter', icon: <Settings className="w-4 h-4" />, prompt: 'You are a Database Expert. Format and optimize the provided SQL query. Output the optimized query in a ```sql block and explain any performance improvements below it.' }
];

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am your Universal Agentic AI. You can chat with me normally, or click the **+** button to select a specific tool and I will execute it for you!' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTool, setSelectedTool] = useState<ToolContext | null>(null);
  const [showToolMenu, setShowToolMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // API Settings
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.openai.com/v1');
  const [modelName, setModelName] = useState('gpt-4o');
  
  // Database States
  const [chats, setChats] = useState<{id: string, title: string, created_at: string}[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string>('');

  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats and settings on mount
  useEffect(() => {
    let sId = localStorage.getItem('ai_session_id');
    if (!sId) {
      sId = crypto.randomUUID();
      localStorage.setItem('ai_session_id', sId);
    }
    setSessionId(sId);
    fetchChats(sId);
    
    const storedApiKey = localStorage.getItem('ai_api_key');
    const storedBaseUrl = localStorage.getItem('ai_base_url');
    const storedModelName = localStorage.getItem('ai_model_name');
    if (storedApiKey) setApiKey(storedApiKey);
    if (storedBaseUrl) setBaseUrl(storedBaseUrl);
    if (storedModelName) setModelName(storedModelName);
  }, []);

  const fetchChats = async (sId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_chats')
        .select('id, title, created_at')
        .eq('session_id', sId)
        .order('created_at', { ascending: false });
      if (data) setChats(data as any);
    } catch(e) {
      console.error("Failed to load history", e);
    }
  };

  const loadChat = async (id: string) => {
    setCurrentChatId(id);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('role, content, image')
        .eq('chat_id', id)
        .order('created_at', { ascending: true });
      if(data && data.length > 0) {
        setMessages(data as Message[]);
      } else {
        setMessages([{ role: 'assistant', content: 'Hello! I am your Universal Agentic AI. You can chat with me normally, or click the **+** button to select a specific tool and I will execute it for you!' }]);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setCurrentChatId(null);
    setMessages([{ role: 'assistant', content: 'Hello! I am your Universal Agentic AI. How can I help you today?' }]);
  };

  const saveSettings = () => {
    localStorage.setItem('ai_api_key', apiKey);
    localStorage.setItem('ai_base_url', baseUrl);
    localStorage.setItem('ai_model_name', modelName);
    setShowSettings(false);
  };

  const handleSend = async () => {
    if (!input.trim() && !selectedTool && !attachedImage) return;
    
    const userContent = input.trim();
    const newMessages = [...messages, { role: 'user', content: userContent, image: attachedImage }] as Message[];
    setMessages(newMessages);
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    let activeChatId = currentChatId;
    
    // Create new chat in Supabase if it doesn't exist
    if (!activeChatId) {
      activeChatId = crypto.randomUUID();
      setCurrentChatId(activeChatId);
      const newChatTitle = userContent.substring(0, 30) + '...';
      const newChatMeta = { id: activeChatId, title: newChatTitle, session_id: sessionId };
      setChats([newChatMeta as any, ...chats]);
      
      await supabase.from('ai_chats').insert(newChatMeta);
    }

    // Save User message
    await supabase.from('ai_messages').insert({
      chat_id: activeChatId,
      role: 'user',
      content: userContent,
      image: attachedImage
    });

    try {
      const payloadMessages = [];
      if (selectedTool) {
        payloadMessages.push({ role: 'system', content: selectedTool.prompt });
      } else {
        payloadMessages.push({ role: 'system', content: 'You are a highly capable AI assistant on the AI ToolYes platform. Provide helpful, accurate, and concise answers.' });
      }

      const chatHistory = newMessages.filter((m, i) => i !== 0 || m.role !== 'assistant');
      payloadMessages.push(...chatHistory);

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          apiConfig: apiKey ? { apiKey, baseUrl, modelName } : null
        }),
      });

      if (!response.ok) throw new Error('API Error');

      const data = await response.json();
      const finalMessages = [...newMessages, { role: 'assistant', content: data.response }] as Message[];
      setMessages(finalMessages);
      
      // Save full chat history to Supabase
      if (activeChatId) {
        await supabase.from('ai_messages').insert({
          chat_id: activeChatId,
          role: 'assistant',
          content: data.response
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI backend. Please check your API keys.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMarkdown = (content: string) => {
    return { __html: marked.parse(content) as string };
  };

  return (
    <div className="flex h-[calc(100vh-100px)] max-w-7xl mx-auto gap-4 relative overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar: Chat History */}
      <motion.div 
        className={`absolute md:relative top-0 left-0 h-full w-72 flex flex-col bg-white/90 md:bg-white/40 border border-white/50 rounded-r-3xl md:rounded-3xl shadow-2xl md:shadow-sm backdrop-blur-xl z-50 transition-transform duration-300 md:translate-x-0 ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-card-border bg-white/60 flex items-center justify-between">
          <button 
            onClick={() => { startNewChat(); setShowMobileSidebar(false); }}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl font-medium transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {chats.map(chat => (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              key={chat.id}
              onClick={() => { loadChat(chat.id); setShowMobileSidebar(false); }}
              className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-colors ${
                currentChatId === chat.id ? 'bg-indigo-100 text-indigo-900 border border-indigo-200' : 'hover:bg-white/60 text-foreground/80 border border-transparent'
              }`}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${currentChatId === chat.id ? 'text-indigo-600' : 'text-foreground/40'}`} />
              <div className="flex-1 truncate text-sm font-medium">{chat.title}</div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Main Chat Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col bg-white/40 border border-white/50 rounded-3xl overflow-hidden shadow-sm backdrop-blur-md relative"
      >
        {/* Header */}
        <div className="bg-white/60 border-b border-card-border p-4 flex items-center justify-between z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-foreground/70 hover:bg-white/50 rounded-xl"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <motion.div 
              animate={{ 
                y: [-2, 2, -2],
                rotateZ: [0, 5, -5, 0],
                boxShadow: [
                  "0px 4px 20px rgba(99, 102, 241, 0.3)",
                  "0px 10px 25px rgba(168, 85, 247, 0.5)",
                  "0px 4px 20px rgba(99, 102, 241, 0.3)"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-white/20 border border-white/50 flex items-center justify-center cursor-pointer backdrop-blur-md relative overflow-hidden shadow-xl"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Glassmorphism shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/60 to-transparent opacity-50 z-10" />
              
              {/* Live motion gradient background */}
              <motion.div 
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute w-[150%] h-[150%] bg-gradient-to-tr from-indigo-400 via-purple-500 to-pink-500 opacity-40 mix-blend-overlay"
              />
              
              {/* Logo Icon */}
              <Sparkles className="w-6 h-6 text-indigo-700 z-20 drop-shadow-md" />
            </motion.div>
            <div>
              <h1 className="font-bold text-lg text-foreground leading-tight">AI ToolYes</h1>
              <p className="text-xs text-foreground/60">{apiKey ? `Powered by ${modelName}` : 'Powered by Cloud Engine'}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-foreground/60 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            title="API Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-sm'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none shadow-md' 
                    : 'bg-white border border-card-border shadow-sm rounded-tl-none'
                }`}>
                  {msg.role === 'user' ? (
                    <div className="flex flex-col gap-2">
                      {msg.image && <img src={msg.image} alt="User upload" className="max-w-sm rounded-lg shadow-sm border border-black/10" />}
                      {msg.content && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                    </div>
                  ) : (
                    <div 
                      className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl"
                      dangerouslySetInnerHTML={parseMarkdown(msg.content)}
                    />
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-card-border shadow-sm rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-2">
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-2 h-2 rounded-full bg-indigo-500"></motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 rounded-full bg-indigo-500"></motion.div>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 rounded-full bg-indigo-500"></motion.div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/60 border-t border-card-border backdrop-blur-md relative">
          <AnimatePresence>
            {showToolMenu && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-[calc(100%+10px)] left-4 bg-white border border-card-border shadow-xl rounded-2xl p-2 w-64 z-20"
              >
                <div className="text-xs font-bold text-foreground/50 uppercase tracking-wider px-3 py-2 mb-1">Select Tool Capability</div>
                <div className="space-y-1">
                  {AVAILABLE_TOOLS.map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => { setSelectedTool(tool); setShowToolMenu(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 rounded-xl text-left transition-colors"
                    >
                      <div className="text-indigo-600">{tool.icon}</div>
                      <span className="text-sm font-semibold text-foreground">{tool.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {selectedTool && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg w-fit shadow-sm"
                >
                  <div className="text-indigo-600">{selectedTool.icon}</div>
                  <span className="text-xs font-bold text-indigo-700">Executing: {selectedTool.name}</span>
                  <button 
                    onClick={() => setSelectedTool(null)}
                    className="ml-2 text-indigo-400 hover:text-indigo-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

              <div className="flex flex-col gap-2">
                <AnimatePresence>
                  {attachedImage && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="relative w-24 h-24">
                      <img src={attachedImage} className="w-full h-full object-cover rounded-xl border-2 border-indigo-200 shadow-md" />
                      <button onClick={() => setAttachedImage(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:scale-110 transition-transform"><X className="w-3 h-3" /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="flex items-end gap-2">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-xl flex-shrink-0 bg-white border border-card-border text-foreground/60 hover:bg-gray-50 transition-colors shadow-sm"
                    title="Upload Image"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowToolMenu(!showToolMenu)}
                    className={`p-3 rounded-xl flex-shrink-0 transition-colors ${
                      showToolMenu || selectedTool 
                        ? 'bg-indigo-600 text-white shadow-md' 
                        : 'bg-white border border-card-border text-foreground/60 hover:bg-gray-50'
                    }`}
                    title="Attach Tool Capability"
                  >
                    <Plus className={`w-5 h-5 transition-transform ${showToolMenu ? 'rotate-45' : ''}`} />
                  </motion.button>
              
              <div className="flex-1 bg-white border border-card-border rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all flex items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={selectedTool ? `Instruct the ${selectedTool.name}...` : "Ask the AI anything..."}
                  className="w-full max-h-32 min-h-[44px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-sm"
                  rows={1}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  disabled={isLoading || (!input.trim() && !selectedTool)}
                  className="p-2 m-1 rounded-lg bg-indigo-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">API Configuration</h2>
                  <p className="text-sm text-gray-500">Bring Your Own Key (BYOK)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">API Key</label>
                  <input 
                    type="password" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Stored locally in your browser.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Base URL (For Local/Ollama/DeepSeek)</label>
                  <input 
                    type="text" 
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-gray-700">Model Name</label>
                  <input 
                    type="text" 
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="gpt-4o"
                    className="w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    onClick={() => {
                      setApiKey('');
                      setBaseUrl('https://api.openai.com/v1');
                      setModelName('gpt-4o');
                      localStorage.removeItem('ai_api_key');
                      localStorage.removeItem('ai_base_url');
                      localStorage.removeItem('ai_model_name');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                  >
                    Clear Keys
                  </button>
                  <button 
                    onClick={saveSettings}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
