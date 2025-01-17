import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../pages/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Heart, MessageCircle, Trash2, Send, X, Users } from 'lucide-react';

const Community = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Existing messages listener
  useEffect(() => {
    const q = query(collection(db, 'communityMessages'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        reactions: doc.data().reactions || [],
        comments: doc.data().comments || [],
      }));
      setMessages(messageData);
    });
    return () => unsubscribe();
  }, []);

  // Users listener
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userData.filter((user) => user.id !== currentUser?.uid));
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleUserClick = (userId) => {
    navigate(`/chat/${userId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'communityMessages'), {
        text: newMessage,
        userEmail: currentUser.email,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email.split('@')[0],
        timestamp: serverTimestamp(),
        reactions: [],
        comments: [],
      });
      setNewMessage('');
      setShowTextBox(false);
      toast.success('Posted successfully!');
    } catch (error) {
      toast.error('Failed to post');
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'communityMessages', messageId));
        toast.success('Post deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleReaction = async (messageId) => {
    const messageRef = doc(db, 'communityMessages', messageId);
    const message = messages.find((m) => m.id === messageId);
    const hasReacted = message.reactions.includes(currentUser.uid);

    try {
      await updateDoc(messageRef, {
        reactions: hasReacted ? arrayRemove(currentUser.uid) : arrayUnion(currentUser.uid),
      });
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const handleComment = async (messageId) => {
    if (!newComment.trim()) return;

    const messageRef = doc(db, 'communityMessages', messageId);
    const comment = {
      text: newComment,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      timestamp: new Date().toISOString(),
    };

    try {
      await updateDoc(messageRef, {
        comments: arrayUnion(comment),
      });
      setNewComment('');
      setActiveCommentBox(null);
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="col-span-3">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Community Discussion</h1>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              {showTextBox ? (
                <form onSubmit={handleSubmit}>
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full h-24 p-3 border rounded-lg focus:ring focus:ring-green-300 resize-none"
                  />
                  <div className="flex justify-end gap-4 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowTextBox(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      disabled={!newMessage.trim()}
                    >
                      Post
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowTextBox(true)}
                  className="w-full py-3 text-gray-700 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:text-green-500"
                >
                  Start a new discussion
                </button>
              )}
            </div>

            {messages.map((message) => (
              <div key={message.id} className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                      {message.userName[0].toUpperCase()}
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-800">{message.userName}</p>
                      <p className="text-sm text-gray-500">
                        {message.timestamp?.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {message.userId === currentUser?.uid && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <p className="mt-4 text-gray-700">{message.text}</p>

                <div className="mt-4 flex items-center space-x-4">
                  <button
                    onClick={() => handleReaction(message.id)}
                    className={`flex items-center gap-2 ${
                      message.reactions.includes(currentUser?.uid)
                        ? 'text-red-500'
                        : 'text-gray-500 hover:text-red-500'
                    }`}
                  >
                    <Heart size={18} /> {message.reactions.length}
                  </button>
                  <button
                    onClick={() => setActiveCommentBox(
                      activeCommentBox === message.id ? null : message.id
                    )}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-500"
                  >
                    <MessageCircle size={18} /> {message.comments.length}
                  </button>
                </div>

                {activeCommentBox === message.id && (
                  <div className="mt-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full h-20 p-3 border rounded-lg focus:ring focus:ring-green-300 resize-none"
                    />
                    <button
                      onClick={() => handleComment(message.id)}
                      className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Send
                    </button>
                  </div>
                )}

                {message.comments.length > 0 && (
                  <div className="mt-4 space-y-4">
                    {message.comments.map((comment, idx) => (
                      <div key={idx} className="border-l-4 border-gray-200 pl-4">
                        <p className="font-bold text-sm text-gray-800">
                          {comment.userName}{' '}
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </p>
                        <p className="text-gray-600 text-sm">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Users size={20} className="mr-2 text-gray-600" /> Users
              </h2>
              <div className="space-y-4">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900 truncate">
                        {user.displayName || user.email?.split('@')[0]}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </button>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500">No other users found</p>
                )}
              </div>
              <button
                onClick={() => navigate('/event')}
                className="mt-6 w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Go to Events
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
