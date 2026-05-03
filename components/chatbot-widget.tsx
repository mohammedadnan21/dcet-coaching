"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, X, MessageCircle, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  isBot: boolean;
}

export function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    const tempUserMsg: Message = {
      id: `user-${Date.now()}`,
      content: userMessage,
      isBot: false,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        content: data.message,
        isBot: true,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        content: "Sorry, something went wrong. Please try again!",
        isBot: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96 h-[70vh] sm:h-[500px] bg-stone-900 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-amber-900/15">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">AI Assistant</p>
            <p className="text-xs text-white/80">Online 24/7</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-stone-950" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center text-stone-500 py-8">
            <Bot className="w-12 h-12 mx-auto mb-2 text-stone-600" />
            <p className="text-stone-400">Hi! Ask me anything about DCET!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isBot ? "" : "justify-end"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.isBot
                      ? "bg-stone-800/50 text-stone-400 rounded-tl-none border border-amber-900/10"
                      : "bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-tr-none"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex">
                <div className="bg-stone-800/50 p-3 rounded-2xl rounded-tl-none border border-amber-900/10">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-2 h-2 bg-stone-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-amber-900/20 bg-stone-900">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask a question..."
            disabled={loading}
            className="flex-1 text-sm border-amber-900/20 bg-stone-800/50 text-white placeholder:text-stone-500"
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            size="icon"
            className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
