import { useState, useCallback, useRef, useEffect } from "react";
import { API_CONFIG } from "../shared/constants";
import type { ChatMessage, ChatThread, StreamEvent } from "../types";
import { getIdToken } from "../services/authService";

interface UseChatOptions {
  agentId: string;
  threadId?: string;
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

export const useChat = ({
  agentId,
  threadId: initialThreadId,
  onError,
}: UseChatOptions) => {
  const [state, setState] = useState<ChatState>({
    messages: [],
    currentMessage: "",
    displayedMessage: "",
    streaming: false,
    threadId: initialThreadId || null,
    userId: null,
    thread: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const typingIntervalRef = useRef<number | null>(null);
  const messageBufferRef = useRef<string>("");

  // Refs to track latest threadId and userId for API calls
  const threadIdRef = useRef<string | null>(state.threadId);
  const userIdRef = useRef<string | null>(state.userId);

  // Update threadId when initialThreadId prop changes (when user selects different session)
  useEffect(() => {
    // Update threadId when it changes (including when it becomes null for new chat)
    if (initialThreadId !== state.threadId) {
      setState((prev) => ({
        ...prev,
        threadId: initialThreadId || null,
      }));
    }
  }, [initialThreadId, state.threadId]);

  // Update refs whenever state changes
  useEffect(() => {
    threadIdRef.current = state.threadId;
    userIdRef.current = state.userId;
  }, [state.threadId, state.userId]);

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
        // Add 1-2 characters at a time for typewriter effect
        const charsToAdd = Math.min(2, targetMessage.length - currentIndex);
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
    }, 20); // 20ms interval for smooth typewriter effect

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentMessage]);

  const sendMessage = useCallback(
    async (message: string, userName?: string, isTestMode?: boolean) => {
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

        // Get Firebase ID token for authentication
        const idToken = await getIdToken();

        // Build request body
        const requestBody: {
          agentId: string;
          message: string;
          threadId?: string;
          userId?: string;
          userName?: string;
          environment?: "live" | "test";
        } = {
          agentId,
          message,
          environment: isTestMode ? "test" : "live",
        };

        // Use refs to get the latest threadId and userId values
        const currentThreadId = threadIdRef.current;
        const currentUserId = userIdRef.current;

        // Add threadId and userId if they exist (for continuing conversation)
        if (currentThreadId) {
          requestBody.threadId = currentThreadId;
        }
        if (currentUserId) {
          requestBody.userId = currentUserId;
        }

        // Add userName only on first message (when no threadId exists)
        if (!currentThreadId && userName) {
          requestBody.userName = userName;
        }

        // Build headers
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };

        // Add Authorization header with ID token if available
        console.log("🚀 ~ useChat ~ idToken:", idToken);
        if (idToken) {
          headers["Authorization"] = `Bearer ${idToken}`;
        }

        const response = await fetch(
          `${API_CONFIG.baseUrl}${API_CONFIG.path.chatSend}`,
          {
            method: "POST",
            headers,
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
        let newThreadId = threadIdRef.current;
        let newUserId = userIdRef.current;
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
                    text:
                      data.data?.delta?.content?.[0]?.text?.value ||
                      data.delta?.content?.[0]?.text?.value ||
                      "NO TEXT FOUND",
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
                    newThreadId =
                      data.thread?.threadId || data.thread?.id || null;
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
                    setState((prev) => ({
                      ...prev,
                      streaming: true,
                    }));
                    break;

                  case "thread.message.created":
                  case "thread.message.in_progress":
                    // Message is being created/processed
                    // No action needed yet
                    setState((prev) => ({
                      ...prev,
                      streaming: true,
                    }));
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
                    else if (
                      typeof data.data?.delta?.content?.[0]?.text === "string"
                    ) {
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
                      streaming: false,
                    }));
                    break;
                  }

                  case "thread.run.completed":
                    // Run is complete
                    console.log("[Chat] Run completed", data);
                    setState((prev) => ({
                      ...prev,
                      streaming: false,
                    }));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.streaming, state.thread, agentId, onError]
    // Note: state.threadId and state.userId are intentionally excluded
    // We use refs (threadIdRef, userIdRef) to access the latest values
  );

  // Removed addGreetingMessage - greeting should be shown in UI only, not as a message

  const setMessages = useCallback((messages: ChatMessage[]) => {
    setState((prev) => ({
      ...prev,
      messages,
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
    setMessages,
    clearChat,
    cancelStream,
  };
};
