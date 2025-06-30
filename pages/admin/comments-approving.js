import React, { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';

function AdminCommentApproval() {
  const [pendingComments, setPendingComments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  useEffect(() => {
    async function fetchComments() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/products');
        const products = await res.json();
        console.log('Fetched products for admin comment approval:', products);
        // Flatten all unapproved comments with product info
        const comments = [];
        for (const product of products) {
          if (product.comments) {
            for (const comment of product.comments) {
              if (!comment.approved) {
                comments.push({
                  ...comment,
                  productId: product._id,
                  productName: product.name,
                });
              }
            }
          }
        }
        console.log('Pending comments:', comments);
        setPendingComments(comments);
      } catch (e) {
        setError('Erreur lors du chargement des commentaires.');
      }
      setLoading(false);
    }
    fetchComments();
  }, []);

  async function approveComment(productId, commentId) {
    try {
      const res = await fetch(`/api/products/${productId}?approve=1&commentId=${commentId}`, {
        method: 'PATCH',
      });
      if (res.ok) {
        setPendingComments(pendingComments.filter(c => c._id !== commentId));
      } else {
        alert('Erreur lors de l\'approbation du commentaire.');
      }
    } catch {
      alert('Erreur lors de l\'approbation du commentaire.');
    }
  }

  return (
    <section className="my-10 p-6 bg-white rounded shadow max-w-2xl mx-auto mt-[5rem]">
      <h2 className="text-2xl font-bold mb-4">Commentaires à approuver</h2>
      {loading ? (
        <div>Chargement...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : pendingComments.length === 0 ? (
        <div className="text-gray-500">Aucun commentaire en attente.</div>
      ) : (
        <div className="space-y-4">
          {pendingComments.map(comment => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-gray-800">{comment.userName} sur <span className="text-yellow-900">{comment.productName}</span></div>
                <div className="text-gray-700 mt-1 mb-2">{comment.text}</div>
                <div className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</div>
              </div>
              <button onClick={() => approveComment(comment.productId, comment._id)} className="mt-2 md:mt-0 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold text-sm">Approuver</button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default function CommentsApprovingPage() {
  const { currentUser, isLoading } = useAuth();
  const router = useRouter();
  const isAdmin = currentUser?.role === 'seller';

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace('/');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading || !currentUser) {
    return <div className="flex justify-center items-center h-screen text-gray-700"><p className="text-xl">Chargement...</p></div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <AdminCommentApproval />;
} 