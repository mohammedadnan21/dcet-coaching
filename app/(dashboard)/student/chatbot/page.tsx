"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { Bot, Send, User, Trash2, Sparkles } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  createdAt: string;
}

const suggestedQuestions = [
  "How should I prepare for DCET?",
  "What are the important topics in Mathematics?",
  "Tips for time management during exam?",
  "How to improve in Physics?",
  "What career options after DCET?",
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingHistory, setFetchingHistory] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatHistory();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new message arrives
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchChatHistory = async () => {
    try {
      const response = await fetch("/api/chatbot");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Failed to fetch chat history:", error);
    } finally {
      setFetchingHistory(false);
    }
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);

    // Add user message immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      content: text,
      isBot: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      // Add bot response
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: data.message,
        isBot: true,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!confirm("Clear all chat history?")) return;

    try {
      const res = await fetch("/api/chatbot", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      setMessages([]);
      toast({ title: "Cleared", description: "Chat history cleared" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to clear history", variant: "destructive" });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <Card className="flex-1 border border-amber-900/15 bg-stone-900 shadow-md flex flex-col overflow-hidden">
        <CardHeader className="border-b border-amber-900/20 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI Study Assistant</h2>
                <p className="text-sm text-stone-500 font-normal">24/7 help for your DCET preparation</p>
              </div>
            </CardTitle>
            {messages.length > 0 && (
              <Button variant="ghost" size="icon" onClick={clearHistory} className="text-stone-500 hover:text-amber-400">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {fetchingHistory ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-stone-500">Loading chat...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-900/25 to-amber-900/15 rounded-full flex items-center justify-center mb-4 border border-amber-900/20">
                <Sparkles className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Hello! How can I help you?</h3>
              <p className="text-stone-400 mb-6 max-w-md">
                I'm your AI study assistant. Ask me anything about DCET preparation, subjects, or career guidance!
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {suggestedQuestions.map((q, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => sendMessage(q)}
                    className="text-sm border-amber-900/30 bg-stone-800/50 text-stone-300 hover:bg-amber-900/15 hover:text-amber-400"
                  >
                    {q}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.isBot ? "" : "flex-row-reverse"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.isBot
                        ? "bg-gradient-to-br from-amber-600 to-amber-800"
                        : "bg-stone-800"
                    }`}
                  >
                    {message.isBot ? (
                      <Bot className="w-4 h-4 text-white" />
                    ) : (
                      <User className="w-4 h-4 text-stone-400" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      message.isBot
                        ? "bg-stone-800/50 text-white border border-amber-900/15 rounded-tl-none"
                        : "bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-stone-800/50 p-3 rounded-2xl rounded-tl-none border border-amber-900/15">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-amber-900/20 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question..."
              disabled={loading}
              className="flex-1 border-amber-900/20 bg-stone-950 text-white placeholder:text-stone-500"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
