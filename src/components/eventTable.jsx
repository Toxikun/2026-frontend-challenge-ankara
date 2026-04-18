import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventTable = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    return (
        <div className="w-full bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-blue-400">Podo Investigation Log</h2>
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
                                    {/* Data rows will go here */}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EventTable;
