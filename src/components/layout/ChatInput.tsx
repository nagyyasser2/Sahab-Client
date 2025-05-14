type ChatMessageListProps = {
  currentChat: any;
};

const ChatInput = ({ currentChat }: ChatMessageListProps) => {
  return (
    <footer className="h-16 border-t border-gray-200 p-4 bg-white">
      <input
        type="text"
        placeholder="Type a message..."
        className="w-full p-2 border rounded"
        disabled={currentChat?.lastMessage ? false : true}
      />
    </footer>
  );
};

export default ChatInput;
