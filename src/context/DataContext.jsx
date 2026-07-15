import { createContext, useContext, useState, useEffect } from 'react';
import { 
  aboutAPI, 
  whyChooseUsAPI, 
  batchesAPI, 
  membershipsAPI, 
  transformationsAPI, 
  expertsAPI, 
  eventsAPI 
} from '../api/dataAPI';

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [about, setAbout] = useState(null);
  const [whyChooseUs, setWhyChooseUs] = useState([]);
  const [batches, setBatches] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [transformations, setTransformations] = useState([]);
  const [experts, setExperts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [aboutData, wcuData, batchesData, membData, transData, expData, evData] = 
        await Promise.allSettled([
          aboutAPI.getAll(),
          whyChooseUsAPI.getAll(),
          batchesAPI.getAll(),
          membershipsAPI.getAll(),
          transformationsAPI.getAll(),
          expertsAPI.getAll(),
          eventsAPI.getAll(),
        ]);

      if (aboutData.status === 'fulfilled') {
        const value = aboutData.value;
        setAbout(Array.isArray(value) ? value[0] || null : value);
      }
      if (wcuData.status === 'fulfilled') setWhyChooseUs(wcuData.value);
      if (batchesData.status === 'fulfilled') setBatches(batchesData.value);
      if (membData.status === 'fulfilled') setMemberships(membData.value);
      if (transData.status === 'fulfilled') setTransformations(transData.value);
      if (expData.status === 'fulfilled') setExperts(expData.value);
      if (evData.status === 'fulfilled') setEvents(evData.value);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <DataContext.Provider value={{
      about, setAbout,
      whyChooseUs, setWhyChooseUs,
      batches, setBatches,
      memberships, setMemberships,
      transformations, setTransformations,
      experts, setExperts,
      events, setEvents,
      loading,
      refresh: fetchAllData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};