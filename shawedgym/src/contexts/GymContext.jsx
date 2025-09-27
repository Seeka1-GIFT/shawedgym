import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import apiService from '../services/api';

const GymContext = createContext();

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
};

export const GymProvider = ({ children }) => {
  const [currentGym, setCurrentGym] = useState(null);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showError, showSuccess } = useToast();

  // Load gyms on component mount
  useEffect(() => {
    loadGyms();
  }, []);

  // Load current gym from localStorage on mount
  useEffect(() => {
    const savedGym = localStorage.getItem('currentGym');
    if (savedGym) {
      try {
        setCurrentGym(JSON.parse(savedGym));
      } catch (error) {
        console.error('Error parsing saved gym:', error);
        localStorage.removeItem('currentGym');
      }
    }
  }, []);

  const loadGyms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGyms();
      if (response.success) {
        setGyms(response.data.gyms || []);
        
        // If no current gym is set and we have gyms, set the first one
        if (!currentGym && response.data.gyms && response.data.gyms.length > 0) {
          const firstGym = response.data.gyms[0];
          setCurrentGym(firstGym);
          localStorage.setItem('currentGym', JSON.stringify(firstGym));
        }
      }
    } catch (error) {
      console.error('Error loading gyms:', error);
      showError('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  };

  const switchGym = (gym) => {
    setCurrentGym(gym);
    localStorage.setItem('currentGym', JSON.stringify(gym));
    showSuccess(`Switched to ${gym.name}`);
  };

  const createGym = async (gymData) => {
    try {
      setLoading(true);
      const response = await apiService.createGym(gymData);
      if (response.success) {
        const newGym = response.data.gym;
        setGyms(prev => [...prev, newGym]);
        showSuccess('Gym created successfully');
        return newGym;
      }
    } catch (error) {
      console.error('Error creating gym:', error);
      showError('Failed to create gym');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateGym = async (gymId, gymData) => {
    try {
      setLoading(true);
      const response = await apiService.updateGym(gymId, gymData);
      if (response.success) {
        const updatedGym = response.data.gym;
        setGyms(prev => prev.map(gym => gym.id === gymId ? updatedGym : gym));
        
        // Update current gym if it's the one being updated
        if (currentGym && currentGym.id === gymId) {
          setCurrentGym(updatedGym);
          localStorage.setItem('currentGym', JSON.stringify(updatedGym));
        }
        
        showSuccess('Gym updated successfully');
        return updatedGym;
      }
    } catch (error) {
      console.error('Error updating gym:', error);
      showError('Failed to update gym');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteGym = async (gymId) => {
    try {
      setLoading(true);
      const response = await apiService.deleteGym(gymId);
      if (response.success) {
        setGyms(prev => prev.filter(gym => gym.id !== gymId));
        
        // If current gym is deleted, switch to first available gym
        if (currentGym && currentGym.id === gymId) {
          const remainingGyms = gyms.filter(gym => gym.id !== gymId);
          if (remainingGyms.length > 0) {
            const newCurrentGym = remainingGyms[0];
            setCurrentGym(newCurrentGym);
            localStorage.setItem('currentGym', JSON.stringify(newCurrentGym));
          } else {
            setCurrentGym(null);
            localStorage.removeItem('currentGym');
          }
        }
        
        showSuccess('Gym deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting gym:', error);
      showError('Failed to delete gym');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentGymId = () => {
    return currentGym?.id || null;
  };

  const getCurrentGymName = () => {
    return currentGym?.name || 'No Gym Selected';
  };

  const value = {
    currentGym,
    gyms,
    loading,
    switchGym,
    createGym,
    updateGym,
    deleteGym,
    loadGyms,
    getCurrentGymId,
    getCurrentGymName
  };

  return (
    <GymContext.Provider value={value}>
      {children}
    </GymContext.Provider>
  );
};
