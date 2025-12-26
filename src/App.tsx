import { useState } from 'react';
import { Brain } from 'lucide-react';
import { Home } from './pages/Home';
import { Diagnose } from './pages/Diagnose';
import { AutomatedDiagnose } from './pages/AutomatedDiagnose';
import { VotingLabel } from './pages/VotingLabel';
import { ClassifyCnnVit } from './pages/ClassifyCnnVit';
import { ClassifyCnnVitVotingLikelyhood } from './pages/ClassifyCnnVitVotingLikelyhood';
import { ClassifyCnnVitVotingLabel } from './pages/ClassifyCnnVitVotingLabel';
import { DetectClassifyWizard } from './pages/DetectClassifyWizard';
import { DetectClassifyBasic } from './pages/DetectClassifyBasic';
import OriginalImageClassificationResults from './pages/OriginalImageClassificationResults';
import CroppedImageClassificationResults from './pages/CroppedImageClassificationResults';
import SamImageClassificationResults from './pages/SamImageClassificationResults';

import { AutoAnnotate } from './pages/AutoAnnotate';

type Page = 'home' | 'diagnose' | 'automated-diagnose' | 'voting-label' | 'classify-cnn-vit' | 'classify-voting-prob' | 'classify-voting-label' | 'detect-classify' | 'detect-classify-basic' | 'original-image-classification-results' | 'cropped-image-classification-results' | 'sam-image-classification-results' | 'auto-annotate';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => handleNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-slate-900">NeuroDetect</span>
          </button>

          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md border-2 border-white ring-2 ring-blue-50">
              MV
            </div>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && <Home onNavigate={handleNavigate} />}
      {currentPage === 'diagnose' && <Diagnose onNavigate={handleNavigate} />}
      {currentPage === 'automated-diagnose' && <AutomatedDiagnose onNavigate={handleNavigate} />}
      {currentPage === 'voting-label' && <VotingLabel onNavigate={handleNavigate} />}
      {currentPage === 'classify-cnn-vit' && <ClassifyCnnVit onNavigate={handleNavigate} />}
      {currentPage === 'classify-voting-prob' && <ClassifyCnnVitVotingLikelyhood onNavigate={handleNavigate} />}
      {currentPage === 'classify-voting-label' && <ClassifyCnnVitVotingLabel onNavigate={handleNavigate} />}
      {currentPage === 'detect-classify' && <DetectClassifyWizard onNavigate={handleNavigate} />}
      {currentPage === 'detect-classify-basic' && <DetectClassifyBasic onNavigate={handleNavigate} />}
      {currentPage === 'original-image-classification-results' && <OriginalImageClassificationResults />}
      {currentPage === 'cropped-image-classification-results' && <CroppedImageClassificationResults />}
      {currentPage === 'sam-image-classification-results' && <SamImageClassificationResults />}
      {currentPage === 'auto-annotate' && <AutoAnnotate onNavigate={handleNavigate} />}

      {/* Footer-ul aplicației */}
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