import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RawDataModal from './RawDataModal';

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

    const parseAnswers = (answers) => {
        const result = {};
        Object.values(answers).forEach(val => {
            if (val.name) result[val.name] = val.answer;
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
                        return {
                            id: sub.id,
                            timestamp: parsed.timestamp || sub.created_at,
                            type: type,
                            location: parsed.location || 'Unknown',
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
                        Total Events: {events.length}
                    </span>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                            <th className="p-4 font-semibold border-b border-slate-700">Timestamp</th>
                            <th className="p-4 font-semibold border-b border-slate-700">Type</th>
                            <th className="p-4 font-semibold border-b border-slate-700">Location</th>
                            <th className="p-4 font-semibold border-b border-slate-700">Summary</th>
                            <th className="p-4 font-semibold border-b border-slate-700 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-500 italic">
                                    No data available. Waiting for transmission...
                                </td>
                            </tr>
                        ) : (
                            events.map((event) => (
                                <tr key={event.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 text-sm font-mono text-slate-300">{event.timestamp}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                            event.type === 'Message' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                            event.type === 'Tip' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                            event.type === 'Checkin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            event.type === 'Sighting' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                            'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                        }`}>
                                            {event.type}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-slate-300">{event.location}</td>
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

