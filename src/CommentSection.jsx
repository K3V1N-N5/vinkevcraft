import React, { useState, useEffect } from 'react';
import { TextInput, Button } from "flowbite-react";
import { HiThumbUp, HiThumbDown, HiReply, HiX, HiPaperAirplane, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import { auth, db } from './firebase';
import { addDoc, collection, deleteDoc, doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from "firebase/firestore";

function CommentSection({ postId, toggleModal }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);  // Track editing state

  useEffect(() => {
    const fetchComments = async () => {
      const commentsRef = collection(db, "posts", postId, "comments");

      // Listen to real-time updates for comments and replies
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        snapshot.docChanges().forEach(change => {
          const commentDoc = change.doc;
          if (change.type === "added" || change.type === "modified") {
            const commentData = {
              id: commentDoc.id,
              ...commentDoc.data(),
              replies: []
            };

            // Fetch replies in real-time for each comment
            const repliesRef = collection(db, "posts", postId, "comments", commentDoc.id, "replies");
            const unsubscribeReplies = onSnapshot(repliesRef, (repliesSnapshot) => {
              const replies = repliesSnapshot.docs.map(replyDoc => ({
                id: replyDoc.id,
                ...replyDoc.data(),
              }));
              
              // Update the specific comment with its replies
              setComments((prevComments) => 
                prevComments.map(c => 
                  c.id === commentDoc.id ? { ...c, replies } : c
                )
              );
            });

            // Add new comment with empty replies at first
            setComments((prevComments) => 
              [...prevComments, commentData]
            );
          }
        });
      });

      return () => unsubscribe();  // Cleanup listener
    };

    fetchComments();
  }, [postId]);

  const handleReplyToComment = (comment) => {
    setReplyTo({ id: comment.id, user: comment.user, parentId: null });
  };

  const handleReplyToReply = (commentId, reply) => {
    setReplyTo({ id: reply.id, user: reply.user, parentId: commentId });
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() === '') {
      setError('Komentar tidak boleh kosong.');
      return;
    }
    if (comment.length < 5) {
      setError('Komentar terlalu pendek.');
      return;
    }

    setError('');
    if (auth.currentUser) {
      if (replyTo) {
        if (replyTo.parentId) {
          // Reply to another reply
          await addDoc(collection(db, "posts", postId, "comments", replyTo.parentId, "replies"), {
            text: comment,
            user: auth.currentUser.email,
            repliedTo: replyTo.user,
            createdAt: new Date(),
            likes: [],
            dislikes: []
          });
        } else {
          // Reply to a main comment
          await addDoc(collection(db, "posts", postId, "comments", replyTo.id, "replies"), {
            text: comment,
            user: auth.currentUser.email,
            repliedTo: replyTo.user,
            createdAt: new Date(),
            likes: [],
            dislikes: []
          });
        }
        setReplyTo(null);  // Clear reply state
      } else {
        // Add a new comment
        await addDoc(collection(db, "posts", postId, "comments"), {
          text: comment,
          user: auth.currentUser.email,
          createdAt: new Date(),
          likes: [],
          dislikes: []
        });
      }
      setComment('');  // Clear comment input
    } else {
      toggleModal();  // Prompt login
    }
  };

  const handleEditComment = (commentId, text) => {
    setEditing({ id: commentId, text, isReply: false });
    setComment(text);  // Set comment text for editing
  };

  const handleEditReply = (replyId, text, parentId) => {
    setEditing({ id: replyId, text, parentId, isReply: true });
    setComment(text);  // Set reply text for editing
  };

  const handleEditSubmit = async () => {
    if (editing.isReply) {
      const replyDoc = doc(db, "posts", postId, "comments", editing.parentId, "replies", editing.id);
      await updateDoc(replyDoc, { text: comment });
    } else {
      const commentDoc = doc(db, "posts", postId, "comments", editing.id);
      await updateDoc(commentDoc, { text: comment });
    }
    setComment('');  // Clear input field
    setEditing(null);  // Reset editing state
  };

  const handleLike = async (commentId, isReply = false, parentId = null) => {
    const targetDoc = isReply
      ? doc(db, "posts", postId, "comments", parentId, "replies", commentId)
      : doc(db, "posts", postId, "comments", commentId);

    // Check if user has already liked the comment/reply
    const commentSnapshot = await targetDoc.get();
    const commentData = commentSnapshot.data();
    const userLiked = commentData.likes.includes(auth.currentUser.email);

    if (userLiked) {
      // Remove like
      await updateDoc(targetDoc, {
        likes: arrayRemove(auth.currentUser.email),
      });
    } else {
      // Add like
      await updateDoc(targetDoc, {
        likes: arrayUnion(auth.currentUser.email),
        dislikes: arrayRemove(auth.currentUser.email),  // Remove dislike if present
      });
    }
  };

  const handleDislike = async (commentId, isReply = false, parentId = null) => {
    const targetDoc = isReply
      ? doc(db, "posts", postId, "comments", parentId, "replies", commentId)
      : doc(db, "posts", postId, "comments", commentId);

    // Check if user has already disliked the comment/reply
    const commentSnapshot = await targetDoc.get();
    const commentData = commentSnapshot.data();
    const userDisliked = commentData.dislikes.includes(auth.currentUser.email);

    if (userDisliked) {
      // Remove dislike
      await updateDoc(targetDoc, {
        dislikes: arrayRemove(auth.currentUser.email),
      });
    } else {
      // Add dislike
      await updateDoc(targetDoc, {
        dislikes: arrayUnion(auth.currentUser.email),
        likes: arrayRemove(auth.currentUser.email),  // Remove like if present
      });
    }
  };

  return (
    <section className="mb-8 mt-4">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Komentar</h2>

      {!auth.currentUser && (
        <div className="text-center mb-4">
          <Button color="blue" pill onClick={toggleModal}>
            Login untuk meninggalkan komentar
          </Button>
        </div>
      )}

      {auth.currentUser && (
        <div className="mb-4">
          {replyTo && (
            <div className="mb-2">
              <div className="flex justify-between items-center bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-t-lg">
                <p className="text-gray-500 dark:text-gray-400">Replying to {replyTo.user}</p>
                <button onClick={() => setReplyTo(null)} className="text-red-500">
                  <HiX size={20} />
                </button>
              </div>
            </div>
          )}
          <div className="relative">
            <TextInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={replyTo ? `Balas ${replyTo.user}` : "Tulis komentar Anda..."}
              className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white pl-4 pr-12"
            />
            <button
              onClick={editing ? handleEditSubmit : handleCommentSubmit}
              className="absolute right-2 top-2 text-blue-500 hover:text-blue-700 transform rotate-90"
            >
              <HiPaperAirplane size={24} />
            </button>
          </div>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="mb-4 border-b pb-4 border-gray-300 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{comment.user}</p>
          <p className="text-gray-900 dark:text-gray-300">{comment.text}</p>

          <div className="flex space-x-4 mt-2">
            <button
              className={`flex items-center space-x-2 ${!auth.currentUser && 'opacity-50 cursor-not-allowed'} ${comment.likes.includes(auth.currentUser.email) ? 'text-blue-500' : ''}`}
              onClick={() => handleLike(comment.id)}
              disabled={!auth.currentUser}
            >
              <HiThumbUp />
              <span>{comment.likes.length}</span>
            </button>
            <button
              className={`flex items-center space-x-2 ${!auth.currentUser && 'opacity-50 cursor-not-allowed'} ${comment.dislikes.includes(auth.currentUser.email) ? 'text-red-500' : ''}`}
              onClick={() => handleDislike(comment.id)}
              disabled={!auth.currentUser}
            >
              <HiThumbDown />
              <span>{comment.dislikes.length}</span>
            </button>

            {auth.currentUser && (
              <button className="flex items-center space-x-2" onClick={() => handleReplyToComment(comment)}>
                <HiReply />
              </button>
            )}

            {auth.currentUser?.email === comment.user && (
              <>
                <button onClick={() => handleEditComment(comment.id, comment.text)} className="flex items-center space-x-2">
                  <HiOutlinePencilAlt />
                </button>
                <button onClick={() => deleteDoc(doc(db, "posts", postId, "comments", comment.id))} className="flex items-center space-x-2">
                  <HiOutlineTrash />
                </button>
              </>
            )}
          </div>

          {/* Nested Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-4">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="mb-4">
                  <p className="font-semibold text-gray-700 dark:text-gray-300">
                    {reply.user}{" "}
                    {reply.repliedTo && reply.repliedTo !== comment.user && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Membalas {reply.repliedTo}
                      </span>
                    )}
                  </p>
                  <p className="text-gray-700 dark:text-gray-400">{reply.text}</p>

                  <div className="flex space-x-4 mt-2">
                    <button
                      className={`flex items-center space-x-2 ${!auth.currentUser && 'opacity-50 cursor-not-allowed'} ${reply.likes.includes(auth.currentUser.email) ? 'text-blue-500' : ''}`}
                      onClick={() => handleLike(reply.id, true, comment.id)}
                      disabled={!auth.currentUser}
                    >
                      <HiThumbUp />
                      <span>{reply.likes?.length || 0}</span>
                    </button>
                    <button
                      className={`flex items-center space-x-2 ${!auth.currentUser && 'opacity-50 cursor-not-allowed'} ${reply.dislikes.includes(auth.currentUser.email) ? 'text-red-500' : ''}`}
                      onClick={() => handleDislike(reply.id, true, comment.id)}
                      disabled={!auth.currentUser}
                    >
                      <HiThumbDown />
                      <span>{reply.dislikes?.length || 0}</span>
                    </button>

                    {auth.currentUser && (
                      <button
                        className="flex items-center space-x-2"
                        onClick={() => handleReplyToReply(comment.id, reply)}
                      >
                        <HiReply />
                      </button>
                    )}

                    {auth.currentUser?.email === reply.user && (
                      <>
                        <button onClick={() => handleEditReply(reply.id, reply.text, comment.id)} className="flex items-center space-x-2">
                          <HiOutlinePencilAlt />
                        </button>
                        <button onClick={() => deleteDoc(doc(db, "posts", postId, "comments", comment.id, "replies", reply.id))} className="flex items-center space-x-2">
                          <HiOutlineTrash />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

export default CommentSection;
