import React, { useEffect, useState } from "react";
import { Table } from "flowbite-react";
import { Link } from "react-router-dom";

const Favorite = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("You must be logged in to view favorites.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("https://https://book-management-backend-eghi.onrender.com/api/favorites", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch favorite books");
      }

      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      alert("Error fetching favorite books");
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (bookId) => {
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`https://https://book-management-backend-eghi.onrender.com/api/favorites/${bookId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to remove favorite");
      }

      setFavorites((prev) => prev.filter((book) => book.bookId !== bookId));
      alert("Removed from favorites!");
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Error removing favorite");
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-[1180px] mx-auto flex flex-col items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 my-12">
      <h2 className="mb-8 text-3xl font-bold">Your Favorite Books</h2>

      {favorites.length === 0 ? (
        <p>You have no favorite books yet.</p>
      ) : (
        <Table className="lg:w-[1180px] table-fixed">
          <Table.Head>
            <Table.HeadCell className="w-12">No.</Table.HeadCell>
            <Table.HeadCell className="w-20">Image</Table.HeadCell>
            <Table.HeadCell className="w-48">Book name</Table.HeadCell>
            <Table.HeadCell className="w-36">Author Name</Table.HeadCell>
            <Table.HeadCell className="w-52">Category</Table.HeadCell>
            <Table.HeadCell className="w-36">Actions</Table.HeadCell>
          </Table.Head>

          {favorites.map((book, index) => (
            <Table.Body key={book.bookId} className="divide-y">
              <Table.Row className="bg-white dark:border-gray-700 dark:bg-gray-800">
                <Table.Cell>{index + 1}</Table.Cell>
                <Table.Cell>
                  <img
                    src={book.image}
                    alt={book.title}
                    className="w-16 h-16 rounded-md "
                  />
                </Table.Cell>
                <Table.Cell className="truncate">{book.title}</Table.Cell>
                <Table.Cell className="truncate">{book.author}</Table.Cell>
                <Table.Cell className="truncate">{book.category}</Table.Cell>
                <Table.Cell>
                  <Link
                    to={`/book/${book.bookId}`}
                    className="text-blue-600 hover:underline mr-4"
                  >
                    View
                  </Link>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    onClick={() => removeFavorite(book.bookId)}
                  >
                    Remove
                  </button>
                </Table.Cell>
              </Table.Row>
            </Table.Body>
          ))}
        </Table>
      )}
    </div>
  );
};

export default Favorite;
