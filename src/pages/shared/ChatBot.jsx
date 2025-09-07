import React, { useState, useRef, useEffect } from 'react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      content: 'Hey there 👋\nHow can I help you today? I can recommend books from our database!\n\nYou can ask me things like:\n• "Show me fiction books"\n• "Books by Stephen King"\n• "Find books titled Harry Potter"\n• "Any good science books?"',
      timestamp: Date.now()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isThinking, setIsThinking] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputHeight, setInputHeight] = useState(48);
  const [selectedBook, setSelectedBook] = useState(null);
  
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const chatBodyRef = useRef(null);
  
  // Spring Boot Backend Configuration
  const BACKEND_BASE_URL = "https://book-management-backend-d481.onrender.com/api";
  
  // Chat history for API context
  const [chatHistory, setChatHistory] = useState([]);
  
  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
      setInputHeight(newHeight);
    }
  }, [inputValue]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  // Fetch books from Spring Boot backend with enhanced search
  const fetchBooks = async (searchParams = {}) => {
    try {
      const { category, author, title, limit = 10 } = searchParams;
      
      let url = `${BACKEND_BASE_URL}/books?page=0&size=${limit}`;
      
      if (title) {
        url += `&titleSearch=${encodeURIComponent(title)}`;
      }
      if (author) {
        url += `&authorSearch=${encodeURIComponent(author)}`;
      }
      if (category) {
        url += `&categorySearch=${encodeURIComponent(category)}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch books');
      
      const data = await response.json();
      return data.content || [];
    } catch (error) {
      console.error('Error fetching books:', error);
      return [];
    }
  };

  // Add to favorites function
  const addToFavorites = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, message: 'Please login to add favorites' };
      }

      const response = await fetch(`${BACKEND_BASE_URL}/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        const errText = await response.text();
        return { success: false, message: errText || 'Failed to add to favorites' };
      }

      return { success: true, message: 'Book added to favorites!' };
    } catch (error) {
      console.error('Add favorite error:', error);
      return { success: false, message: error.message };
    }
  };

  // Enhanced query analysis
  const analyzeQuery = (message) => {
    const lowerMessage = message.toLowerCase();
    
    const bookKeywords = ['book', 'books', 'recommend', 'suggestion', 'read', 'reading', 'novel', 'literature', 'story', 'find', 'search', 'author', 'writer'];
    const isBookQuery = bookKeywords.some(keyword => lowerMessage.includes(keyword));
    
    const searchParams = {};
    
    const categories = {
      'fiction': ['fiction'],
      'fantasy': ['fantasy'],
      'thriller': ['thriller'],
      'historical': ['historical'],
      'mystery': ['mystery'],
      'horror': ['horror'],
      'comic': ['comic'],
      'crime': ['crime'],
      'science-fiction': ['science-fiction', 'sci-fi', 'scifi'],
      'science': ['science', 'scientific'],
      'psychology': ['psychology'],
      'art': ['art'],
      'romance': ['romance', 'romantic', 'love story'],
      'biography': ['biography', 'biographies', 'life story'],
      'cookbooks': ['cookbooks', 'cooking', 'recipe'],
      'programming': ['programming', 'coding', 'development'],
      'machine-learning': ['machine-learning', 'ml', 'ai', 'artificial intelligence']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        searchParams.category = category;
        break;
      }
    }
    
    // Author extraction patterns
    const authorPatterns = [
      /(?:books?\s+)?by\s+([a-zA-Z\s.'-]+?)(?:\s+books?|\s*$|[.!?])/i,
      /author\s+([a-zA-Z\s.'-]+?)(?:\s+books?|\s*$|[.!?])/i,
      /(?:books?\s+)?from\s+([a-zA-Z\s.'-]+?)(?:\s+books?|\s*$|[.!?])/i,
      /written\s+by\s+([a-zA-Z\s.'-]+?)(?:\s+books?|\s*$|[.!?])/i
    ];
    
    for (const pattern of authorPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const authorName = match[1].trim();
        if (authorName && authorName.length > 1) {
          const cleanAuthor = authorName.replace(/\s+(books?|novels?|stories?)$/i, '').trim();
          if (cleanAuthor.length > 1) {
            searchParams.author = cleanAuthor;
            break;
          }
        }
      }
    }
    
    // Title extraction patterns
    const titlePatterns = [
      /"([^"]+)"/g,
      /titled\s+"?([a-zA-Z0-9\s:',.-]+?)"?(?:\s+by|\s*$|[.!?])/i,
      /called\s+"?([a-zA-Z0-9\s:',.-]+?)"?(?:\s+by|\s*$|[.!?])/i,
      /book\s+"?([a-zA-Z0-9\s:',.-]+?)"?(?:\s+by|\s*$|[.!?])/i
    ];
    
    for (const pattern of titlePatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        const titleName = match[1].trim();
        if (titleName && titleName.length > 1) {
          searchParams.title = titleName;
          break;
        }
      }
    }
    
    return {
      isBookQuery,
      searchParams,
      queryType: searchParams.author ? 'author' : searchParams.title ? 'title' : searchParams.category ? 'category' : 'general'
    };
  };

  // Generate enhanced book recommendation response
  const generateBookRecommendationResponse = async (userMessage) => {
    const { searchParams, queryType } = analyzeQuery(userMessage);
    const books = await fetchBooks(searchParams);
    
    if (books.length === 0) {
      let message = 'Sorry, I couldn\'t find any books';
      if (searchParams.category) message += ` in the ${searchParams.category} category`;
      if (searchParams.author) message += ` by ${searchParams.author}`;
      if (searchParams.title) message += ` with title "${searchParams.title}"`;
      message += ' in our database. Please try a different search.';
      
      return {
        type: 'bot',
        content: message,
        timestamp: Date.now()
      };
    }

    let responseMessage = '';
    if (queryType === 'author' && searchParams.author) {
      responseMessage = `Here are ${books.length} books by ${searchParams.author}:`;
    } else if (queryType === 'title' && searchParams.title) {
      responseMessage = `Here are books matching "${searchParams.title}":`;
    } else if (queryType === 'category' && searchParams.category) {
      responseMessage = `Here are ${books.length} ${searchParams.category} books I recommend:`;
    } else {
      responseMessage = `Here are ${books.length} books I found for you:`;
    }
    
    return {
      type: 'bot',
      content: responseMessage,
      timestamp: Date.now(),
      books: books.slice(0, 10)
    };
  };

  // Check if message is asking for book recommendations
  const isBookRecommendationQuery = (message) => {
    return analyzeQuery(message).isBookQuery;
  };

  // Call Spring Boot chat endpoint for non-book queries
  const callChatAPI = async (userMessage, fileData = null) => {
    try {
      // Get authentication token
      const token = localStorage.getItem('token');
      
      // Prepare request payload
      const requestPayload = {
        message: userMessage,
        chatHistory: chatHistory.map(entry => ({
          role: entry.role,
          parts: entry.parts
        })),
        fileData: fileData
      };

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add Authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${BACKEND_BASE_URL}/chat/generate`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Authentication required. Please log in to use the AI chat feature.');
        } else if (response.status === 401) {
          throw new Error('Invalid or expired token. Please log in again.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      
      if (data.isError) {
        throw new Error(data.errorMessage || 'Unknown error occurred');
      }

      return data.content;
    } catch (error) {
      console.error('Chat API Error:', error);
      throw error;
    }
  };

  // Simplified generateBotResponse
  const generateBotResponse = async (userMessage, fileData = null) => {
    setIsThinking(true);
    
    try {
      // Check authentication for AI chat features
      const token = localStorage.getItem('token');
      
      if (!isBookRecommendationQuery(userMessage) && !token) {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: 'Please log in to use the AI chat feature. However, I can still help you search for books from our database using keywords like "fiction books" or "books by [author name]"!',
          timestamp: Date.now(),
          isError: true
        }]);
        setIsThinking(false);
        return;
      }

      // Check if it's a book recommendation query
      if (isBookRecommendationQuery(userMessage)) {
        const bookResponse = await generateBookRecommendationResponse(userMessage);
        setMessages(prev => [...prev, bookResponse]);
        setIsThinking(false);
        return;
      }

      // For non-book queries, use Spring Boot chat endpoint
      const newHistoryEntry = {
        role: "user",
        parts: [
          { text: userMessage },
          ...(fileData ? [{ inline_data: { mime_type: fileData.mime_type, data: fileData.data } }] : [])
        ]
      };
      
      const updatedHistory = [...chatHistory, newHistoryEntry];
      
      // Call Spring Boot chat API
      const apiResponseText = await callChatAPI(userMessage, fileData);
      
      // Add bot response to messages
      setMessages(prev => [...prev, {
        type: 'bot',
        content: apiResponseText,
        timestamp: Date.now()
      }]);
      
      // Update chat history
      setChatHistory([...chatHistory, 
        {
          role: "user",
          parts: [
            { text: userMessage },
            ...(fileData ? [{ inline_data: { mime_type: fileData.mime_type, data: fileData.data } }] : [])
          ]
        },
        {
          role: "model",
          parts: [{ text: apiResponseText }]
        }
      ]);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        type: 'bot',
        content: error.message || 'Sorry, I encountered an error. Please try again. I can still help you search for books by title, author, or genre!',
        timestamp: Date.now(),
        isError: true
      }]);
    } finally {
      setIsThinking(false);
    }
  };
  
  // Handle sending message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const messageText = inputValue.trim();
    const fileData = selectedFile;
    
    // Add user message to messages
    const userMessage = {
      type: 'user',
      content: messageText,
      timestamp: Date.now(),
      file: selectedFile
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input and file
    setInputValue('');
    setSelectedFile(null);
    
    // Generate bot response
    await generateBotResponse(messageText, fileData);
  };
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = e.target.result.split(",")[1];
      setSelectedFile({
        data: base64String,
        mime_type: file.type,
        preview: e.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };
  
  // Handle emoji insertion
  const insertEmoji = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = inputValue.substring(0, start) + emoji + inputValue.substring(end);
    setInputValue(newValue);
    setShowEmojiPicker(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };
  
  // Common emojis for quick access
  const commonEmojis = ['😀', '😂', '😊', '😍', '🤔', '👍', '❤️', '🔥', '💯', '🎉'];
  
  const BotAvatar = () => (
    <img
      className="w-8 h-8"
      src="https://res.cloudinary.com/duipncbaq/image/upload/v1755153957/34326604_jtstdt.jpg"
      alt="Bot Avatar"
    />
  );
  
  const ThinkingIndicator = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
    </div>
  );

  // Enhanced Book Card Component with favorite functionality
  const BookCard = ({ book, onViewDetails }) => {
    const [isAddingFavorite, setIsAddingFavorite] = useState(false);
    
    const handleAddToFavorite = async (e) => {
      e.stopPropagation();
      setIsAddingFavorite(true);
      
      const result = await addToFavorites(book.id);
      
      setMessages(prev => [...prev, {
        type: 'bot',
        content: result.success ? `✅ "${book.title}" has been added to your favorites!` : `❌ ${result.message}`,
        timestamp: Date.now(),
        isSystem: true
      }]);
      
      setIsAddingFavorite(false);
    };
    
    const truncateDescription = (description, maxLength = 80) =>
      description && description.length > maxLength ? description.slice(0, maxLength) + '...' : description;
    
    return (
      <div className="bg-white border rounded-lg p-3 mb-2 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex space-x-3">
          {book.image ? (
            <div className="flex-shrink-0">
              <img 
                src={book.image} 
                alt={book.title}
                className="w-16 h-20 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA2NCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCA0MEg0NFYyNEgyMFY0MFoiIGZpbGw9IiM5Q0E0QUIiLz4KPHA+Tm8gSW1hZ2U8L3A+Cjwvc3ZnPgo=';
                }}
                onClick={() => onViewDetails && onViewDetails(book)}
              />
            </div>
          ) : (
            <div className="w-16 h-20 bg-gray-100 rounded border flex items-center justify-center cursor-pointer" onClick={() => onViewDetails && onViewDetails(book)}>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 
              className="text-sm font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onViewDetails && onViewDetails(book)}
            >
              {book.title}
            </h4>
            <p className="text-xs text-gray-600 mt-1">by {book.author}</p>
            <p className="text-xs text-blue-600 mt-1 capitalize">{book.category}</p>
            {book.description && (
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                {truncateDescription(book.description)}
              </p>
            )}
            <div className="flex justify-between items-center mt-2">
              <div className="flex gap-1">
                <button
                  onClick={handleAddToFavorite}
                  disabled={isAddingFavorite}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-50 flex items-center gap-1"
                >
                  {isAddingFavorite ? (
                    <>
                      <div className="w-3 h-3 border border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Favorite
                    </>
                  )}
                </button>
                {onViewDetails && (
                  <button
                    onClick={() => onViewDetails(book)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                  >
                    Details
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Book Detail Modal Component
  const BookDetailModal = ({ book, onClose }) => {
    if (!book) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-4 py-3 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Book Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Book Image */}
            {book.image && (
              <div className="text-center">
                <img 
                  src={book.image} 
                  alt={book.title}
                  className="w-32 h-40 object-cover rounded-lg mx-auto shadow-md"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            {/* Book Info */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Title:</label>
                <p className="text-base text-gray-900 mt-1">{book.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Author:</label>
                <p className="text-base text-gray-900 mt-1">{book.author}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-600">Category:</label>
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full capitalize">
                  {book.category}
                </span>
              </div>
              
              {book.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description:</label>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{book.description}</p>
                </div>
              )}
              
              {book.pdf && (
                <div>
                  <label className="text-sm font-medium text-gray-600">PDF:</label>
                  <div className="mt-1">
                    <a 
                      href={book.pdf} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full hover:bg-green-200 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
              
              <div className="pt-2 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-600">Book ID:</label>
                    <p className="text-gray-900">{book.id}</p>
                  </div>
                  <div>
                    <label className="text-gray-600">Added:</label>
                    <p className="text-gray-900">
                      {book.createdAt ? new Date(book.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const result = await addToFavorites(book.id);
                    const tempMessage = {
                      type: 'bot',
                      content: result.success ? `✅ "${book.title}" added to favorites!` : `❌ ${result.message}`,
                      timestamp: Date.now(),
                      isSystem: true
                    };
                    setMessages(prev => [...prev, tempMessage]);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Add to Favorites
                </button>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => {
                    setInputValue(`Tell me more about "${book.title}" by ${book.author}`);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                >
                  Ask About This Book
                </button>
                <button
                  onClick={() => {
                    setInputValue(`Find similar books to "${book.title}"`);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Find Similar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat Toggler - Only shown when chat is closed */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-blue-700 text-white rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center mb-4"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}
      
      {/* Chatbot Popup */}
      {isOpen && (
        <div className="w-[480px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-blue-700 text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BotAvatar />
              <div>
                <h3 className="font-semibold text-lg">Book Assistant</h3>
                <p className="text-xs opacity-90">Ask me for book recommendations!</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          
          {/* Chat Body */}
          <div 
            ref={chatBodyRef}
            className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4"
          >
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-start space-x-2 max-w-xs ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {message.type === 'bot' && <BotAvatar />}
                  <div className={`rounded-lg p-3 break-words ${
                    message.type === 'user' 
                      ? 'bg-blue-500 text-white rounded-br-sm' 
                      : message.isError 
                        ? 'bg-red-100 text-red-700 rounded-bl-sm'
                        : 'bg-white border rounded-bl-sm'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                    
                    {/* Display books if present */}
                    {message.books && message.books.length > 0 && (
                      <div className="mt-3 space-y-2 max-w-sm">
                        {message.books.map((book, bookIndex) => (
                          <BookCard 
                            key={book.id || bookIndex} 
                            book={book} 
                            onViewDetails={setSelectedBook}
                          />
                        ))}
                      </div>
                    )}
                    
                    {message.file && (
                      <div className="mt-2">
                        <img 
                          src={message.file.preview} 
                          alt="Uploaded file" 
                          className="max-w-full h-auto rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2">
                  <BotAvatar />
                  <div className="bg-white border rounded-lg rounded-bl-sm p-3">
                    <ThinkingIndicator />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Quick Actions */}
          <div className="px-4 py-2 bg-white border-t">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setInputValue("Recommend me 10 fiction books")}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full hover:bg-blue-200 transition-colors"
              >
                Fiction Books
              </button>
              <button
                onClick={() => setInputValue("Show me mystery books")}
                className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full hover:bg-green-200 transition-colors"
              >
                Mystery Books
              </button>
              <button
                onClick={() => setInputValue("Books by J.K. Rowling")}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full hover:bg-purple-200 transition-colors"
              >
                By Author
              </button>
              <button
                onClick={() => setInputValue("Thriller books")}
                className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full hover:bg-yellow-200 transition-colors"
              >
                Thriller
              </button>
              <button
                onClick={() => setInputValue("Any good books to read?")}
                className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition-colors"
              >
                Any Good Books?
              </button>
              <button
                onClick={() => setInputValue("Find books called Weyward")}
                className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-full hover:bg-orange-200 transition-colors"
              >
                Find Book by Title
              </button>
            </div>
          </div>
          
          {/* Chat Footer */}
          <div className="p-4 bg-white border-t">
            {selectedFile && (
              <div className="mb-3 flex items-center justify-between bg-gray-100 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <img 
                    src={selectedFile.preview} 
                    alt="Preview" 
                    className="w-8 h-8 rounded object-cover"
                  />
                  <span className="text-sm text-gray-600 truncate">{selectedFile.name}</span>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            {showEmojiPicker && (
              <div className="mb-3 bg-white border rounded-lg p-3 shadow-lg">
                <div className="grid grid-cols-5 gap-2">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => insertEmoji(emoji)}
                      className="text-lg hover:bg-gray-100 rounded p-1 transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask for book recommendations..."
                className="w-full resize-none border rounded-full px-4 py-3 pr-24 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[48px] max-h-[120px]"
                style={{
                  borderRadius: inputHeight > 48 ? '15px' : '24px',
                  paddingRight: '100px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && window.innerWidth > 768) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}
    </div>
  );
};

export default Chatbot;