import React from 'react';

const RawDataModal = ({ isOpen, onClose, data, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                    <h3 className="text-blue-400 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        Raw Transmission Data: {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-auto bg-slate-950 font-mono text-xs text-emerald-400 custom-scrollbar">
                    <pre className="whitespace-pre-wrap leading-relaxed">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-700 bg-slate-800 text-right">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm transition-all border border-slate-600 font-medium"
                    >
                        Close Terminal
                    </button>
                </div>
            </div>
            
            {/* Click outside to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};

export default RawDataModal;
