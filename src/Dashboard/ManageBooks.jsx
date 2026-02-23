import { Table, Pagination } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const ManageBooks = () => {
  const [booksPage, setBooksPage] = useState({
    content: [],
    totalPages: 1,
    number: 0,
  });
  const [editingBookId, setEditingBookId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 5;
  const token = localStorage.getItem("token");
  const location = useLocation(); // Để detect khi navigate back

  // fetch books theo trang
  const fetchBooks = async (page = 0) => {
    setLoading(true);
    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/books?page=${page}&size=${pageSize}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch books");
      const data = await res.json();
      setBooksPage(data);
    } catch (err) {
      console.error("Error loading books:", err);
      alert("Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  // Thêm location.key để refresh khi navigate back từ edit page
  useEffect(() => {
    fetchBooks(currentPage);
  }, [currentPage, token, location.key]); // location.key thay đổi mỗi khi navigate

  // delete a book
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/books/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to delete book");
      alert("Book deleted successfully!");
      
      // Tính toán lại trang sau khi xóa
      const remainingItemsOnCurrentPage = content.length - 1;
      
      if (remainingItemsOnCurrentPage === 0 && currentPage > 0) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchBooks(currentPage);
      }
    } catch (err) {
      console.error("Error deleting book:", err);
      alert("Failed to delete book");
    }
  };

  const { content = [], totalPages = 1, number = 0 } = booksPage;

  const handlePageChange = (page) => {
    setCurrentPage(page - 1);
  };

  if (loading && content.length === 0) {
    return (
      <div className="w-full max-w-[1180px] mx-auto flex flex-col items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">Loading books...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 my-12'>
      <h2 className='mb-8 text-3xl font-bold'>Manage Your Books Inventory!</h2>

      {content.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No books found.</p>
        </div>
      ) : (
        <>
          <Table className='lg:w-[1180px] table-fixed'>
            <Table.Head>
              <Table.HeadCell className="w-12">No.</Table.HeadCell>
              <Table.HeadCell className="w-20">Image</Table.HeadCell>
              <Table.HeadCell className="w-48">Book name</Table.HeadCell>
              <Table.HeadCell className="w-36">Author Name</Table.HeadCell>
              <Table.HeadCell className="w-52">Category</Table.HeadCell>
              <Table.HeadCell className="w-36">Edit or Manage</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {content.map((book, index) => (
                <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800" key={book.id}>
                  <Table.Cell>{currentPage * pageSize + index + 1}</Table.Cell>
                  <Table.Cell>
                    <img 
                      className='w-20 h-20 rounded-md object-cover' 
                      src={book.image} 
                      alt={book.title}
                      onError={(e) => {
                        e.target.src = '/placeholder-book.png';
                      }}
                    />
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white truncate">
                    {book.title}
                  </Table.Cell>
                  <Table.Cell className="truncate">{book.author}</Table.Cell>
                  <Table.Cell className="truncate">{book.category}</Table.Cell>
                  <Table.Cell>
                    <Link
                      className="font-medium text-cyan-600 hover:underline dark:text-cyan-500 mr-5"
                      to={`/admin/dashboard/edit-books/${book.id}`}
                    >
                      Edit
                    </Link>
                    <button
                      className='bg-red-600 px-4 py-1 font-semibold text-white rounded-sm hover:bg-red-700 transition-colors'
                      onClick={() => handleDelete(book.id)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center text-center mt-8">
              <Pagination
                currentPage={currentPage + 1}
                totalPages={totalPages}
                layout="pagination"
                nextLabel="Next"
                previousLabel="Prev"
                showIcons
                onPageChange={(page) => setCurrentPage(page - 1)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageBooks;