import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import InvestigationPage from './pages/InvestigationPage';
import ScoringPage from './pages/ScoringPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30">
        <Sidebar />
        
        {/* Main Content Area */}
        <main className="pl-[296px] pr-8 pt-8 pb-8 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <Routes>
              <Route path="/" element={<InvestigationPage />} />
              <Route path="/scoring" element={<ScoringPage />} />
            </Routes>
          </div>
        </main>

        {/* Dynamic Scanline/Glass effect overlay */}
        <div className="fixed inset-0 pointer-events-none border-[20px] border-slate-950/20 z-[100] ring-1 ring-inset ring-white/5"></div>
      </div>
    </Router>
  );
}

export default App;