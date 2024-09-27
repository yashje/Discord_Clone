import { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";

// Assets
import person from '../assets/person.svg';
import send from '../assets/send.svg';

const Messages = ({ account, messages, currentChannel }) => {
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messageEndRef = useRef(null);

  // Establish socket connection in useEffect
  useEffect(() => {
    const newSocket = io('ws://localhost:3030', {
      transports: ['websocket', 'polling', 'flashsocket'], // Ensures compatibility with different transport methods
    });

    setSocket(newSocket);

    // Cleanup the socket when component unmounts
    return () => {
      if (newSocket) {
        newSocket.disconnect();
        setSocket(null);
      }
    };
  }, []);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!currentChannel || !account || !message) {
      console.warn("Message, account or channel is missing!");
      return;
    }

    const messageObj = {
      channel: currentChannel.id.toString(),
      account: account,
      text: message,
    };

    if (socket) {
      console.log('Sending message:', messageObj);
      socket.emit('new message', messageObj);
    } else {
      console.error('Socket is not connected!');
    }

    setMessage("");
  };

  const scrollHandler = () => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Scroll to the bottom when messages or currentChannel change
  useEffect(() => {
    scrollHandler();
  }, [messages, currentChannel]);

  return (
    <div className="text">
      <div className="messages">
        {messages
          .filter(message => message.channel === currentChannel.id.toString())
          .map((message, index) => (
            <div className="message" key={index}>
              <img src={person} alt="Person" />
              <div className="message_content">
                <h3>
                  {message.account.slice(0, 6) + '...' + message.account.slice(38, 42)}
                </h3>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        <div ref={messageEndRef} />
      </div>

      <form onSubmit={sendMessage}>
        {currentChannel && account ? (
          <input
            type="text"
            value={message}
            placeholder={`Message #${currentChannel.name}`}
            onChange={(e) => setMessage(e.target.value)}
          />
        ) : (
          <input
            type="text"
            value={message}
            placeholder={`Please Connect Wallet / Join the Channel`}
            disabled
          />
        )}

        <button type="submit" disabled={!currentChannel || !account || message === ""}>
          <img src={send} alt="Send Message" />
        </button>
      </form>
    </div>
  );
};

export default Messages;
