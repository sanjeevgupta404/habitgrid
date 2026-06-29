import { useState } from 'react';
import { Send, Bot, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { aiService } from '../../services/ai';
import { Card, CardContent } from '../ui/Card';

export const AIAssistant = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello! I am your CineVerse AI assistant. Ask me for recommendations!' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const response = await aiService.getRecommendations(userMsg);
      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
    } catch (err) {
      console.error('AI error:', err);
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className='w-full max-w-2xl mx-auto'>
      <div className='p-4 border-b flex items-center justify-between bg-primary/5'>
        <div className='flex items-center gap-2'>
          <Bot className='h-5 w-5 text-primary' />
          <span className='font-bold'>AI Recommendations</span>
        </div>
        <Sparkles className='h-4 w-4 text-yellow-500 animate-pulse' />
      </div>
      <CardContent className='p-0'>
        <div className='h-80 overflow-y-auto p-4 space-y-4 no-scrollbar'>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted rounded-tl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-muted p-3 rounded-lg rounded-tl-none animate-pulse'>
                Thinking...
              </div>
            </div>
          )}
        </div>
        <div className='p-4 border-t flex gap-2'>
          <Input
            placeholder='e.g. Recommend some psychological thrillers'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button size='icon' onClick={handleSend} disabled={loading}>
            <Send className='h-4 w-4' />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
