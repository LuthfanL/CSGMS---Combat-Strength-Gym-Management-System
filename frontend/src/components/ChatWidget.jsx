import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'bot', 
      text: 'Halo! Saya asisten virtual Combat Strength Gym. Ada yang bisa saya bantu terkait harga, jam buka, atau akun Anda?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMsg = { id: Date.now(), sender: 'user', text: inputMessage.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // If user is logged in, attach token so backend knows who is asking (for member status/billing)
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('http://localhost:8000/api/chatbot', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: data.response }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Maaf, terjadi kesalahan saat menyambung ke server.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, sender: 'bot', text: 'Maaf, gagal terhubung ke server. Periksa koneksi Anda.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to render text with basic bold markdown support (**text**)
  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-xl hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] bg-card border border-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-primary p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">CSGMS Assistant</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    Online
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center ${msg.sender === 'user' ? 'bg-primary/20 text-primary' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  {/* Bubble */}
                  <div 
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl whitespace-pre-wrap text-sm shadow-sm
                      ${msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-card border border-border text-foreground/90 rounded-tl-sm'
                      }`}
                  >
                    {msg.sender === 'bot' ? formatText(msg.text) : msg.text}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-secondary border border-border text-secondary-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1">
                    <motion.div 
                      className="w-1.5 h-1.5 bg-foreground/40 rounded-full"
                      animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                    />
                    <motion.div 
                      className="w-1.5 h-1.5 bg-foreground/40 rounded-full"
                      animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                    />
                    <motion.div 
                      className="w-1.5 h-1.5 bg-foreground/40 rounded-full"
                      animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                    />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-3 bg-card border-t border-border">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Ketik pertanyaan Anda..."
                  className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="absolute right-1.5 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-hover disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
              <div className="text-center mt-2">
                <span className="text-[10px] text-foreground/40">Powered by Gemini AI</span>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
