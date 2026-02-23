import React, { useEffect, useState } from 'react'
import BookCards from '../shared/BookCards';

const BestSeller = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch("https://book-management-backend-eghi.onrender.com/api/books?page=0&size=8") // fetch 8 books trực tiếp từ backend
        .then((res) => res.json())
        .then((data) => {
            const bookList = data.content || []; // lấy content nếu có
            setBooks(bookList);
        })
        .catch((err) => console.error("Error fetching books:", err));
    }, []);

    return (
        <>
            <div className="text-red-700 "><BookCards books={books} headline={"Best Fiction Books 2023"} /></div>
        </>
    )
}

export default BestSeller