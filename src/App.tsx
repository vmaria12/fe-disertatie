import { useState } from 'react';
import { Brain } from 'lucide-react';
import { Home } from './pages/Home';
import { Diagnose } from './pages/Diagnose';

type Page = 'home' | 'diagnose';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-100px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-slate-900">NeuroDetect</span>
          </button>
          <div className="flex gap-6">
            <button
              onClick={() => handleNavigate('home')}
              className={`transition-colors ${currentPage === 'home' ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavigate('diagnose')}
              className={`transition-colors ${currentPage === 'diagnose' ? 'text-slate-900 font-medium' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Diagnosticare
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'diagnose' && <Diagnose onNavigate={handleNavigate} />}

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold">NeuroDetect</span>
            </div>
            <p className="text-sm"> Maria VASILACHE | Proiect Disertație-Inginerie Software</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
