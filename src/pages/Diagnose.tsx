import { useState } from 'react';
import { Brain, Upload, AlertCircle, CheckCircle, Loader, ArrowLeft, BarChart3 } from 'lucide-react';

interface DiagnoseProps {
  onNavigate: (page: string) => void;
}

interface AnalysisResult {
  tumorDetected: boolean;
  confidence: number;
  severity: 'none' | 'low' | 'moderate' | 'high';
  location: string;
  size: string;
  recommendations: string[];
}

export function Diagnose({ onNavigate }: DiagnoseProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setFileName(file.name);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);

    setTimeout(() => {
      const mockResult: AnalysisResult = {
        // Simulare: 40% șanse de a detecta o tumoră
        tumorDetected: Math.random() > 0.6,
        // Nivelul de încredere (între 85% și 100%)
        confidence: Math.round((0.85 + Math.random() * 0.15) * 100),
        // Simulare severitate
        severity: ['none', 'low', 'moderate', 'high'][Math.floor(Math.random() * 4)] as any,
        // Simulare locație
        location: ['Lob Frontal', 'Lob Temporal', 'Lob Parietal', 'Lob Occipital', 'Cerebel'][Math.floor(Math.random() * 5)],
        // Simulare dimensiune
        size: `${(0.5 + Math.random() * 2.5).toFixed(1)} cm`,
        recommendations: [
          'Programați o scanare RMN de urmărire în 3 luni',
          'Consultați un specialist în neuro-oncologie',
          'Revizuiți simptomele clinice cu pacientul',
          'Luați în considerare imagistica CT suplimentară pentru confirmare'
        ]
      };

      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleReset = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setFileName('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Înapoi la Pagina Principală
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-blue-600" />
            <h2 id="diagnosticare" className="text font-bold text-slate-500">Diagnosticarea Tumorilor Cerebrale</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Încărcați imaginea MRI</h3>
                <div className="border-2 border-dashed border-blue-300 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-blue-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    {uploadedImage ? (
                      <>
                        <img src={uploadedImage} alt="Scanare încărcată" className="mx-auto mb-3 max-h-64 rounded-lg" />
                        <p className="text-sm text-slate-600 mt-2">{fileName}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <p className="text-slate-900 font-medium mb-1">Trageți imaginea MRI aici</p>
                        <p className="text-slate-600 text-sm">sau faceți clic pentru a naviga</p>
                        <p className="text-slate-500 text-xs mt-2">Formate suportate: PNG, JPG</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {uploadedImage && (
                <div className="space-y-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Se analizează...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" />
                        Analizează Imaginea
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Șterge
                  </button>
                </div>
              )}
            </div>

            {analysisResult && (
              <div className="space-y-6">
                <div className={`rounded-xl p-6 ${analysisResult.tumorDetected ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                  <div className="flex items-start gap-3">
                    {analysisResult.tumorDetected ? (
                      <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                    ) : (
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    )}
                    <div>
                      <h3 className={`text-lg font-bold ${analysisResult.tumorDetected ? 'text-red-900' : 'text-green-900'}`}>
                        {analysisResult.tumorDetected ? 'Tip tumoră' : 'Nicio Tumoră Detectată'}
                      </h3>
{/*                       <p className={`text-sm mt-1 ${analysisResult.tumorDetected ? 'text-red-700' : 'text-green-700'}`}>
                        Nivel de Încredere: <span className="font-bold">{analysisResult.confidence}%</span>
                      </p> */}
                     <p className={`text-sm mt-1 text-red-700`}>
                        Acuratețe: <span className="font-bold">---%</span>
                      </p>
                    </div>
                  </div>
                </div>


                <div className="bg-slate-50 rounded-xl p-6">    
                  <ul className="space-y-2">
                      <li className="flex gap-3 text-sm text-slate-700">
                        <span className="text-blue-600 font-bold mt-0.5">{1}.</span>
                        <span>{'Rezultat Votare pe bază de probabilități '}</span>
                      </li>
                    
                  </ul>
                </div>

               <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-900 leading-relaxed">
                     <li>    
                       <span className="font-semibold">CNN:</span> EfficientNet-B7, ResNet101.   
                      </li>  
                     <li>    
                        <span className="font-semibold">Transformer:</span> ViT-B/16. 
                      </li>
                      <li>
                        <span className="font-semibold">Yolo:</span> YOLOv8 , YOLOv9, YOLOv12.
                      </li>    
                  </p>
                </div>

               <div className="bg-slate-50 rounded-xl p-6">    
                  <ul className="space-y-2">
                      <li className="flex gap-3 text-sm text-slate-700">
                        <span className="text-blue-600 font-bold mt-0.5">{2}.</span>
                        <span>{'Rezultat Votare pe bază de etichete prezise '}</span>
                      </li>
                    
                  </ul>
                </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-900 leading-relaxed">
                     <li>    
                       <span className="font-semibold">CNN:</span> EfficientNet-B7, ResNet101.   
                      </li>  
                     <li>    
                        <span className="font-semibold">Transformer:</span> ViT-B/16. 
                      </li>
                      <li>
                        <span className="font-semibold">Yolo:</span> YOLOv8 , YOLOv9, YOLOv12.
                      </li>    
                  </p>
                </div>

              </div>




            )}

            {!analysisResult && uploadedImage && !isAnalyzing && (
              <div className="flex items-center justify-center">
                <p className="text-slate-600 text-center">Încărcare finalizată. Apăsați "Analizează Imaginea" pentru a începe diagnosticul.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Se Analizează Imaginea</p>
                  <p className="text-slate-600 text-sm">Se procesează scanarea cu modelul AI...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}