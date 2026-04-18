import React, { useState, useMemo, useEffect } from 'react';
import { useSurveillanceData } from '../hooks/useSurveillanceData';

const T_REF = '21:11';
const L_REF = 'Ankara Kalesi';

// Names to always exclude from suspect list (the missing person + staff)
const EXCLUDED_NAMES = ['podo', 'event staff', '-', ''];

const ScoringPage = () => {
    const { events, loading, error } = useSurveillanceData();
    const [manualOffsets, setManualOffsets] = useState(() => {
        const saved = localStorage.getItem('podo_manual_offsets');
        return saved ? JSON.parse(saved) : {};
    });
    const [sortConfig, setSortConfig] = useState({ key: 'finalScore', direction: 'desc' });

    useEffect(() => {
        localStorage.setItem('podo_manual_offsets', JSON.stringify(manualOffsets));
    }, [manualOffsets]);

    const getMinutes = (timeStr) => {
        if (!timeStr || !timeStr.includes(':')) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const tRefMin = getMinutes(T_REF);

    /**
     * Extract individual person names from a compound involvedParty string.
     * Handles formats like: "Alice & Bob", "Alice (Mentions: Bob, Charlie)"
     * Filters out Podo and other excluded names.
     */
    const extractPersonNames = (involvedParty) => {
        if (!involvedParty || involvedParty === '-') return [];

        let names = [];

        // Handle "Author (Mentions: Person1, Person2)" format from Notes
        const mentionMatch = involvedParty.match(/^(.+?)\s*\(Mentions:\s*(.+)\)$/);
        if (mentionMatch) {
            names.push(mentionMatch[1].trim());
            mentionMatch[2].split(',').forEach(n => names.push(n.trim()));
        }
        // Handle "Person1 & Person2" format from Sightings
        else if (involvedParty.includes(' & ')) {
            names = involvedParty.split(' & ').map(n => n.trim());
        }
        // Single name
        else {
            names.push(involvedParty.trim());
        }

        // Filter out excluded names (Podo, Event Staff, etc.)
        return names.filter(n => n && !EXCLUDED_NAMES.includes(n.toLowerCase()));
    };

    const scores = useMemo(() => {
        const suspectMap = {};

        // 1. Identify and calculate Automatic Scores
        events.forEach(event => {
            const personNames = extractPersonNames(event.involvedParty);
            if (personNames.length === 0) return;

            const eventTimePart = event.timestamp.split(' ')[1];
            const eventMin = getMinutes(eventTimePart);
            const diff = tRefMin - eventMin;

            personNames.forEach(personName => {
                // Use full name as key for accurate grouping
                const nameKey = personName.trim();

                if (!suspectMap[nameKey]) {
                    suspectMap[nameKey] = {
                        name: personName,
                        autoScore: 0,
                        manualOffset: manualOffsets[nameKey] || 0,
                        reasons: [],
                        lastSeenTime: null,
                        lastSeenLocation: null,
                        eventCount: 0,
                        criticalWindowCount: 0,
                        lastTimePoints: 0,
                        hasLocationBonus: false,
                        hasTipBonus: false
                    };
                }

                const person = suspectMap[nameKey];
                person.eventCount++;

                // Track last seen time (closest to disappearance, before it)
                if (diff >= 0 && (!person.lastSeenTime || eventMin > getMinutes(person.lastSeenTime))) {
                    person.lastSeenTime = eventTimePart;
                    person.lastSeenLocation = event.location;
                }

                // Time Proximity scoring (cumulative per tier, highest wins)
                let timePoints = 0;
                if (diff >= 0 && diff <= 30) {
                    person.criticalWindowCount++;
                    if (diff <= 1) timePoints = 5;
                    else if (diff <= 5) timePoints = 4;
                    else if (diff <= 15) timePoints = 2;
                    else if (diff <= 30) timePoints = 1;

                    if (timePoints > (person.lastTimePoints || 0)) {
                        person.autoScore += (timePoints - (person.lastTimePoints || 0));
                        person.lastTimePoints = timePoints;
                    }
                }

                // Location Proximity: within 10 min at the same location
                if (diff >= 0 && diff <= 10 && event.location === L_REF) {
                    if (!person.hasLocationBonus) {
                        person.autoScore += 3;
                        person.hasLocationBonus = true;
                        person.reasons.push(`Near ${L_REF} within 10min (+3)`);
                    }
                }

                // Intelligence: Mentioned in Anonymous Tip after disappearance
                if (event.type === 'Tip' && eventMin > tRefMin) {
                    if (!person.hasTipBonus) {
                        person.autoScore += 5;
                        person.hasTipBonus = true;
                        person.reasons.push(`Post-disappearance Tip (+5)`);
                    }
                }
            });
        });

        // 2. Add Frequency Bonus + finalize
        Object.values(suspectMap).forEach(p => {
            if (p.criticalWindowCount >= 3) {
                p.autoScore += 2;
                p.reasons.push(`High frequency in critical window (+2)`);
            }
            if (p.lastTimePoints) {
                p.reasons.push(`Time proximity bonus (+${p.lastTimePoints})`);
            }
            p.finalScore = p.autoScore + p.manualOffset;
        });

        return Object.values(suspectMap);
    }, [events, manualOffsets, tRefMin]);

    const handleAdjust = (name, amount) => {
        setManualOffsets(prev => ({
            ...prev,
            [name]: (prev[name] || 0) + amount
        }));
    };

    const handleReset = () => {
        setManualOffsets({});
        localStorage.removeItem('podo_manual_offsets');
    };

    const sortedScores = [...scores].sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const order = sortConfig.direction === 'asc' ? 1 : -1;

        if (typeof aVal === 'string') return aVal.localeCompare(bVal) * order;
        return ((aVal || 0) - (bVal || 0)) * order;
    });

    const getRiskLabel = (score) => {
        if (score >= 10) return { label: 'CRITICAL', color: 'bg-red-500/20 text-red-500 border-red-500/30' };
        if (score >= 7) return { label: 'HIGH', color: 'bg-orange-500/20 text-orange-500 border-orange-500/30' };
        if (score >= 4) return { label: 'MEDIUM', color: 'bg-amber-500/20 text-amber-500 border-amber-500/30' };
        return { label: 'LOW', color: 'bg-blue-500/20 text-blue-500 border-blue-500/30' };
    };

    if (loading) return <div className="p-8 text-center text-slate-400">Running Heuristics Analysis...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-1000">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-8 border-b border-slate-800">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Scoring <span className="text-blue-500">Center</span></h1>
                    <p className="text-slate-400 max-w-lg">Advanced algorithmic ranking of suspects based on temporal and geospatial proximity to the disappearance event (21:11 @ Ankara Kalesi).</p>
                </div>
                
                <button 
                    onClick={handleReset}
                    className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all font-bold text-xs uppercase tracking-widest"
                >
                    Reset Analytics
                </button>
            </header>

            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                            <th className="p-6">Identity</th>
                            <th className="p-6 cursor-pointer hover:text-white" onClick={() => setSortConfig({ key: 'autoScore', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>Auto Score</th>
                            <th className="p-6">Detective Adj.</th>
                            <th className="p-6 cursor-pointer hover:text-white" onClick={() => setSortConfig({ key: 'finalScore', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>Final Risk</th>
                            <th className="p-6">Risk Level</th>
                            <th className="p-6 cursor-pointer hover:text-white" onClick={() => setSortConfig({ key: 'lastSeenTime', direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'})}>Last Seen</th>
                            <th className="p-6">Analysis Findings</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {sortedScores.map((person) => {
                            const risk = getRiskLabel(person.finalScore);
                            return (
                                <tr key={person.name} className="hover:bg-slate-800/20 transition-colors group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg
                                                ${risk.label === 'CRITICAL' ? 'bg-red-500/20 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                                                {person.name[0]}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{person.name}</h3>
                                                <p className="text-[10px] text-slate-500 uppercase">{person.eventCount} Intercepts</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 font-mono font-bold text-slate-400">+{person.autoScore}</td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleAdjust(person.name, -1)}
                                                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-red-500/20 hover:text-red-500 transition-all font-bold"
                                            >-</button>
                                            <span className={`min-w-[2rem] text-center font-bold ${person.manualOffset > 0 ? 'text-blue-400' : person.manualOffset < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                                                {person.manualOffset > 0 ? `+${person.manualOffset}` : person.manualOffset}
                                            </span>
                                            <button 
                                                onClick={() => handleAdjust(person.name, 1)}
                                                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-blue-500/20 hover:text-blue-400 transition-all font-bold"
                                            >+</button>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col">
                                            <span className={`text-2xl font-black ${risk.label === 'CRITICAL' ? 'text-red-500' : 'text-white'}`}>
                                                {person.finalScore}
                                            </span>
                                            <div className="w-16 h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${risk.label === 'CRITICAL' ? 'bg-red-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${Math.min(100, (person.finalScore / 15) * 100)}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest border ${risk.color}`}>
                                            {risk.label}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {person.lastSeenTime ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="font-mono font-bold text-sm text-slate-200">{person.lastSeenTime}</span>
                                                <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{person.lastSeenLocation}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-xs">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-wrap gap-1">
                                            {person.reasons.map((reason, i) => (
                                                <span key={i} className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded border border-slate-700/50">
                                                    {reason}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScoringPage;
