import React, { useMemo } from 'react';
import { useSurveillanceData } from '../hooks/useSurveillanceData';

const T_REF = '21:11';

const TimelinePage = () => {
    const { events, loading, error } = useSurveillanceData();

    // Sort chronologically (oldest first for timeline flow)
    const chronologicalEvents = useMemo(() => {
        return [...events].sort((a, b) => {
            const aTime = a.timestamp.split(' ')[1] || '00:00';
            const bTime = b.timestamp.split(' ')[1] || '00:00';
            return aTime.localeCompare(bTime);
        });
    }, [events]);

    // Find where to insert the disappearance marker
    const disappearanceIndex = useMemo(() => {
        for (let i = 0; i < chronologicalEvents.length; i++) {
            const eventTime = chronologicalEvents[i].timestamp.split(' ')[1] || '00:00';
            if (eventTime >= T_REF) return i;
        }
        return chronologicalEvents.length; // After all events
    }, [chronologicalEvents]);

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

    // Build timeline items: events + disappearance marker
    const timelineItems = [];
    chronologicalEvents.forEach((event, i) => {
        if (i === disappearanceIndex) {
            timelineItems.push({ _isMarker: true, id: '_disappearance' });
        }
        timelineItems.push(event);
    });
    // If disappearance is after all events, append
    if (disappearanceIndex >= chronologicalEvents.length) {
        timelineItems.push({ _isMarker: true, id: '_disappearance' });
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header */}
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
                    {timelineItems.map((item, index) => {
                        // --- DISAPPEARANCE MARKER ---
                        if (item._isMarker) {
                            return (
                                <div key="disappearance-marker" className="relative flex items-center justify-center">
                                    {/* Red pulse node */}
                                    <div className="absolute left-8 md:left-1/2 transform md:-translate-x-1/2 z-20">
                                        <div className="relative">
                                            <div className="absolute inset-0 w-6 h-6 rounded-full bg-red-500 animate-ping opacity-40"></div>
                                            <div className="w-6 h-6 rounded-full bg-red-600 border-4 border-slate-950 shadow-[0_0_20px_rgba(239,68,68,0.6)]"></div>
                                        </div>
                                    </div>
                                    {/* Marker Card */}
                                    <div className="ml-16 md:ml-0 md:w-[90%] max-w-xl mx-auto">
                                        <div className="bg-red-950/40 border-2 border-red-500/40 rounded-2xl p-6 text-center backdrop-blur-sm shadow-[0_0_40px_rgba(239,68,68,0.15)]">
                                            <div className="flex items-center justify-center gap-3 mb-2">
                                                <span className="text-red-500 text-2xl">⚠️</span>
                                                <span className="font-mono text-lg font-black text-red-400 tracking-widest">{T_REF}</span>
                                                <span className="text-red-500 text-2xl">⚠️</span>
                                            </div>
                                            <h3 className="text-xl font-black text-red-400 uppercase tracking-wider mb-1">Disappearance Event</h3>
                                            <p className="text-red-400/60 text-sm">Podo was last confirmed at this point. All subsequent data is post-disappearance.</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // --- REGULAR EVENT ---
                        const eventTime = item.timestamp.split(' ')[1] || '00:00';
                        const isPostDisappearance = eventTime >= T_REF;

                        return (
                            <div key={item.id} className={`relative flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                {/* Connector Node */}
                                <div className={`absolute left-8 md:left-1/2 w-4 h-4 rounded-full border-4 border-slate-950 transform md:-translate-x-1/2 z-10
                                    ${isPostDisappearance ? 'bg-red-400/70 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                      item.type === 'Message' ? 'bg-purple-500 shadow-[0_0_10px_#a855f7]' :
                                      item.type === 'Checkin' ? 'bg-blue-500 shadow-[0_0_10px_#3b82f6]' :
                                      item.type === 'Sighting' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                                      'bg-slate-500 shadow-[0_0_10px_#64748b]'}`}>
                                </div>

                                {/* Content Card */}
                                <div className="ml-16 md:ml-0 md:w-[45%] group">
                                    <div className={`p-6 backdrop-blur-sm border rounded-3xl transition-all duration-500 group-hover:translate-y--2
                                        ${isPostDisappearance 
                                            ? 'bg-red-950/20 border-red-500/20 group-hover:border-red-500/40 group-hover:bg-red-950/30' 
                                            : 'bg-slate-900/40 border-slate-800 group-hover:border-slate-600 group-hover:bg-slate-800/60'}
                                        ${index % 2 === 0 ? 'md:hover:translate-x-2' : 'md:hover:-translate-x-2'}`}>

                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                                                    isPostDisappearance ? 'text-red-400 bg-red-400/10' : 'text-blue-400 bg-blue-400/10'
                                                }`}>
                                                    {eventTime}
                                                </span>
                                                <h3 className="text-xl font-bold text-slate-100 mt-2">{item.location}</h3>
                                            </div>
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm
                                                ${item.type === 'Message' ? 'bg-purple-500/20 text-purple-400' :
                                                  item.type === 'Checkin' ? 'bg-blue-500/20 text-blue-400' :
                                                  item.type === 'Sighting' ? 'bg-emerald-500/20 text-emerald-400' :
                                                  'bg-slate-500/20 text-slate-400'}`}>
                                                {item.type === 'Message' ? '💬' :
                                                 item.type === 'Checkin' ? '🏡' :
                                                 item.type === 'Sighting' ? '👀' : '📄'}
                                            </div>
                                        </div>

                                        <p className="text-slate-400 text-sm leading-relaxed italic mb-4">
                                            "{item.summary}"
                                        </p>

                                        {item.involvedParty !== '-' && (
                                            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/50">
                                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                                                    {item.involvedParty[0]}
                                                </div>
                                                <span className="text-xs text-slate-400">
                                                    Involved: <b className="text-slate-200">{item.involvedParty}</b>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Time Display (Desktop) */}
                                <div className="hidden md:block w-[45%] px-8">
                                    <p className={`text-4xl font-black transition-all duration-500 group-hover:text-slate-700
                                        ${isPostDisappearance ? 'text-red-900/60' : 'text-slate-800'}
                                        ${index % 2 === 0 ? 'text-left' : 'text-right'}`}>
                                        {eventTime}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
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
