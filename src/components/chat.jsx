import React, { useState, useEffect, useRef } from 'react';
import { db } from '../pages/firebase';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Send, X } from 'lucide-react';

const ChatComponent = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Get all users from the community messages
    const usersQuery = query(collection(db, 'communityMessages'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const users = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.userId !== currentUser?.uid) {
          users.add({
            uid: data.userId,
            email: data.userEmail,
            displayName: data.userName
          });
        }
      });
      setOnlineUsers(Array.from(users));
    });
    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (selectedUser) {
      // Query messages between current user and selected user
      const messagesQuery = query(
        collection(db, 'privateMessages'),
        where('participants', 'array-contains', currentUser.uid),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const chats = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(msg => 
            msg.participants.includes(selectedUser.uid)
          );
        setMessages(chats);
        scrollToBottom();
      });

      return () => unsubscribe();
    }
  }, [selectedUser, currentUser]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      await addDoc(collection(db, 'privateMessages'), {
        text: newMessage,
        senderId: currentUser.uid,
        senderName: currentUser.displayName || currentUser.email,
        recipientId: selectedUser.uid,
        recipientName: selectedUser.displayName || selectedUser.email,
        participants: [currentUser.uid, selectedUser.uid],
        timestamp: serverTimestamp()
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowChat(!showChat)}
        className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600"
      >
        <MessageCircle size={24} />
      </button>

      {showChat && (
        <div className="absolute bottom-16 right-0 w-96 h-[32rem] bg-white rounded-lg shadow-xl flex flex-col">
          <div className="p-4 border-b flex justify-between items-center bg-green-500 text-white rounded-t-lg">
            <h3 className="font-semibold">
              {selectedUser ? selectedUser.displayName : 'Select a user to chat'}
            </h3>
            <button onClick={() => setShowChat(false)} className="text-white">
              <X size={20} />
            </button>
          </div>

          <div className="flex h-full">
            {/* Users List */}
            {!selectedUser && (
              <div className="w-full p-4 overflow-y-auto">
                {onlineUsers.map((user) => (
                  <div
                    key={user.uid}
                    onClick={() => setSelectedUser(user)}
                    className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                      {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{user.displayName || user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Area */}
            {selectedUser && (
              <div className="flex flex-col w-full">
                <div className="flex-1 p-4 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`mb-4 flex ${message.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.senderId === currentUser.uid
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200'
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

                <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatComponent;