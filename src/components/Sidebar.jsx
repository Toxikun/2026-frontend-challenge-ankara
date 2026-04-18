import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
    const navItems = [
        { name: 'Investigation Log', path: '/', icon: '📋' },
        { name: 'Podo Timeline', path: '/timeline', icon: '🕒' },
        { name: 'Scoring Center', path: '/scoring', icon: '🎯' }
    ];

    return (
        <aside className="fixed left-6 top-6 bottom-6 w-64 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl z-50 flex flex-col">
            <div className="flex items-center gap-3 px-4 mb-10">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <span className="text-xl"></span>
                </div>
                <div>
                    <h2 className="text-white font-bold leading-tight">PODO</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Investigation Unit</p>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group
                            ${isActive
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 border border-transparent'}
                        `}
                    >
                        <span className="text-lg opacity-70 group-hover:opacity-100 transition-opacity">
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>

                        {/* Status Indicator for active item */}
                        {({ isActive }) => isActive && (
                            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-800/50">
                <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Live Feed Active</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                        Surveillance nodes connected. AI heuristics analysis in progress.
                    </p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
