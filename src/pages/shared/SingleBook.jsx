import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Spinner } from 'flowbite-react';
import { HiArrowLeft } from 'react-icons/hi';
import { AiOutlineHeart, AiFillHeart, AiFillStar } from 'react-icons/ai';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import Chatbot from './ChatBot';

const SingleBook = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingFavorite, setAddingFavorite] = useState(false);
  const [hasFavorited, setHasFavorited] = useState(false);
  
  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [userReview, setUserReview] = useState(null);

  const fetchBookData = async () => {
    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/books/${id}`);
      if (!res.ok) throw new Error('Failed to fetch book');
      const data = await res.json();
      setBook(data);

      // Tìm review của user hiện tại
      const username = localStorage.getItem('username');
      if (username) {
        const existingReview = data.reviews?.find(
          review => review.username === username
        );
        setUserReview(existingReview || null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBookData();

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const likeRes = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/favorites/${id}/has`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (likeRes.ok) setHasFavorited(await likeRes.json());
        } catch (err) {
          console.error('Error checking favorite:', err);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Please log in to add favorites');

    try {
      setAddingFavorite(true);
      const method = hasFavorited ? 'DELETE' : 'POST';
      const url = hasFavorited 
        ? `https://https://book-management-backend-eghi.onrender.com/api/favorites/${id}`
        : 'https://https://book-management-backend-eghi.onrender.com/api/favorites';
      
      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: method === 'POST' ? JSON.stringify({ bookId: id }) : undefined,
      });
      setHasFavorited(!hasFavorited);
    } catch (err) {
      alert('Failed to update favorites');
    } finally {
      setAddingFavorite(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    
    const token = localStorage.getItem('token');
    if (!token) {
      setReviewError('Please log in to write a review');
      return;
    }

    try {
      setSubmittingReview(true);
      const method = userReview ? 'PUT' : 'POST';
      const url = userReview 
        ? `https://https://book-management-backend-eghi.onrender.com/api/reviews/${userReview.id}`
        : 'https://https://book-management-backend-eghi.onrender.com/api/reviews';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: id,
          rating: reviewRating,
          comment: reviewText,
        }),
      });

      if (!res.ok) {
        const errorData = await res.text();
        throw new Error(errorData || 'Failed to submit review');
      }

      // Refresh book data
      await fetchBookData();

      // Reset form
      setReviewText('');
      setReviewRating(5);
      setShowReviewForm(false);
      setReviewError('');
    } catch (err) {
      setReviewError("Review contains inappropriate content.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = () => {
    if (!userReview) return;
    setReviewText(userReview.comment);
    setReviewRating(userReview.rating);
    setShowReviewForm(true);
    setReviewError('');
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    if (!window.confirm('Are you sure you want to delete your review?')) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/reviews/${userReview.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete review');

      await fetchBookData();
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
    }
  };

  const cancelEdit = () => {
    setReviewText('');
    setReviewRating(5);
    setShowReviewForm(false);
    setReviewError('');
  };

  const openWriteReview = () => {
    setReviewText('');
    setReviewRating(5);
    setShowReviewForm(true);
    setReviewError('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="w-12 h-12" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-red-500 text-lg mb-4">Error: {error}</p>
        <Link to="/library" className="text-blue-600 hover:underline flex items-center gap-2">
          <HiArrowLeft /> Back to Library
        </Link>
      </div>
    );
  }

  const { title, author, image, category, description, avgRating = 0, reviewCount = 0, reviews = [] } = book;
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 font-medium"
        >
          <HiArrowLeft className="text-xl" />
          Back to Library
        </Link>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5 gap-8 p-8">
            {/* Book Image */}
            <div className="md:col-span-2">
              <img
                src={image}
                alt={title}
                className="w-full h-auto rounded-xl shadow-md object-cover"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDM1MCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjM1MCIgaGVpZ2h0PSI1MDAiIGZpbGw9IiNGM0Y0RjYiLz48dGV4dCB4PSIxNzUiIHk9IjI1MCIgZmlsbD0iIzlDQTRBQiIgZm9udC1zaXplPSIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>

            {/* Book Details */}
            <div className="md:col-span-3 space-y-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">{title}</h1>
                <p className="text-xl text-gray-600">by {author}</p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <AiFillStar
                      key={i}
                      className={`w-5 h-5 ${i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </div>

              {/* Category */}
              <div className="inline-block">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {category}
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 leading-relaxed">{description}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Link
                  to={`/book/${id}/read`}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Read Now
                </Link>
                <button
                  onClick={handleFavorite}
                  disabled={addingFavorite}
                  className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {addingFavorite ? (
                    <Spinner className="w-5 h-5" />
                  ) : hasFavorited ? (
                    <AiFillHeart className="w-5 h-5" />
                  ) : (
                    <AiOutlineHeart className="w-5 h-5" />
                  )}
                  {hasFavorited ? 'Favorited' : 'Add to Favorites'}
                </button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Reviews ({reviewCount})
            </h2>

            {/* User's Review Card */}
            {isLoggedIn && userReview && (
              <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Your Review</h3>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <AiFillStar
                            key={i}
                            className={`w-5 h-5 ${i < userReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">{userReview.rating}/5</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditReview}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit review"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleDeleteReview}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete review"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 italic">{userReview.comment}</p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(userReview.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Write Review Button */}
            {isLoggedIn && !userReview && !showReviewForm && (
              <button
                onClick={openWriteReview}
                className="mb-6 w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Write a Review
              </button>
            )}

            {/* Review Form */}
            {showReviewForm && (
              <form onSubmit={handleSubmitReview} className="mb-8 bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-semibold mb-4">
                  {userReview ? 'Edit Your Review' : 'Write Your Review'}
                </h3>
                
                {/* Error Message */}
                {reviewError && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {reviewError}
                  </div>
                )}

                {/* Star Rating */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="focus:outline-none"
                      >
                        <AiFillStar
                          className={`w-8 h-8 ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    required
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Share your thoughts about this book..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {submittingReview ? (
                      <>
                        <Spinner className="w-5 h-5" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <span>{userReview ? 'Update Review' : 'Submit Review'}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Login prompt */}
            {!isLoggedIn && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-blue-800">
                  Please{' '}
                  <Link to="/login" className="font-semibold underline hover:text-blue-900">
                    log in
                  </Link>{' '}
                  to write a review
                </p>
              </div>
            )}

            {/* All Reviews List */}
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">All Reviews</h3>
              {reviews.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No reviews yet. Be the first to review!
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-semibold text-gray-900">{review.username}</span>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <AiFillStar
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot */}
      <div className="fixed bottom-6 right-6 z-50">
        <Chatbot />
      </div>
    </div>
  );
};

export default SingleBook;