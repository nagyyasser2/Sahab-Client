import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

type ChatMessageListProps = {
  currentChat: any;
};

const ChatMessageList = ({ currentChat }: ChatMessageListProps) => {
  console.log(currentChat);
  // const dispatch = useDispatch();
  // const [messages, setMessages] = useState([]);

  // useEffect(() => {
  //   const messages = dispatch(currentChat.id);
  //   setMessages(messages);
  // }, [currentChat]);

  return (
    <div>
      {/* {messages.map((msg: any) => (
        <p>{msg.text}</p>
      ))} */}
      <p className="mb-2">{currentChat.lastMessage}</p>
    </div>
  );
};

export default ChatMessageList;
