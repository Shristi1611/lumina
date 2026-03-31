import React, { createContext, useContext, useState, useCallback } from 'react';
import { shelfAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ShelfContext = createContext();

export const ShelfProvider = ({ children }) => {
  const [shelf, setShelf] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchShelf = useCallback(async (status) => {
    setLoading(true);
    try {
      const res = await shelfAPI.getShelf(status);
      setShelf(res.data.shelf);
    } catch (e) {
      toast.error('Could not load your shelf');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await shelfAPI.getStats();
      setStats(res.data.stats);
    } catch {}
  }, []);

  const addBook = async (bookData) => {
    const res = await shelfAPI.addBook(bookData);
    setShelf(prev => [res.data.item, ...prev]);
    await fetchStats();
    return res.data.item;
  };

  const updateBook = async (id, data) => {
    const res = await shelfAPI.updateBook(id, data);
    setShelf(prev => prev.map(b => b._id === id ? res.data.item : b));
    await fetchStats();
    return res.data.item;
  };

  const removeBook = async (id) => {
    await shelfAPI.removeBook(id);
    setShelf(prev => prev.filter(b => b._id !== id));
    await fetchStats();
  };

  const isOnShelf = (bookId) => shelf.some(b => b.bookId === bookId);
  const getShelfItem = (bookId) => shelf.find(b => b.bookId === bookId);

  return (
    <ShelfContext.Provider value={{
      shelf, stats, loading,
      fetchShelf, fetchStats,
      addBook, updateBook, removeBook,
      isOnShelf, getShelfItem
    }}>
      {children}
    </ShelfContext.Provider>
  );
};

export const useShelf = () => useContext(ShelfContext);
