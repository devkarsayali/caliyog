import { useState } from 'react';
import { HiSearch } from 'react-icons/hi';
import { useData } from '../../context/DataContext';
import { membersAPI, contactsAPI, joinRequestsAPI } from '../../api/dataAPI';
import { useEffect } from 'react';

const GlobalSearch = ({ setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [allData, setAllData] = useState({ members: [], contacts: [], joinRequests: [] });
  const { experts, events, memberships, batches, transformations } = useData();

  useEffect(() => {
    const fetchAll = async () => {
      const [members, contacts, joinReqs] = await Promise.allSettled([
        membersAPI.getAll(),
        contactsAPI.getAll(),
        joinRequestsAPI.getAll(),
      ]);
      setAllData({
        members: members.status === 'fulfilled' ? members.value : [],
        contacts: contacts.status === 'fulfilled' ? contacts.value : [],
        joinRequests: joinReqs.status === 'fulfilled' ? joinReqs.value : [],
      });
    };
    fetchAll();
  }, []);

  const search = (q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    
    const term = q.toLowerCase();
    const all = [
      ...allData.members.map(m => ({ ...m, _type: 'member', _tab: 'members', _priority: 1 })),
      ...allData.contacts.map(c => ({ ...c, _type: 'enquiry', _tab: 'enquiries', _priority: 2 })),
      ...allData.joinRequests.map(j => ({ ...j, _type: 'joinRequest', _tab: 'reports', _priority: 1 })),
      ...experts.map(e => ({ ...e, _type: 'expert', _tab: 'experts', _priority: 2 })),
      ...events.map(e => ({ ...e, _type: 'event', _tab: 'events', _priority: 2 })),
      ...memberships.map(m => ({ ...m, _type: 'membership', _tab: 'membership', _priority: 2 })),
      ...batches.map(b => ({ ...b, _type: 'batch', _tab: 'batches', _priority: 2 })),
      ...transformations.map(t => ({ ...t, _type: 'transformation', _tab: 'transformations', _priority: 2 })),
    ];

    const matches = all.filter(item => {
      const text = `${item.name || ''} ${item.title || ''} ${item.email || ''} ${item.mobile || ''} ${item.specialization || ''}`.toLowerCase();
      return text.includes(term);
    }).sort((a, b) => a._priority - b._priority);

    setResults(matches.slice(0, 10));
  };

  return (
    <div className="mb-6 relative">
      <div className="relative">
        <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search members, enquiries, content..."
          value={query}
          onChange={(e) => search(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#0f1419] border border-white/10 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.map((r, idx) => (
            <button
              key={idx}
              onClick={() => { setActiveTab(r._tab); setResults([]); setQuery(''); }}
              className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between border-b border-white/5 last:border-0"
            >
              <div>
                <p className="text-white font-medium text-sm">{r.name || r.title}</p>
                <p className="text-gray-400 text-xs">{r.email || r.specialization || r.description?.substring(0, 50)}</p>
              </div>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{r._type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;