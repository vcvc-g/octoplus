import { useState, useMemo } from 'react';
import { getAcceptanceRateLevel } from '../utils/prestigeCalculator';

export const useUniversityFilter = (universities) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterAcceptance, setFilterAcceptance] = useState(0);

  const filteredUniversities = useMemo(() => {
    return universities.filter(university => {
      const matchesSearch = university.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion = filterRegion === 'All' || university.location === filterRegion;
      const matchesType = filterType === 'All' || university.type === filterType;

      const acceptanceRateLevel = getAcceptanceRateLevel(university.acceptanceRate);
      const matchesAcceptance = filterAcceptance === 0 || acceptanceRateLevel === filterAcceptance;

      return matchesSearch && matchesRegion && matchesType && matchesAcceptance;
    });
  }, [universities, searchTerm, filterRegion, filterType, filterAcceptance]);

  return {
    searchTerm,
    setSearchTerm,
    filterRegion,
    setFilterRegion,
    filterType,
    setFilterType,
    filterAcceptance,
    setFilterAcceptance,
    filteredUniversities
  };
};