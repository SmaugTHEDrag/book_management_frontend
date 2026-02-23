import React, { useContext, useEffect, useState } from 'react';
import { Card, Spinner } from 'flowbite-react';
import { AuthContext } from '../../contexts/AuthProvider';
import { Link } from 'react-router-dom';
import Chatbot from '../shared/ChatBot'; 
export default function Library() {
  const { loading } = useContext(AuthContext);
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [addingFavoriteId, setAddingFavoriteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    'Fiction', 'Fantasy', 'Thriller', 'Historical', 'Mystery', 'Horror',
    'Comic', 'Crime', 'Science-Fiction', 'Psychology', 'Art', 'Romance',
    'Biography', 'Cookbooks', 'Programming', 'Machine-learning',
  ];

  const booksPerPage = 9;

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setIsLoading(true);
        const categoryParam = selectedCategories.length > 0 
          ? encodeURIComponent(selectedCategories.join(','))
          : '';

        const url = `https://https://book-management-backend-eghi.onrender.com/api/books?search=${encodeURIComponent(
          searchQuery
        )}&categorySearch=${categoryParam}&page=${currentPage}&size=${booksPerPage}`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch books');

        const data = await res.json();
        setBooks(data.content || []);
        setTotalPages(data.totalPages || 0);
      } catch (err) {
        console.error('Error fetching books:', err);
        alert('Failed to load books. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [searchQuery, selectedCategories, currentPage]);

  // Reset to first page when search query or categories change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategories]);

  const handleAddToFavorite = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('You must be logged in to add favorites');

      setAddingFavoriteId(bookId);

      const res = await fetch('https://https://book-management-backend-eghi.onrender.com/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to add to favorites');
      }

      alert('Book added to favorites!');
    } catch (err) {
      console.error('Add favorite error:', err);
      alert(err.message);
    } finally {
      setAddingFavoriteId(null);
    }
  };

  const truncateDescription = (desc, max) => desc?.length > max ? desc.slice(0, max) + '...' : desc || '';

  const handleCheckboxChange = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(prev => prev - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(prev => prev + 1);
  };

  return (
    <div className="my-20 px-4 lg:px-24 ">
      <h2 className="text-3xl font-bold text-center mb-7">All Books are Available Here</h2>

      {/* Search Input */}
      <div className="mb-4 text-center flex justify-center">
        <input
          type="text"
          placeholder="Search by Title or Author"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-6 py-2 border rounded w-80"
          aria-label="Search by book title or author"
        />
      </div>

      {/* Category Filters */}
      <div className="mb-8 text-center font-bold flex flex-wrap justify-center gap-4">
        {categories.map(cat => (
          <label key={cat} className="flex items-center mr-5">
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => handleCheckboxChange(cat)}
              className="mr-2"
              aria-label={`Filter by ${cat}`}
            />
            {cat}
          </label>
        ))}
      </div>

      {/* Loading Spinner */}
      {(loading || isLoading) ? (
      <div className="w-full max-w-[1180px] mx-auto flex flex-col items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">Loading library...</p>
        </div>
      </div>
      ) : (
        <>
          {/* Books Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8 mb-8">
            {books.length === 0 ? (
              <p className="text-center col-span-full">No books found.</p>
            ) : (
              books.map(book => (
                <Card key={book.id}>
                  <img src={book.image} alt={book.title} className="w-full h-full object-cover"/>
                  <h5 className="text-2xl font-bold text-center">{book.title}</h5>
                  <h6 className="text-center">{book.author}</h6>
                  <p>
                    {truncateDescription(book.description, 150)}
                    <Link to={`/book/${book.id}`} className="text-blue-700 ml-2">Show more</Link>
                  </p>
                  <div className="flex justify-between mt-2">
                    <Link to={`/book/${book.id}/read`} className="px-4 py-2 font-bold text-cyan-800 hover:underline">Read Online</Link>
                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded flex items-center gap-2 disabled:opacity-50"
                      onClick={() => handleAddToFavorite(book.id)}
                      disabled={addingFavoriteId === book.id}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {addingFavoriteId === book.id ? 'Adding...' : 'Add to Favorites'}
                    </button>

                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Prev
              </button>

              <span className="text-lg font-medium">
                Page {currentPage + 1} of {totalPages}
              </span>

              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    <div className="fixed bottom-6 right-6 z-50">
      <Chatbot />
    </div>
    </div>
  );
}
