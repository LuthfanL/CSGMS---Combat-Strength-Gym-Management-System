import { createContext, useContext, useState, useEffect } from 'react';

const GymContext = createContext();

export const useGym = () => useContext(GymContext);

export const GymProvider = ({ children }) => {
  const [gymSettings, setGymSettings] = useState(null);
  const [operatingHours, setOperatingHours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
      if (res.ok) {
        const data = await res.json();
        
        const dayOrder = {
          'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
          'Friday': 5, 'Saturday': 6, 'Sunday': 7
        };
        
        const sortedHours = (data.operating_hours || []).sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);

        setGymSettings(data.settings);
        setOperatingHours(sortedHours);

        // Update favicon dynamically
        if (data.settings?.logo) {
          let link = document.querySelector("link[rel~='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = `${import.meta.env.VITE_STORAGE_URL}/${data.settings.logo}`;
        }
      }
    } catch (err) {
      console.error('Failed to load gym settings', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <GymContext.Provider value={{ gymSettings, operatingHours, isLoading, refreshSettings: fetchSettings }}>
      {children}
    </GymContext.Provider>
  );
};
