import React, { useEffect, useState } from 'react'
import BookCards from '../shared/BookCards';

const OtherBooks = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetch("https://book-management-backend-eghi.onrender.com/api/books?page=1&size=8") // fetch 8 books trực tiếp từ backend
        .then((res) => res.json())
        .then((data) => {
            const bookList = data.content || []; // lấy content nếu có
            setBooks(bookList);
        })
        .catch((err) => console.error("Error fetching books:", err));
    }, []);

    return (
        <div className='mt-24'>
            <div className='text-red-700'><BookCards books={books} headline={"Other Books"} /></div>
        </div>
    )
}

export default OtherBooks