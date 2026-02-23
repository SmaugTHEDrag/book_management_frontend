import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import { Pagination } from 'swiper/modules';
import { FaPlusCircle } from "react-icons/fa";
import { Link } from 'react-router-dom';

const BookCards = ({ headline, books }) => {

  const handleAddToFavorite = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://https://book-management-backend-eghi.onrender.com/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
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
    }
  };

  return (
    <div className='my-16 px-4 lg:px-24'>
      <h2 className='text-5xl my-5 font-bold text-center'>{headline}</h2>

      <div className='mt-20'>
        <Swiper
          slidesPerView={1}
          spaceBetween={10}
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 1, spaceBetween: 20 },
            768: { slidesPerView: 3, spaceBetween: 40 },
            1024: { slidesPerView: 4, spaceBetween: 50 },
          }}
          modules={[Pagination]}
          className="w-full h-full"
        >
          {books.map((book) => (
            <SwiperSlide className='text-center flex items-center justify-center' key={book.id}>
              <Link to={`/book/${book.id}`} className='cursor-pointer'>
                <div className='bg-gray-100 p-8 rounded-lg relative'>
                  <img src={book.image} alt="" className='w-full' />
                  <div className='absolute top-3 right-3'>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleAddToFavorite(book.id);
                      }}
                      className='bg-red-600 hover:bg-black p-2 rounded'
                    >
                      <FaPlusCircle className='w-4 h-4 text-white' />
                    </button>
                  </div>
                </div>

                <div className='mt-5 mb-8 text-left space-y-2 flex justify-center items-start'>
                  <div>
                    <h3 className='text-black font-bold'>{book.title}</h3>
                    <p className='text-black'>{book.author}</p>
                  </div>
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BookCards;
