import React, { useMemo } from 'react';
import { useSurveillanceData } from '../hooks/useSurveillanceData';

const TimelinePage = () => {
    const { events, loading, error } = useSurveillanceData();

    // Sort chronologically (oldest first for timeline flow)
    const chronologicalEvents = useMemo(() => {
        return [...events].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }, [events]);

    const lastEvent = events[0]; // Most recent since events is sorted DESC in hook

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-mono tracking-widest uppercase text-xs">Reconstructing Podo's Path...</p>
        </div>
    );

    if (error) return (
        <div className="p-8 bg-red-900/20 border border-red-500/50 rounded-2xl text-center">
            <p className="text-red-400">{error}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header / Last Known Location */}
            <header className="pb-8 border-b border-slate-800">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Timeline <span className="text-blue-500">Analysis</span></h1>
                    <p className="text-slate-400 max-w-lg">Reconstructing the chronological journey based on surveillance nodes, check-ins, and intercepts.</p>
                </div>
            </header>

            {/* Timeline Flow */}
            <div className="relative pt-10 pb-20">
                {/* Central Line */}
                <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-slate-800/20 transform md:-translate-x-1/2"></div>

                <div className="space-y-12">
                    {chronologicalEvents.map((event, index) => (
                        <div key={event.id} className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                            
                            {/* Connector Node */}
                            <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-slate-950 transform md:-translate-x-1/2 z-10 
                                ${event.type === 'Message' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' :
                                  event.type === 'Checkin' ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' :
                                  event.type === 'Sighting' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                                  'bg-slate-500 shadow-[0_0_10px_#64748b]'}">
                            </div>

                            {/* Content Card */}
                            <div className="ml-16 md:ml-0 md:w-[45%] group">
                                <div className={`p-6 bg-slate-900/40 backdrop-blur-sm border border-slate-800 rounded-3xl transition-all duration-500 group-hover:border-slate-600 group-hover:bg-slate-800/60 group-hover:translate-y--2
                                    ${index % 2 === 0 ? 'md:hover:translate-x-2' : 'md:hover:-translate-x-2'}`}>
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <span className="text-[10px] font-mono text-blue-400 font-bold bg-blue-400/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                                {event.timestamp.split(' ')[1]}
                                            </span>
                                            <h3 className="text-xl font-bold text-slate-100 mt-2">{event.location}</h3>
                                        </div>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                            ${event.type === 'Message' ? 'bg-purple-500/20 text-purple-400' :
                                              event.type === 'Checkin' ? 'bg-blue-500/20 text-blue-400' :
                                              event.type === 'Sighting' ? 'bg-emerald-500/20 text-emerald-400' :
                                              'bg-slate-500/20 text-slate-400'}`}>
                                            {event.type === 'Message' ? '💬' :
                                             event.type === 'Checkin' ? '🏡' :
                                             event.type === 'Sighting' ? '👀' : '📄'}
                                        </div>
                                    </div>

                                    <p className="text-slate-400 text-sm leading-relaxed italic mb-4">
                                        "{event.summary}"
                                    </p>

                                    {event.involvedParty !== '-' && (
                                        <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                {event.involvedParty[0]}
                                            </div>
                                            <span className="text-xs text-slate-400">
                                                Involved: <b className="text-slate-200">{event.involvedParty}</b>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Time Display (Desktop) */}
                            <div className="hidden md:block w-[45%] px-8">
                                <p className={`text-4xl font-black text-slate-800 transition-all duration-500 group-hover:text-slate-700 
                                    ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                    {event.timestamp.split(' ')[1]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Status */}
            <footer className="text-center py-10 relative">
                <div className="inline-block relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                    <p className="relative z-10 text-[10px] text-slate-500 uppercase tracking-widest font-black bg-slate-900 px-6 py-2 rounded-full border border-slate-800">
                        End of Chronological Data Stream
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default TimelinePage;
