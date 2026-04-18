import React, { useMemo } from 'react';
import EventTable from '../components/eventTable';
import { useSurveillanceData } from '../hooks/useSurveillanceData';

const InvestigationPage = () => {
    const { events, loading } = useSurveillanceData();

    // Compute Podo's last known locations (most recent event per unique location)
    const lastKnownLocations = useMemo(() => {
        if (!events.length) return [];

        const locationMap = {};
        // events are already sorted DESC by timestamp from hook
        events.forEach(event => {
            if (event.location === 'Unknown') return;
            if (!locationMap[event.location]) {
                locationMap[event.location] = {
                    location: event.location,
                    time: event.timestamp.split(' ')[1] || event.timestamp,
                    type: event.type,
                    involvedParty: event.involvedParty
                };
            }
        });

        return Object.values(locationMap)
            .sort((a, b) => b.time.localeCompare(a.time))
            .slice(0, 5); // Top 5 most recent locations
    }, [events]);

    const typeColors = {
        Checkin: 'border-blue-500/30 bg-blue-500/5',
        Message: 'border-purple-500/30 bg-purple-500/5',
        Sighting: 'border-emerald-500/30 bg-emerald-500/5',
        Note: 'border-slate-500/30 bg-slate-500/5',
        Tip: 'border-amber-500/30 bg-amber-500/5'
    };

    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Investigation Center</h1>
                <p className="text-slate-400 mt-2">Classified operational data from active surveillance streams.</p>
            </header>

            {/* Last Known Locations Panel */}
            {!loading && lastKnownLocations.length > 0 && (
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-5 mb-2 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-amber-500">📍</span>
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Podo's Last Known Locations</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {lastKnownLocations.map((loc, i) => (
                            <div key={loc.location} className={`rounded-xl border p-4 transition-all hover:scale-[1.02] ${typeColors[loc.type] || 'border-slate-700 bg-slate-800/50'}`}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">{loc.time}</span>
                                    {i === 0 && (
                                        <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse uppercase">Latest</span>
                                    )}
                                </div>
                                <h4 className="text-sm font-bold text-white truncate">{loc.location}</h4>
                                <div className="flex items-center justify-between mt-2">
                                    <span className={`text-[10px] font-bold uppercase ${
                                        loc.type === 'Checkin' ? 'text-blue-400' : 
                                        loc.type === 'Message' ? 'text-purple-400' : 
                                        loc.type === 'Sighting' ? 'text-emerald-400' : 'text-slate-400'
                                    }`}>{loc.type}</span>
                                    {loc.involvedParty !== '-' && (
                                        <span className="text-[10px] text-slate-500 truncate max-w-[100px]">w/ {loc.involvedParty}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <EventTable />
        </div>
    );
};

export default InvestigationPage;
