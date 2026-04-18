import React, { useState, useEffect } from 'react';

const EventFilter = ({ onFilterChange }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');

    useEffect(() => {
        onFilterChange({ startTime, endTime, search, type });
    }, [startTime, endTime, search, type, onFilterChange]);

    const handleClear = () => {
        setStartTime('');
        setEndTime('');
        setSearch('');
        setType('');
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 mb-6 shadow-lg animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
                
                {/* Search Section */}
                <div className="flex-1 min-w-[300px]">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            Global Search
                        </label>
                        <input 
                            type="text" 
                            placeholder="Person, location, or keywords..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Type Filter */}
                <div className="w-full lg:w-48">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Record Type</label>
                        <select 
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all custom-select"
                        >
                            <option value="">All Streams</option>
                            <option value="Checkin">Check-in</option>
                            <option value="Message">Message</option>
                            <option value="Sighting">Sighting</option>
                            <option value="Note">Notes</option>
                            <option value="Tip">Anon Tips</option>
                        </select>
                    </div>
                </div>

                {/* Time Range Section */}
                <div className="flex items-center gap-4 min-w-[180px]">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">From</label>
                        <input 
                            type="time" 
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Until</label>
                        <input 
                            type="time" 
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-end gap-2">
                    {(startTime || endTime || search || type) && (
                        <button 
                            onClick={handleClear}
                            className="h-10 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventFilter;
