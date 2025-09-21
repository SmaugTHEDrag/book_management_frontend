import React, { useState } from 'react';

const UploadBook = () => {
  const [bookCategory, setBookCategory] = useState("");
  const [useImageFile, setUseImageFile] = useState(false);
  const [usePdfFile, setUsePdfFile] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [formData, setFormData] = useState({
    bookTitle: '',
    authorName: '',
    imageURL: '',
    bookDescription: '',
    bookPDFURL: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handlePdfFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      alert('Please select a valid PDF file');
      event.target.value = '';
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const { bookTitle, authorName, bookDescription, imageURL, bookPDFURL } = formData;

    if (!bookTitle || !authorName || !bookCategory) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate required fields based on upload method
    if (usePdfFile && !pdfFile) {
      alert('Please select a PDF file');
      return;
    }
    
    if (!usePdfFile && !bookPDFURL) {
      alert('Please provide a PDF URL');
      return;
    }

    try {
      let response;

      // If using file uploads
      if (useImageFile || usePdfFile) {
        const formDataObj = new FormData();
        
        // Match the @RequestPart names in your controller
        formDataObj.append('title', bookTitle);
        formDataObj.append('author', authorName);
        formDataObj.append('category', bookCategory);
        
        if (bookDescription) {
          formDataObj.append('description', bookDescription);
        }
        
        if (useImageFile && imageFile) {
          formDataObj.append('image', imageFile);
        }
        
        // PDF is required for the upload endpoint
        if (usePdfFile && pdfFile) {
          formDataObj.append('pdf', pdfFile);
        } else {
          // If not using file upload for PDF, we need to use the regular endpoint
          // since the upload endpoint requires a PDF file
          alert('PDF file is required when using file upload method');
          return;
        }

        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch("https://book-management-backend-d481.onrender.com/api/books/upload", {
          method: "POST",
          headers: headers,
          body: formDataObj,
        });
      } 
      // Using URLs (original method)
      else {
        const bookObj = {
          title: bookTitle,
          author: authorName,
          image: imageURL,
          category: bookCategory,
          description: bookDescription,
          pdf: bookPDFURL,
        };

        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const headers = {
          "Content-type": "application/json",
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch("https://book-management-backend-d481.onrender.com/api/books", {
          method: "POST",
          headers: headers,
          body: JSON.stringify(bookObj),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Failed to upload book: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      alert("Book uploaded successfully!");
      
      // Reset form
      setFormData({
        bookTitle: '',
        authorName: '',
        imageURL: '',
        bookDescription: '',
        bookPDFURL: ''
      });
      setBookCategory("");
      setImageFile(null);
      setPdfFile(null);
      setUseImageFile(false);
      setUsePdfFile(false);
      
    } catch (err) {
      console.error('Upload error:', err);
      alert(`Error uploading book: ${err.message}`);
    }
  };

  return (
    <div className="px-4 my-12">
      <h2 className="mb-8 text-3xl font-bold">Upload A Book!</h2>
      <div className="flex lg:w-[1100px] flex-col flex-wrap gap-4">
        {/* First Row */}
        <div className="flex gap-8">
          <div className="lg:w-1/2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Book Title
            </label>
            <input
              name="bookTitle"
              value={formData.bookTitle}
              onChange={handleInputChange}
              placeholder="Book Name"
              required
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
          <div className="lg:w-1/2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Author Name
            </label>
            <input
              name="authorName"
              value={formData.authorName}
              onChange={handleInputChange}
              placeholder="Author Name"
              required
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="flex gap-8">
          {/* Image Section */}
          <div className="lg:w-1/2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-900">
                Book Image
              </label>
              <button
                type="button"
                onClick={() => {
                  setUseImageFile(!useImageFile);
                  setImageFile(null);
                  setFormData(prev => ({ ...prev, imageURL: '' }));
                }}
                className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
              >
                {useImageFile ? "Use URL" : "Upload File"}
              </button>
            </div>
            
            {useImageFile ? (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-gray-300 rounded-lg"
                />
                {imageFile && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected: {imageFile.name}
                  </p>
                )}
              </div>
            ) : (
              <input
                name="imageURL"
                value={formData.imageURL}
                onChange={handleInputChange}
                placeholder="Image URL"
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              />
            )}
          </div>

          <div className="lg:w-1/2">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Book Category
            </label>
            <input
              placeholder="Enter category (e.g., Fiction)"
              required
              type="text"
              value={bookCategory}
              onChange={(e) => setBookCategory(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Book Description
          </label>
          <textarea
            name="bookDescription"
            value={formData.bookDescription}
            onChange={handleInputChange}
            placeholder="Book Description"
            rows={4}
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PDF Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">
              Book PDF
            </label>
            <button
              type="button"
              onClick={() => {
                setUsePdfFile(!usePdfFile);
                setPdfFile(null);
                setFormData(prev => ({ ...prev, bookPDFURL: '' }));
              }}
              className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            >
              {usePdfFile ? "Use URL" : "Upload File"}
            </button>
          </div>
          
          {usePdfFile ? (
            <div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handlePdfFileChange}
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 border border-gray-300 rounded-lg"
              />
              {pdfFile && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {pdfFile.name} ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          ) : (
            <input
              name="bookPDFURL"
              value={formData.bookPDFURL}
              onChange={handleInputChange}
              placeholder="Paste Book PDF URL here"
              required
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-5 transition-colors"
        >
          Upload Book
        </button>
      </div>
    </div>
  );
};

export default UploadBook;