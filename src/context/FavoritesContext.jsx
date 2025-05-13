// src/context/FavoritesContext.jsx - Completed context for managing favorites
import React, { createContext, useState, useContext, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  // Load favorites from localStorage on init
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('favoriteUniversities');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Could not load favorites from localStorage", e);
      return [];
    }
  });

  // Save to localStorage whenever favorites change
  useEffect(() => {
    try {
      localStorage.setItem('favoriteUniversities', JSON.stringify(favorites));
    } catch (e) {
      console.error("Could not save favorites to localStorage", e);
    }
  }, [favorites]);

  const addToFavorites = (university) => {
    if (!favorites.find(fav => fav.id === university.id)) {
      setFavorites(prev => [...prev, university]);
      return true;
    }
    return false;
  };

  const removeFromFavorites = (universityId) => {
    setFavorites(prev => prev.filter(fav => fav.id !== universityId));
  };

  const isFavorite = (universityId) => {
    return favorites.some(fav => fav.id === universityId);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  // For comparison feature
  const [compareList, setCompareList] = useState(Array(3).fill(null));

  const addToCompare = (university) => {
    const emptyIndex = compareList.findIndex(item => item === null);
    if (emptyIndex !== -1 && !compareList.find(item => item?.id === university.id)) {
      const newList = [...compareList];
      newList[emptyIndex] = university;
      setCompareList(newList);
      return true;
    }
    return false;
  };

  const removeFromCompare = (index) => {
    const newList = [...compareList];
    newList[index] = null;
    setCompareList(newList);
  };

  const isInCompare = (universityId) => {
    return compareList.some(item => item?.id === universityId);
  };

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearFavorites,
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};