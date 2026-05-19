// Response helper functions
const sendSuccess = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const sendError = (res, message, statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

// Pagination helper
const getPaginationData = (page, limit, total) => {
  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / limit)
  };
};

// Search and filter helper
const buildSearchFilters = (queryParams) => {
  const filters = {};

  // Search term
  const searchTerm = queryParams.search || queryParams.query;
  if (searchTerm) {
    filters.search = searchTerm.trim();
  }

  // Category filter
  if (queryParams.category_id) {
    filters.category_id = parseInt(queryParams.category_id);
  }

  // Price range
  if (queryParams.min_price) {
    filters.min_price = parseFloat(queryParams.min_price);
  }
  if (queryParams.max_price) {
    filters.max_price = parseFloat(queryParams.max_price);
  }

  // Rating filter
  if (queryParams.rating) {
    filters.seller_rating = parseFloat(queryParams.rating);
  }

  // Sort options
  filters.sort = queryParams.sort || 'newest';

  return filters;
};

// Validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

// File helpers
const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

const generateFileName = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.round(Math.random() * 1E9);
  const extension = getFileExtension(originalName);
  return `${prefix}${timestamp}-${random}.${extension}`;
};

// Date helpers
const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (format) {
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    default:
      return d.toISOString().split('T')[0];
  }
};

const formatDateTime = (date) => {
  return new Date(date).toISOString().replace('T', ' ').substring(0, 19);
};

// Currency helpers
const formatCurrency = (amount, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0
  }).format(amount);
};

// Slug generator
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Random string generator
const generateRandomString = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

module.exports = {
  sendSuccess,
  sendError,
  getPaginationData,
  buildSearchFilters,
  validateEmail,
  validatePhone,
  validatePassword,
  getFileExtension,
  generateFileName,
  formatDate,
  formatDateTime,
  formatCurrency,
  generateSlug,
  generateRandomString
};