import React from 'react';

const ScoringPage = () => {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Analytical Scoring Center</h1>
                <p className="text-slate-400 mt-2">Suspect risk assessment and classification workspace.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    { label: 'Suspect Identification', status: 'Pending Data', icon: '🔍' },
                    { label: 'Network Analysis', status: 'Offline', icon: '🕸️' },
                    { label: 'Risk Calculation', status: 'Under Development', icon: '📊' }
                ].map((card, i) => (
                    <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm group hover:border-blue-500/30 transition-all duration-300">
                        <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                        <h3 className="text-lg font-semibold text-slate-200">{card.label}</h3>
                        <div className="mt-2 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">{card.status}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 p-12 text-center bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl">
                <div className="inline-block p-4 bg-blue-500/5 rounded-2xl mb-4 border border-blue-500/10">
                    <svg className="w-12 h-12 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                </div>
                <h2 className="text-xl font-medium text-slate-300">Classification Algorithm Initializing</h2>
                <p className="text-slate-500 max-w-md mx-auto mt-2">
                    Our AI models are currently processing the surveillance logs to identify high-interest targets. This module will allow you to rank suspects based on behavioral patterns.
                </p>
            </div>
        </div>
    );
};

export default ScoringPage;
