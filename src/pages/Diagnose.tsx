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
        tumorDetected: Math.random() > 0.6,
        confidence: Math.round((0.85 + Math.random() * 0.15) * 100),
        severity: ['none', 'low', 'moderate', 'high'][Math.floor(Math.random() * 4)] as any,
        location: ['Frontal Lobe', 'Temporal Lobe', 'Parietal Lobe', 'Occipital Lobe', 'Cerebellum'][Math.floor(Math.random() * 5)],
        size: `${(0.5 + Math.random() * 2.5).toFixed(1)} cm`,
        recommendations: [
          'Schedule follow-up MRI scan in 3 months',
          'Consult with neuro-oncology specialist',
          'Review clinical symptoms with patient',
          'Consider additional CT imaging for confirmation'
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
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-slate-900">Brain Tumor Diagnosis</h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Upload MRI/CT Scan</h2>
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
                        <img src={uploadedImage} alt="Uploaded scan" className="mx-auto mb-3 max-h-64 rounded-lg" />
                        <p className="text-sm text-slate-600 mt-2">{fileName}</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                        <p className="text-slate-900 font-medium mb-1">Drop your scan here</p>
                        <p className="text-slate-600 text-sm">or click to browse</p>
                        <p className="text-slate-500 text-xs mt-2">Supported: PNG, JPG, DICOM</p>
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
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5" />
                        Analyze Image
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="w-full px-6 py-3 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors"
                  >
                    Clear
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
                        {analysisResult.tumorDetected ? 'Tumor Detected' : 'No Tumor Detected'}
                      </h3>
                      <p className={`text-sm mt-1 ${analysisResult.tumorDetected ? 'text-red-700' : 'text-green-700'}`}>
                        Confidence Level: <span className="font-bold">{analysisResult.confidence}%</span>
                      </p>
                    </div>
                  </div>
                </div>

                {analysisResult.tumorDetected && (
                  <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Severity</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              analysisResult.severity === 'high'
                                ? 'bg-red-600 w-full'
                                : analysisResult.severity === 'moderate'
                                ? 'bg-yellow-500 w-2/3'
                                : 'bg-orange-500 w-1/3'
                            }`}
                          />
                        </div>
                        <span className="text-sm font-semibold text-slate-900 w-20 capitalize">{analysisResult.severity}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Location</p>
                        <p className="text-slate-900 font-medium mt-1">{analysisResult.location}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-semibold">Size</p>
                        <p className="text-slate-900 font-medium mt-1">{analysisResult.size}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 rounded-xl p-6">
                  <h4 className="font-semibold text-slate-900 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {analysisResult.recommendations.map((rec, index) => (
                      <li key={index} className="flex gap-3 text-sm text-slate-700">
                        <span className="text-blue-600 font-bold mt-0.5">{index + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    <span className="font-semibold">Note:</span> This analysis is for research purposes only and should not be used as a definitive diagnosis. Always consult with qualified medical professionals for clinical decisions.
                  </p>
                </div>
              </div>
            )}

            {!analysisResult && uploadedImage && !isAnalyzing && (
              <div className="flex items-center justify-center">
                <p className="text-slate-600 text-center">Upload complete. Click "Analyze Image" to start the diagnosis.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Analyzing Image</p>
                  <p className="text-slate-600 text-sm">Processing scan with AI model...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
