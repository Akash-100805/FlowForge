import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, X, Send } from 'lucide-react';
import { sendChatMessage } from '../services/aiService';

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen, loading]);

  const extractProjectId = () => {
    const match = location.pathname.match(/\/project\/([a-zA-Z0-9-]+)\//);
    return match ? match[1] : null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const projectId = extractProjectId();
      const res = await sendChatMessage(userMessage, projectId);
      setMessages((prev) => [...prev, { role: 'ai', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'system', content: 'Connection error. Please check your API key and network.' },
      ]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-accent rounded-full flex items-center justify-center shadow-lg shadow-accent/25 transition-all duration-300 z-50 hover:bg-accent-hover hover:scale-110 ${
          isOpen ? 'opacity-0 pointer-events-none scale-0' : 'opacity-100 scale-100'
        }`}
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>

      <div
        className={`fixed bottom-8 right-8 w-96 h-[500px] max-h-[80vh] bg-sidebar border border-border rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/70 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-accent" />
            <div>
              <h3 className="text-text-primary font-bold text-sm leading-tight">FlowForge AI Assistant</h3>
              <p className="text-[10px] text-text-tertiary uppercase tracking-wider">
                {extractProjectId() ? 'Project Context Active' : 'Global Context Active'}
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-text-tertiary text-sm mt-10">
              <p className="mb-2">Hello! How can I help you today?</p>
              <p className="text-xs">Try asking: "What should I do next?"</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-xl p-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent text-white rounded-br-none'
                    : msg.role === 'system'
                      ? 'bg-red-500/20 text-red-200 border border-red-500/30 rounded-bl-none'
                      : 'bg-secondary text-text-primary rounded-bl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary rounded-xl rounded-bl-none p-3 px-4 flex gap-1">
                <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-text-tertiary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-border bg-secondary/70 rounded-b-2xl">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask me anything..."
              className="input-styled flex-1 h-10 text-sm py-0 pl-4"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center text-white hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
