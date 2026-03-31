const express = require('express');
const router = express.Router();
const axios = require('axios');

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const COVERS_BASE = 'https://covers.openlibrary.org';

// Helper to format book data from Open Library
const formatBook = (doc) => ({
  bookId: doc.key?.replace('/works/', '') || doc.key,
  title: doc.title || 'Unknown Title',
  author: doc.author_name?.[0] || (doc.authors?.[0]?.name) || 'Unknown Author',
  authors: doc.author_name || [],
  cover: doc.cover_i
    ? `${COVERS_BASE}/b/id/${doc.cover_i}-M.jpg`
    : doc.cover_edition_key
    ? `${COVERS_BASE}/b/olid/${doc.cover_edition_key}-M.jpg`
    : '',
  description: doc.first_sentence?.[0] || '',
  publishedYear: doc.first_publish_year || '',
  pageCount: doc.number_of_pages_median || 0,
  genre: doc.subject?.[0] || '',
  subjects: doc.subject?.slice(0, 5) || [],
  ratingsAverage: doc.ratings_average ? doc.ratings_average.toFixed(1) : null,
  ratingsCount: doc.ratings_count || 0
});

// @route GET /api/books/search?q=query&page=1
router.get('/search', async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query required' });

    const offset = (page - 1) * limit;
    const response = await axios.get(`${OPEN_LIBRARY_BASE}/search.json`, {
      params: {
        q,
        limit,
        offset,
        fields: 'key,title,author_name,cover_i,cover_edition_key,first_publish_year,number_of_pages_median,subject,ratings_average,ratings_count,first_sentence'
      },
      timeout: 10000
    });

    const books = response.data.docs.map(formatBook);
    res.json({
      books,
      total: response.data.numFound,
      page: parseInt(page),
      totalPages: Math.ceil(response.data.numFound / limit)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to search books', error: error.message });
  }
});

// @route GET /api/books/trending
router.get('/trending', async (req, res) => {
  try {
    const response = await axios.get(`${OPEN_LIBRARY_BASE}/trending/weekly.json`, {
      params: { limit: 12 },
      timeout: 10000
    });
    const works = response.data.works || [];
const books = works.map(formatBook);
    res.json({ books });
  } catch (error) {
    // Fallback to popular subjects
    try {
      const response = await axios.get(`${OPEN_LIBRARY_BASE}/search.json`, {
        params: {
          q: 'fiction bestseller',
          limit: 12,
          sort: 'rating',
          fields: 'key,title,author_name,cover_i,cover_edition_key,first_publish_year,number_of_pages_median,subject,ratings_average,ratings_count'
        },
        timeout: 10000
      });
      const books = response.data.docs.map(formatBook);
      res.json({ books });
    } catch (fallbackError) {
      res.status(500).json({ message: 'Failed to fetch trending books' });
    }
  }
});

// @route GET /api/books/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [workRes, ratingsRes] = await Promise.allSettled([
      axios.get(`${OPEN_LIBRARY_BASE}/works/${id}.json`, { timeout: 10000 }),
      axios.get(`${OPEN_LIBRARY_BASE}/works/${id}/ratings.json`, { timeout: 10000 })
    ]);

    if (workRes.status === 'rejected') {
      return res.status(404).json({ message: 'Book not found' });
    }

    const work = workRes.value.data;
    const ratings = ratingsRes.status === 'fulfilled' ? ratingsRes.value.data : null;

    // Fetch author details
    let authorName = 'Unknown Author';
    if (work.authors?.[0]?.author?.key) {
      try {
        const authorRes = await axios.get(`${OPEN_LIBRARY_BASE}${work.authors[0].author.key}.json`, { timeout: 5000 });
        authorName = authorRes.data.name || 'Unknown Author';
      } catch {}
    }

    const description = typeof work.description === 'string'
      ? work.description
      : work.description?.value || '';

    const book = {
      bookId: id,
      title: work.title,
      author: authorName,
      description: description.substring(0, 1000),
      cover: work.covers?.[0] ? `${COVERS_BASE}/b/id/${work.covers[0]}-L.jpg` : '',
      subjects: work.subjects?.slice(0, 8) || [],
      publishedYear: work.first_publish_date || '',
      ratingsAverage: ratings?.summary?.average ? ratings.summary.average.toFixed(1) : null,
      ratingsCount: ratings?.summary?.count || 0
    };

    res.json({ book });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch book details', error: error.message });
  }
});

// @route GET /api/books/subject/:subject
router.get('/subject/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    const response = await axios.get(`${OPEN_LIBRARY_BASE}/subjects/${subject}.json`, {
      params: { limit: 12 },
      timeout: 10000
    });

 const works = response.data.works || [];
const books = works.map(work => ({
      bookId: work.key?.replace('/works/', ''),
      title: work.title,
      author: work.authors?.[0]?.name || 'Unknown Author',
      cover: work.cover_id ? `${COVERS_BASE}/b/id/${work.cover_id}-M.jpg` : '',
      publishedYear: work.first_publish_year || '',
      subjects: []
    }));

    res.json({ books, subject: response.data.name });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subject books' });
  }
});

module.exports = router;
