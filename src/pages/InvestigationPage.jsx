import React from 'react';
import EventTable from '../components/eventTable';

const InvestigationPage = () => {
    return (
        <div className="space-y-6">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white tracking-tight">Investigation Center</h1>
                <p className="text-slate-400 mt-2">Classified operational data from active surveillance streams.</p>
            </header>
            
            <EventTable />
        </div>
    );
};

export default InvestigationPage;
