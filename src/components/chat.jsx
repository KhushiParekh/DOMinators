import React, { useState, useEffect , useRef } from 'react';
import { db } from '../pages/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, X } from 'lucide-react';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const snapshot = await getDocs(usersRef);
        const users = snapshot.docs
          .map(doc => ({
            uid: doc.id,
            ...doc.data()
          }))
          .filter(user => user.uid !== currentUser?.uid);
        setOnlineUsers(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  // Listen for messages
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    // Create a compound query for messages with the required index
    const chatId = getChatId(currentUser.uid, selectedUser.uid);
    const messagesRef = collection(db, 'privateMessages');
    const chatQuery = query(
      messagesRef,
      where('participants', 'array-contains', currentUser.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(chatQuery, (snapshot) => {
      const messageList = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(msg => msg.chatId === chatId);
      setMessages(messageList);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [selectedUser, currentUser]);

  // Generate a consistent chat ID for two users
  const getChatId = (uid1, uid2) => {
    return [uid1, uid2].sort().join('_');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser || !currentUser) return;

    try {
      const chatId = getChatId(currentUser.uid, selectedUser.uid);
      
      await addDoc(collection(db, 'privateMessages'), {
        chatId: chatId,
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        recipientId: selectedUser.uid,
        recipientName: selectedUser.displayName || selectedUser.email,
        timestamp: serverTimestamp(),
        participants: [currentUser.uid, selectedUser.uid]
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - User List */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Messages</h2>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-70px)]">
          {onlineUsers.map((user) => (
            <div
              key={user.uid}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center p-4 cursor-pointer hover:bg-gray-50 ${
                selectedUser?.uid === user.uid ? 'bg-gray-100' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                {(user.displayName || user.email)[0].toUpperCase()}
              </div>
              <div className="ml-4">
                <h3 className="font-medium">{user.displayName || user.email}</h3>
                <p className="text-sm text-gray-500">Click to start chatting</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-white">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                  {(selectedUser.displayName || selectedUser.email)[0].toUpperCase()}
                </div>
                <h2 className="ml-3 text-lg font-semibold">
                  {selectedUser.displayName || selectedUser.email}
                </h2>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex mb-4 ${
                    message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-lg ${
                      message.senderId === currentUser.uid
                        ? 'bg-green-500 text-white'
                        : 'bg-white border'
                    }`}
                  >
                    <p>{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp?.toDate().toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="bg-green-500 text-white p-3 rounded-lg hover:bg-green-600"
                  disabled={!newMessage.trim()}
                >
                  <Send size={20} />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <MessageCircle size={48} className="mx-auto mb-4" />
              <p className="text-xl">Select a user to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;