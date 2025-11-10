import { useState, useCallback, useRef, useEffect } from "react";
import { API_CONFIG } from "../shared/constants";
import type { ChatMessage, ChatThread, StreamEvent } from "../types";

interface UseChatOptions {
  agentId: string;
  onError?: (error: Error) => void;
}

interface ChatState {
  messages: ChatMessage[];
  currentMessage: string;
  displayedMessage: string;
  streaming: boolean;
  threadId: string | null;
  userId: string | null;
  thread: ChatThread | null;
}

interface ChatSessionData {
  threadId: string;
  userId: string;
  agentId: string;
}

export const useChat = ({ agentId, onError }: UseChatOptions) => {
  const [state, setState] = useState<ChatState>(() => {
    // Try to load existing session from localStorage
    const storedSession = localStorage.getItem(`chat_session_${agentId}`);
    if (storedSession) {
      try {
        const session: ChatSessionData = JSON.parse(storedSession);
        return {
          messages: [],
          currentMessage: "",
          displayedMessage: "",
          streaming: false,
          threadId: session.threadId,
          userId: session.userId,
          thread: null,
        };
      } catch (e) {
        console.error("Error parsing stored session:", e);
      }
    }
    return {
      messages: [],
      currentMessage: "",
      displayedMessage: "",
      streaming: false,
      threadId: null,
      userId: null,
      thread: null,
    };
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const messageBufferRef = useRef<string>("");

  // Save session to localStorage whenever threadId or userId changes
  useEffect(() => {
    if (state.threadId && state.userId) {
      const sessionData: ChatSessionData = {
        threadId: state.threadId,
        userId: state.userId,
        agentId,
      };
      localStorage.setItem(`chat_session_${agentId}`, JSON.stringify(sessionData));
    }
  }, [state.threadId, state.userId, agentId]);

  // Typing effect: gradually reveal characters from currentMessage
  useEffect(() => {
    if (state.currentMessage.length === 0) {
      // Reset when message is cleared
      messageBufferRef.current = "";
      setState((prev) => ({ ...prev, displayedMessage: "" }));
      return;
    }

    // Update buffer with new content
    messageBufferRef.current = state.currentMessage;

    // Clear any existing interval
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    // Start typing effect
    let currentIndex = state.displayedMessage.length;
    
    typingIntervalRef.current = window.setInterval(() => {
      const targetMessage = messageBufferRef.current;
      
      if (currentIndex < targetMessage.length) {
        // Add 1-3 characters at a time for smoother effect
        const charsToAdd = Math.min(3, targetMessage.length - currentIndex);
        currentIndex += charsToAdd;
        
        setState((prev) => ({
          ...prev,
          displayedMessage: targetMessage.slice(0, currentIndex),
        }));
      } else {
        // Typing caught up, clear interval
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
      }
    }, 30); // 30ms interval for smooth typing

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentMessage]);

  const sendMessage = useCallback(
    async (message: string, userName?: string) => {
      if (!message.trim() || state.streaming) return;

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        messageId: `temp_${Date.now()}`,
        threadId: state.threadId || "",
        role: "user",
        content: message,
        createdAt: new Date().toISOString(),
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        streaming: true,
        currentMessage: "",
        displayedMessage: "",
      }));

      try {
        // Create abort controller for this request
        abortControllerRef.current = new AbortController();

        // Build request body
        const requestBody: {
          agentId: string;
          message: string;
          threadId?: string;
          userId?: string;
          userName?: string;
        } = {
          agentId,
          message,
        };

        // Add threadId and userId if they exist (for continuing conversation)
        if (state.threadId) {
          requestBody.threadId = state.threadId;
        }
        if (state.userId) {
          requestBody.userId = state.userId;
        }

        // Add userName only on first message (when no threadId exists)
        if (!state.threadId && userName) {
          requestBody.userName = userName;
        }

        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.path.chatSend}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body");
        }

        const decoder = new TextDecoder();
        let assistantMessage = "";
        let newThreadId = state.threadId;
        let newUserId = state.userId;
        let newThread = state.thread;

        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data: StreamEvent = JSON.parse(line.slice(6));
                
                // Debug log for delta events
                if (data.type === "thread.message.delta") {
                  console.log("[Chat Delta]", {
                    type: data.type,
                    hasDataDelta: !!data.data?.delta,
                    hasDelta: !!data.delta,
                    text: data.data?.delta?.content?.[0]?.text?.value || data.delta?.content?.[0]?.text?.value || "NO TEXT FOUND"
                  });
                }

                switch (data.type) {
                  case "session":
                    // Handle session event - contains userId and isNewUser
                    if (data.userId) {
                      newUserId = data.userId;
                      setState((prev) => ({
                        ...prev,
                        userId: newUserId,
                      }));
                    }
                    break;

                  case "thread":
                    // Handle thread event - contains thread info
                    newThreadId = data.thread?.threadId || data.thread?.id || null;
                    if (data.thread?.userId) {
                      newUserId = data.thread.userId;
                    }
                    newThread = data.thread || null;
                    setState((prev) => ({
                      ...prev,
                      threadId: newThreadId,
                      userId: newUserId,
                      thread: newThread,
                    }));
                    break;

                  case "thread.run.created":
                  case "thread.run.in_progress":
                  case "thread.run.step.in_progress":
                    // These events indicate processing is happening
                    // No action needed, just log for debugging
                    console.log(`[Chat] ${data.type}`, data);
                    break;

                  case "thread.message.created":
                  case "thread.message.in_progress":
                    // Message is being created/processed
                    // No action needed yet
                    break;

                  case "thread.message.delta": {
                    // Handle streaming text delta
                    // Try multiple possible paths for the text value
                    let text = "";
                    
                    // Path 1: data.data.delta.content[0].text.value
                    if (data.data?.delta?.content?.[0]?.text?.value) {
                      text = data.data.delta.content[0].text.value;
                    }
                    // Path 2: data.delta.content[0].text.value
                    else if (data.delta?.content?.[0]?.text?.value) {
                      text = data.delta.content[0].text.value;
                    }
                    // Path 3: data.data.delta.content[0].text (if text is direct string)
                    else if (typeof data.data?.delta?.content?.[0]?.text === 'string') {
                      text = data.data.delta.content[0].text;
                    }
                    
                    if (text) {
                      assistantMessage += text;
                      setState((prev) => ({
                        ...prev,
                        currentMessage: assistantMessage,
                      }));
                    }
                    break;
                  }

                  case "thread.message.completed": {
                    // Message is complete, add to messages array
                    const completedMessage: ChatMessage = {
                      id: data.data?.id || Date.now().toString(),
                      messageId: data.data?.id || `msg_${Date.now()}`,
                      threadId: newThreadId || "",
                      role: "assistant",
                      content: assistantMessage,
                      runId: data.data?.run_id,
                      createdAt: new Date().toISOString(),
                    };

                    setState((prev) => ({
                      ...prev,
                      messages: [...prev.messages, completedMessage],
                      currentMessage: "",
                      displayedMessage: "",
                    }));
                    break;
                  }

                  case "thread.run.completed":
                    // Run is complete
                    console.log("[Chat] Run completed", data);
                    break;

                  case "done":
                    setState((prev) => ({
                      ...prev,
                      streaming: false,
                    }));
                    break;

                  case "error":
                    throw new Error(data.message || "Stream error occurred");
                }
              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setState((prev) => ({
          ...prev,
          streaming: false,
          currentMessage: "",
          displayedMessage: "",
        }));

        if (error instanceof Error && error.name !== "AbortError") {
          onError?.(error);
        }
      }
    },
    [agentId, state.threadId, state.userId, state.thread, state.streaming, onError]
  );

  const addGreetingMessage = useCallback((greetingText: string) => {
    const greetingMessage: ChatMessage = {
      id: `greeting_${Date.now()}`,
      messageId: `greeting_${Date.now()}`,
      threadId: "",
      role: "assistant",
      content: greetingText,
      createdAt: new Date().toISOString(),
    };

    setState((prev) => ({
      ...prev,
      messages: [greetingMessage],
    }));
  }, []);

  const clearChat = useCallback(() => {
    // Clear localStorage session
    localStorage.removeItem(`chat_session_${agentId}`);
    
    setState({
      messages: [],
      currentMessage: "",
      displayedMessage: "",
      streaming: false,
      threadId: null,
      userId: null,
      thread: null,
    });
  }, [agentId]);

  const cancelStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState((prev) => ({
        ...prev,
        streaming: false,
        currentMessage: "",
        displayedMessage: "",
      }));
    }
  }, []);

  return {
    messages: state.messages,
    currentMessage: state.displayedMessage, // Return displayed message for UI
    streaming: state.streaming,
    threadId: state.threadId,
    userId: state.userId,
    thread: state.thread,
    sendMessage,
    addGreetingMessage,
    clearChat,
    cancelStream,
  };
};
