"use client";

import type { NewsArticle } from "@/types";
import { client } from "@/lib/honoClient";
import { Message } from "@/components/ai-elements/message";
import { MessageContent } from "@/components/ai-elements/message";
import { MessageResponse } from "@/components/ai-elements/message";
import { Conversation } from "@/components/ai-elements/conversation";
import { ConversationContent } from "@/components/ai-elements/conversation";
import { ConversationEmptyState } from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
} from "@/components/ai-elements/prompt-input";
import { MessageSquareIcon, SendIcon } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  article: NewsArticle;
}

export default function AIChat({ article }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: ChatMessage = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await client.api.v1.chat.$post({
        json: {
          article: {
            id: article.id,
            headline: article.headline,
            summary: article.summary,
            source: article.source,
            url: article.url,
            image: article.image,
            datetime: article.datetime,
            category: article.category,
            related: article.related,
          },
          message: messages.concat(userMessage).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (response.status === 429) {
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content =
              "Rate limit exceeded. You can only send 2 messages per hour. Please try again later.";
          }
          return newMessages;
        });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("No response body");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
          lastMessage.content =
            "Sorry, I encountered an error. Please try again.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [input, isLoading, messages, article]);

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsLoading(false);
  }, []);

  const handleSubmit = useCallback(() => {
    handleSend();
  }, [handleSend]);

  return (
    <Card className="flex flex-1 h-full overflow-auto border">
      <CardContent className="h-full">
        <div className="flex h-full flex-col border rounded-sm flex-1">
          <div className="border-b px-4 py-3">
            <h2 className="font-semibold text-sm">Chat about this article</h2>
            <p className="text-muted-foreground text-xs">
              Ask questions about {article.headline.slice(0, 30)}...
            </p>
          </div>

          <Conversation className="flex-1 overflow-hidden py-4">
            <ConversationContent className="p-0">
              {messages.length === 0 ? (
                <ConversationEmptyState
                  icon={<MessageSquareIcon className="size-8" />}
                  title="Ask about this article"
                  description="I can help you understand this news better. Ask me anything!"
                />
              ) : (
                messages.map((m, index) => (
                  <Message
                    key={index}
                    from={m.role === "user" ? "user" : "assistant"}
                  >
                    <MessageContent>
                      <MessageResponse>{m.content}</MessageResponse>
                    </MessageContent>
                  </Message>
                ))
              )}
            </ConversationContent>
          </Conversation>

          <div className="border-t p-4">
            <PromptInput onSubmit={handleSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask a question..."
                  className="min-h-[50px] border-none focus-visible:ring-0"
                />
              </PromptInputBody>
              <PromptInputFooter>
                <div className="flex-1" />
                <PromptInputSubmit
                  status={isLoading ? "streaming" : "ready"}
                  onStop={isLoading ? handleStop : undefined}
                />
              </PromptInputFooter>
            </PromptInput>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
