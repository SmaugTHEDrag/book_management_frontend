import React, { useState } from 'react';
import { useLoaderData, useParams, useNavigate } from 'react-router-dom';

const EditBooks = () => {
  const { id } = useParams();
  const { title, author, image, category, description, pdf } = useLoaderData();
  const navigate = useNavigate();

  // State for toggle between URL and file upload
  const [useImageFile, setUseImageFile] = useState(false);
  const [usePdfFile, setUsePdfFile] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [bookCategory, setBookCategory] = useState(category || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data state - matching UploadBook structure
  const [formData, setFormData] = useState({
    bookTitle: title || '',
    authorName: author || '',
    imageURL: image || '',
    bookDescription: description || '',
    bookPDFURL: pdf || ''
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
    
    if (isSubmitting) return; // Prevent double submission
    
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

    setIsSubmitting(true);

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
        
        // Handle PDF - for edit, we need to handle cases where PDF might be optional
        if (usePdfFile && pdfFile) {
          formDataObj.append('pdf', pdfFile);
        } else if (!usePdfFile && bookPDFURL) {
          // For mixed mode (file for image, URL for PDF), we might need a different endpoint
          // or handle this case differently based on your backend implementation
        }

        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const headers = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch(`https://book-management-backend-d481.onrender.com/api/books/${id}/upload`, {
          method: "PUT",
          headers: headers,
          body: formDataObj,
        });
      } 
      // Using URLs (original method)
      else {
        const bookObj = {
          title: bookTitle.trim(),
          author: authorName.trim(),
          image: imageURL.trim() || null,  // Gửi null nếu empty
          category: bookCategory.trim(),
          description: bookDescription.trim() || null,  // Gửi null nếu empty
          pdf: bookPDFURL.trim() || null,  // Gửi null nếu empty
        };

        console.log('Sending book data:', bookObj); // Debug log

        // Get token from localStorage or wherever you store it
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        const headers = {
          "Content-type": "application/json",
        };
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        response = await fetch(`https://book-management-backend-d481.onrender.com/api/books/${id}`, {
          method: "PUT",
          headers: headers,
          body: JSON.stringify(bookObj),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        console.error('Response status:', response.status);
        throw new Error(`Failed to update book: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Update successful:', data); // Debug log
      alert("Book updated successfully!");
      
      // Force navigate with replace and state to trigger refresh
      navigate("/admin/dashboard/manage", { 
        replace: true,
        state: { refresh: Date.now() } // Add timestamp to force refresh
      });
      
      // Alternative: Use window.location for hard refresh
      // window.location.href = "/admin/dashboard/manage";
      
    } catch (err) {
      console.error('Update error:', err);
      alert(`Error updating book: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 my-12">
      <h2 className="mb-8 text-3xl font-bold">Edit Book</h2>
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
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            />
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mt-5 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Updating...' : 'Update Book'}
        </button>
      </div>
    </div>
  );
};

export default EditBooks;