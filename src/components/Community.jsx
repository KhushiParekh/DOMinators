import React, { useState, useEffect } from 'react';
import { db } from '../pages/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Heart, MessageCircle, Trash2, Send, X } from 'lucide-react';

const Community = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showTextBox, setShowTextBox] = useState(false);
  const [activeCommentBox, setActiveCommentBox] = useState(null);
  const [newComment, setNewComment] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'communityMessages'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        reactions: doc.data().reactions || [],
        comments: doc.data().comments || []
      }));
      setMessages(messageData);
    });
    return () => unsubscribe();
  }, []);

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
        comments: []
      });
      setNewMessage('');
      setShowTextBox(false);
      toast.success("Posted successfully!");
    } catch (error) {
      toast.error("Failed to post");
    }
  };

  const handleDelete = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await deleteDoc(doc(db, 'communityMessages', messageId));
        toast.success("Post deleted");
      } catch (error) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleReaction = async (messageId) => {
    const messageRef = doc(db, 'communityMessages', messageId);
    const message = messages.find(m => m.id === messageId);
    const hasReacted = message.reactions.includes(currentUser.uid);

    try {
      await updateDoc(messageRef, {
        reactions: hasReacted 
          ? arrayRemove(currentUser.uid)
          : arrayUnion(currentUser.uid)
      });
    } catch (error) {
      toast.error("Failed to update reaction");
    }
  };

  const handleComment = async (messageId) => {
    if (!newComment.trim()) return;

    const messageRef = doc(db, 'communityMessages', messageId);
    const comment = {
      text: newComment,
      userId: currentUser.uid,
      userName: currentUser.displayName || currentUser.email.split('@')[0],
      timestamp: new Date().toISOString()
    };

    try {
      await updateDoc(messageRef, {
        comments: arrayUnion(comment)
      });
      setNewComment('');
      setActiveCommentBox(null);
      toast.success("Comment added");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Community Discussion</h1>
        
        


        {/* Post Creation */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          {showTextBox ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-green-500 resize-none"
                rows="4"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTextBox(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <X size={18} /> Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                  disabled={!newMessage.trim()}
                >
                  <Send size={18} /> Post
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowTextBox(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-500 transition-colors"
            >
              Start a new discussion
            </button>
          )}
        </div>

        {/* Messages List */}
        <div className="space-y-6">
          {messages.map((message) => (
            <div key={message.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                {/* Message Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {message.userName[0].toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-semibold text-gray-900">{message.userName}</p>
                      <p className="text-sm text-gray-500">
                        {message.timestamp?.toDate().toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {message.userId === currentUser?.uid && (
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Message Content */}
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{message.text}</p>

                {/* Reactions and Comments Section */}
                <div className="flex items-center gap-6 text-gray-500">
                  <button
                    onClick={() => handleReaction(message.id)}
                    className={`flex items-center gap-1 ${
                      message.reactions.includes(currentUser?.uid) 
                        ? 'text-red-500' 
                        : 'hover:text-red-500'
                    } transition-colors`}
                  >
                    <Heart size={18} />
                    <span>{message.reactions.length}</span>
                  </button>
                  <button
                    onClick={() => setActiveCommentBox(activeCommentBox === message.id ? null : message.id)}
                    className="flex items-center gap-1 hover:text-blue-500 transition-colors"
                  >
                    <MessageCircle size={18} />
                    <span>{message.comments.length}</span>
                  </button>
                </div>

                {/* Comments Section */}
                {message.comments.length > 0 && (
                  <div className="mt-4 space-y-3">
                    {message.comments.map((comment, idx) => (
                      <div key={idx} className="pl-4 border-l-2 border-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{comment.userName}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment Input */}
                {activeCommentBox === message.id && (
                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => handleComment(message.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;