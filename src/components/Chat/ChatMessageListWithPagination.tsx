import { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useInView } from "react-intersection-observer";
import {
  fetchMessages,
  selectMessagesByChatId,
} from "../../store/slices/messageSlice";
import { resetUnreadMessages } from "../../store/slices/chatSlice";
import { emitSocketAction } from "../../store/middleware/socketMiddleware";
import { SOCKET_ACTIONS } from "../../api/socket";
import { type Message } from "../../types";
import ChatMessagesSkeleton from "./ChatMessagesSkeleton";
import LoadingMoreSkeleton from "./LoadingMoreSkeleton";

type ChatMessageListProps = {
  currentChat: any;
  currentUser: any;
};

const MESSAGES_PER_PAGE = 15;

const ChatMessageList = ({
  currentChat,
  currentUser,
}: ChatMessageListProps) => {
  const dispatch = useDispatch();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasResetUnreadMessages, setHasResetUnreadMessages] = useState(false);
  const [showContentAfterSkeleton, setShowContentAfterSkeleton] =
    useState(false);

  const messages = useSelector((state: any) =>
    selectMessagesByChatId(state, currentChat._id)
  );

  // Intersection observers
  const { ref: topRef, inView: topInView } = useInView({
    threshold: 0,
    rootMargin: "50px 0px 0px 0px",
    skip: !isInitialLoadComplete,
  });

  const { ref: bottomRef, inView: bottomInView } = useInView({
    threshold: 0,
    rootMargin: "0px 0px 50px 0px",
  });

  // Improved scroll to bottom function
  const scrollToBottom = useCallback((behavior: "auto" | "smooth" = "auto") => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
    }, 0);
  }, []);

  const loadMoreMessages = useCallback(async () => {
    if (
      !topInView ||
      isLoadingMore ||
      !hasMoreMessages ||
      !messages?.length ||
      !isInitialLoadComplete
    )
      return;

    setIsLoadingMore(true);
    try {
      const currentMessageCount = messages.length;
      const container = messagesContainerRef.current;

      if (!container) return;

      const containerTop = container.getBoundingClientRect().top;
      let firstVisibleMessage = null;
      const messageElements = container.querySelectorAll("[data-message-id]");

      for (const element of messageElements) {
        const elementRect = element.getBoundingClientRect();
        const relativeTop = elementRect.top - containerTop;

        if (relativeTop >= 0) {
          firstVisibleMessage = element;
          break;
        }
      }

      const result = await dispatch(
        fetchMessages({
          chatId: currentChat._id,
          receiverId: currentChat.otherParticipant?._id,
          skip: currentMessageCount,
          limit: MESSAGES_PER_PAGE,
        }) as any
      ).unwrap();

      setTimeout(() => {
        if (container && firstVisibleMessage && result.messages.length > 0) {
          const messageId = firstVisibleMessage.getAttribute("data-message-id");
          const updatedMessageElement = container.querySelector(
            `[data-message-id="${messageId}"]`
          );

          if (updatedMessageElement) {
            const allMessageElements =
              container.querySelectorAll("[data-message-id]");
            const messageArray = Array.from(allMessageElements);
            const targetMessageIndex = messageArray.findIndex(
              (el) => el.getAttribute("data-message-id") === messageId
            );

            const messagesToShowBefore = Math.min(3, targetMessageIndex);
            const scrollTargetIndex = Math.max(
              0,
              targetMessageIndex - messagesToShowBefore
            );
            const scrollTargetElement: any = messageArray[scrollTargetIndex];

            if (scrollTargetElement) {
              const elementTop = scrollTargetElement.offsetTop;
              container.scrollTop = Math.max(0, elementTop - 20);
            }
          }
        }
      }, 50);

      setHasMoreMessages(result.messages.length >= MESSAGES_PER_PAGE);
    } catch (error) {
      console.error("Failed to load more messages:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    topInView,
    isLoadingMore,
    hasMoreMessages,
    messages,
    isInitialLoadComplete,
    dispatch,
    currentChat._id,
    currentChat.otherParticipant?._id,
  ]);

  // Load more messages when top comes into view
  useEffect(() => {
    loadMoreMessages();
  }, [loadMoreMessages]);

  // Initial load and socket management
  useEffect(() => {
    if (!currentChat._id) return;

    const initializeChat = async () => {
      setIsInitialLoading(true);
      setHasMoreMessages(true);
      setShouldAutoScroll(true);
      setIsInitialLoadComplete(false);
      setHasScrolledToBottom(false);
      setHasResetUnreadMessages(false);
      setShowContentAfterSkeleton(false);

      try {
        // Show skeleton for at least 1 second for smooth UX
        const minLoadingTime = new Promise((resolve) =>
          setTimeout(resolve, 1000)
        );

        const messagesPromise = dispatch(
          fetchMessages({
            chatId: currentChat._id,
            receiverId: currentChat.otherParticipant?._id,
            skip: 0,
            limit: MESSAGES_PER_PAGE,
          }) as any
        ).unwrap();

        await Promise.all([minLoadingTime, messagesPromise]);

        dispatch(
          emitSocketAction(SOCKET_ACTIONS.JOIN_CHAT, {
            chatId: currentChat._id,
          }) as any
        );

        // Small delay before showing content to ensure smooth transition
        setTimeout(() => {
          setShowContentAfterSkeleton(true);
        }, 100);
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setShowContentAfterSkeleton(true); // Show content even on error
      } finally {
        setIsInitialLoading(false);
      }
    };

    initializeChat();

    return () => {
      dispatch(
        emitSocketAction(SOCKET_ACTIONS.LEAVE_CHAT, {
          chatId: currentChat._id,
        }) as any
      );
    };
  }, [currentChat._id, dispatch]);

  // Scroll to bottom after initial messages are loaded and rendered
  useEffect(() => {
    if (
      !isInitialLoading &&
      showContentAfterSkeleton &&
      messages &&
      messages.length > 0 &&
      !hasScrolledToBottom
    ) {
      const timeouts = [0, 50, 100, 200];

      timeouts.forEach((delay) => {
        setTimeout(() => {
          scrollToBottom("auto");
        }, delay);
      });

      setTimeout(() => {
        setIsInitialLoadComplete(true);
        setHasScrolledToBottom(true);
      }, 300);
    }
  }, [
    isInitialLoading,
    showContentAfterSkeleton,
    messages,
    hasScrolledToBottom,
    scrollToBottom,
  ]);

  // Reset unread messages count after first render and initial load completion
  useEffect(() => {
    if (
      !isInitialLoading &&
      isInitialLoadComplete &&
      hasScrolledToBottom &&
      !hasResetUnreadMessages &&
      currentChat._id
    ) {
      dispatch(resetUnreadMessages(currentChat._id));
      setHasResetUnreadMessages(true);
    }
  }, [
    isInitialLoading,
    isInitialLoadComplete,
    hasScrolledToBottom,
    hasResetUnreadMessages,
    currentChat._id,
    dispatch,
  ]);

  // Handle new message auto-scroll
  useEffect(() => {
    if (isInitialLoading || isLoadingMore || !messages || !hasScrolledToBottom)
      return;

    const newMessageCount = messages.length;
    if (newMessageCount <= messageCount) return;

    setMessageCount(newMessageCount);

    if (shouldAutoScroll || bottomInView) {
      setTimeout(() => {
        scrollToBottom("smooth");
      }, 100);
    }

    setShouldAutoScroll(false);
  }, [
    messages?.length,
    isInitialLoading,
    isLoadingMore,
    bottomInView,
    hasScrolledToBottom,
    scrollToBottom,
  ]);

  const formatTime = useCallback((timestamp: string | Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "narrow",
      year: "2-digit",
    });
  }, []);

  const sortedMessages = [...(messages || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Show skeleton during initial loading
  if (isInitialLoading || !showContentAfterSkeleton) {
    return <ChatMessagesSkeleton messageCount={8} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      <div
        ref={messagesContainerRef}
        className="flex-1 px-3 py-2 overflow-y-auto scrollbar-hide"
      >
        {sortedMessages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-500 animate-fade-in">
            <div className="text-center">
              <div className="text-6xl mb-4">💬</div>
              <div className="text-lg font-medium mb-2">No messages yet</div>
              <div className="text-sm">Start a conversation!</div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {hasMoreMessages && (
              <div ref={topRef} className="h-1">
                {isLoadingMore && <LoadingMoreSkeleton messageCount={3} />}
              </div>
            )}

            {!hasMoreMessages && (
              <div className="flex justify-center py-4 text-sm text-gray-400 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span>🎉</span>
                  <span>You've reached the beginning</span>
                </div>
              </div>
            )}

            {sortedMessages.map((message: Message, index: number) => {
              const isMyMessage = message.senderId === currentUser._id;
              return (
                <div
                  key={message._id}
                  data-message-id={message._id}
                  className={`flex ${
                    isMyMessage ? "justify-end" : "justify-start"
                  } animate-message-appear`}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                    animationFillMode: "both",
                  }}
                >
                  <div
                    className={`max-w-sm px-4 py-2 rounded-xl shadow transition-all duration-200 hover:shadow-md transform hover:scale-[1.02] ${
                      isMyMessage
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <div className="text-sm leading-relaxed break-words whitespace-pre-wrap overflow-wrap-anywhere">
                      {message.content.text}
                    </div>
                    <div
                      className={`text-xs mt-1 text-right flex items-center justify-end gap-1 ${
                        isMyMessage ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={bottomRef} className="h-1" />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced CSS styles with new animations
const styles = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
    scroll-behavior: smooth;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideDownFade {
    from {
      opacity: 0;
      transform: translateY(-15px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes messageAppear {
    from {
      opacity: 0;
      transform: translateY(10px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.5s ease-out;
  }

  .animate-slide-down-fade {
    animation: slideDownFade 0.4s ease-out;
  }

  .animate-message-appear {
    opacity: 0;
    animation: messageAppear 0.3s ease-out forwards;
  }

  .animate-fade-in {
    animation: fadeIn 0.4s ease-out;
  }
`;

const StyleTag = () => {
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    return () => {
      if (document.head.contains(styleElement)) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  return null;
};

const ChatMessageListWithPagination = (props: ChatMessageListProps) => {
  return (
    <>
      <StyleTag />
      <ChatMessageList {...props} />
    </>
  );
};

export default ChatMessageListWithPagination;
