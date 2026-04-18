import React, { useState, useEffect } from 'react';

const EventFilter = ({ onFilterChange }) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');

    useEffect(() => {
        onFilterChange({ startTime, endTime });
    }, [startTime, endTime, onFilterChange]);

    const handleClear = () => {
        setStartTime('');
        setEndTime('');
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 mb-6 shadow-lg animate-in slide-in-from-top-4 duration-500">
            <div className="flex flex-wrap items-end gap-6">
                {/* Header Section */}
                <div className="flex flex-col gap-1 pr-4 border-r border-slate-700/50 hidden md:flex">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Temporal Search</span>
                    <span className="text-sm font-semibold text-blue-400">Filter by Time</span>
                </div>

                {/* Time Range Inputs */}
                <div className="flex items-center gap-4 flex-1 min-w-[300px]">
                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">From</label>
                        <div className="relative group">
                            <input 
                                type="time" 
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
                            />
                            <div className="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                        </div>
                    </div>

                    <div className="h-8 border-r border-slate-700 mt-5 hidden sm:block"></div>

                    <div className="flex flex-col gap-1.5 flex-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Until</label>
                        <div className="relative group">
                            <input 
                                type="time" 
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none"
                            />
                            <div className="absolute inset-0 rounded-lg bg-blue-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 min-w-fit">
                    {(startTime || endTime) && (
                        <button 
                            onClick={handleClear}
                            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700"
                        >
                            Reset Window
                        </button>
                    )}
                    <div className="flex items-center px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-xs font-bold uppercase tracking-wide">
                        <span className="flex h-2 w-2 mr-2">
                            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        Active Stream
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventFilter;
