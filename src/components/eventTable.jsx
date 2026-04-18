import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import RawDataModal from './RawDataModal';
import EventFilter from './EventFilter';

const API_KEY = '54a934fa20b1ccc3a5bd1d2076f90556';
const FORM_IDS = {
    Checkin: '261065067494966',
    Message: '261065765723966',
    Sighting: '261065244786967',
    Note: '261065509008958',
    Tip: '261065875889981'
};

const EventTable = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ startTime: '', endTime: '', search: '', type: '' });
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'none' });

    const parseAnswers = (answers) => {
        const result = {};
        Object.values(answers).forEach(val => {
            if (val.name) {
                // Handle complex answers like Full Name objects
                if (typeof val.answer === 'object' && val.answer !== null) {
                    if (val.answer.first || val.answer.last) {
                        result[val.name] = `${val.answer.first || ''} ${val.answer.last || ''}`.trim();
                    } else {
                        result[val.name] = JSON.stringify(val.answer);
                    }
                } else {
                    result[val.name] = val.answer;
                }
            }
        });
        return result;
    };

    const getSummary = (type, data) => {
        switch (type) {
            case 'Message': return data.text || 'No message content';
            case 'Tip': return data.tip || 'Anonymous tip received';
            case 'Note': return data.note || 'Podo left a note';
            case 'Sighting': return data.note ? `Seen with ${data.seenWith}: ${data.note}` : `Seen with ${data.seenWith}`;
            case 'Checkin': return data.note || 'Podo checked in';
            default: return 'No summary available';
        }
    };

    useEffect(() => {
        const fetchAllEvents = async () => {
            setLoading(true);
            try {
                const requests = Object.entries(FORM_IDS).map(([type, id]) =>
                    axios.get(`https://api.jotform.com/form/${id}/submissions?apiKey=${API_KEY}`)
                        .then(res => ({ type, data: res.data.content }))
                );

                const results = await Promise.all(requests);
                const combined = results.flatMap(({ type, data }) =>
                    data.map(sub => {
                        const parsed = parseAnswers(sub.answers);

                        // Logic to extract involved party/companion
                        let involvedParty = '-';
                        if (type === 'Message') {
                            involvedParty = parsed.senderName === 'Podo' ? parsed.recipientName : parsed.senderName;
                        } else if (type === 'Checkin') {
                            involvedParty = parsed.personName;
                        } else if (type === 'Sighting') {
                            involvedParty = parsed.seenWith;
                        } else if (type === 'Tip') {
                            involvedParty = parsed.suspectName;
                        } else if (type === 'Note') {
                            involvedParty = parsed.mentionedPeople;
                        }

                        return {
                            id: sub.id,
                            timestamp: parsed.timestamp || sub.created_at,
                            type: type,
                            location: parsed.location || 'Unknown',
                            involvedParty: involvedParty || '-',
                            summary: getSummary(type, parsed),
                            raw: sub
                        };
                    })
                );

                // Sort by timestamp (assuming standard format YYYY-MM-DD or similar)
                combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                setEvents(combined);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to fetch surveillance data.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllEvents();
    }, []);

    const handleFilterChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key) {
            if (sortConfig.direction === 'asc') direction = 'desc';
            else if (sortConfig.direction === 'desc') direction = 'none';
        }
        setSortConfig({ key, direction });
    };

    const sortedEvents = useMemo(() => {
        // 1. Filter
        const filtered = events.filter(event => {
            // Type Filter
            if (filters.type && event.type !== filters.type) return false;

            // Time Range Filter
            if (filters.startTime || filters.endTime) {
                const getMinutes = (timeStr) => {
                    const [h, m] = timeStr.split(':').map(Number);
                    return h * 60 + m;
                };

                const startMin = filters.startTime ? getMinutes(filters.startTime) : null;
                const endMin = filters.endTime ? getMinutes(filters.endTime) : null;

                const timePart = event.timestamp.split(' ')[1];
                if (timePart) {
                    const [h, m] = timePart.split(':').map(Number);
                    const eventMin = h * 60 + m;

                    if (startMin !== null && eventMin < startMin) return false;
                    if (endMin !== null && eventMin > endMin) return false;
                }
            }

            // Global Text Search
            if (filters.search) {
                const s = filters.search.toLowerCase();
                const matches = 
                    event.involvedParty.toLowerCase().includes(s) ||
                    event.location.toLowerCase().includes(s) ||
                    event.summary.toLowerCase().includes(s);
                if (!matches) return false;
            }
            
            return true;
        });

        // 2. Sort
        if (!sortConfig.key || sortConfig.direction === 'none') {
            return filtered;
        }

        return [...filtered].sort((a, b) => {
            const aVal = a[sortConfig.key];
            const bVal = b[sortConfig.key];

            if (sortConfig.key === 'timestamp') {
                const aTime = aVal.split(' ')[1] || '00:00';
                const bTime = bVal.split(' ')[1] || '00:00';
                return sortConfig.direction === 'asc' 
                    ? aTime.localeCompare(bTime)
                    : bTime.localeCompare(aTime);
            }

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });
    }, [events, filters, sortConfig]);

    if (loading) return (
        <div className="w-full bg-slate-800 rounded-xl p-12 text-center border border-slate-700 shadow-xl">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 animate-pulse">Establishing secure connection to Jotform API...</p>
        </div>
    );

    if (error) return (
        <div className="w-full bg-red-900/20 rounded-xl p-8 text-center border border-red-500/50 shadow-xl">
            <p className="text-red-400 font-semibold">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg border border-red-500/30 transition-all"
            >
                Retry Connection
            </button>
        </div>
    );

    return (
        <div className="w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                    Podo Investigation Log
                </h2>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-900 rounded-full text-xs text-slate-400 border border-slate-700">
                        {sortedEvents.length < events.length ? (
                            <span>Filtered Results: <b className="text-blue-400">{sortedEvents.length}</b> / {events.length}</span>
                        ) : (
                            <span>Total Events: {events.length}</span>
                        )}
                    </span>
                </div>
            </div>

            <div className="p-4 bg-slate-800/20 border-b border-slate-700">
                <EventFilter onFilterChange={handleFilterChange} />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                            {[
                                { key: 'timestamp', label: 'Timestamp' },
                                { key: 'type', label: 'Type' },
                                { key: 'location', label: 'Location' },
                                { key: 'involvedParty', label: 'Involved Party' },
                                { key: 'summary', label: 'Summary' }
                            ].map((col) => (
                                <th key={col.key} className="p-0 border-b border-slate-700">
                                    <button 
                                        onClick={() => handleSort(col.key)}
                                        className="w-full text-left p-4 hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                                    >
                                        <span className={sortConfig.key === col.key && sortConfig.direction !== 'none' ? 'text-blue-400' : ''}>
                                            {col.label}
                                        </span>
                                        <span className="flex flex-col ml-2 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <svg className={`w-2 h-2 ${sortConfig.key === col.key && sortConfig.direction === 'asc' ? 'text-blue-400 opacity-100' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 4l-8 8h16z"/></svg>
                                            <svg className={`w-2 h-2 ${sortConfig.key === col.key && sortConfig.direction === 'desc' ? 'text-blue-400 opacity-100' : ''}`} fill="currentColor" viewBox="0 0 24 24"><path d="M12 20l8-8H4z"/></svg>
                                        </span>
                                    </button>
                                </th>
                            ))}
                            <th className="p-4 font-semibold border-b border-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {sortedEvents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-500 italic">
                                    {events.length === 0 ? "No data available. Waiting for transmission..." : "No events found matching current criteria."}
                                </td>
                            </tr>
                        ) : (
                            sortedEvents.map((event) => (
                                <tr key={event.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 text-sm font-mono text-slate-300">
                                        {event.timestamp.split(' ')[1] || event.timestamp}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${event.type === 'Message' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                event.type === 'Tip' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                                    event.type === 'Checkin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                        event.type === 'Sighting' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                            }`}>
                                            {event.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">{event.location}</td>
                                    <td className="p-4 text-sm text-slate-300">
                                        <span className={event.involvedParty !== '-' ? 'text-blue-300 font-medium' : 'text-slate-500'}>
                                            {event.involvedParty}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400 max-w-md truncate">{event.summary}</td>
                                    <td className="p-4 text-right">
                                        <button
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setIsModalOpen(true);
                                            }}
                                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-semibold py-1 px-2 hover:bg-blue-400/10 rounded"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <RawDataModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                data={selectedEvent?.raw}
                title={`${selectedEvent?.type} submission (${selectedEvent?.id})`}
            />
        </div>
    );
};

export default EventTable;

