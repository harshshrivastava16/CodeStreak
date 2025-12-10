import React, { createContext, useContext, useState } from "react";

const DataCacheContext = createContext();

export const useDataCache = () => useContext(DataCacheContext);

export const DataCacheProvider = ({ children }) => {
  const [cache, setCache] = useState({
    streaks: null,
    friends: null,
    profile: null,
  });

  const updateCache = (key, data) => {
    setCache(prev => ({ ...prev, [key]: data }));
  };

  const clearCache = () => {
    setCache({
      streaks: null,
      friends: null,
      profile: null,
    });
  };

  return (
    <DataCacheContext.Provider value={{ cache, updateCache, clearCache }}>
      {children}
    </DataCacheContext.Provider>
  );
};
