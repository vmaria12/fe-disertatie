import { useState, useRef, useEffect } from 'react';
import { Brain, Upload, AlertCircle, CheckCircle, Loader, ArrowLeft, BarChart3 } from 'lucide-react';

interface DiagnoseProps {
  onNavigate: (page: string) => void;
}

interface Detection {
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  class: string;
}

interface AnalysisResult {
  tumorDetected: boolean;
  confidence: number;
  detections: Detection[];
  imageWidth: number;
  imageHeight: number;
  severity: 'none' | 'low' | 'moderate' | 'high';
  recommendations: string[];
}

export function Diagnose({ onNavigate }: DiagnoseProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setFileName(file.name);
        setAnalysisResult(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (analysisResult && canvasRef.current && uploadedImage) {
      drawDetections();
    }
  }, [analysisResult, uploadedImage]);

  const drawDetections = () => {
    const canvas = canvasRef.current;
    if (!canvas || !uploadedImage) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      if (analysisResult?.detections && analysisResult.detections.length > 0) {
        analysisResult.detections.forEach((detection) => {
          const scaleX = img.width / analysisResult.imageWidth;
          const scaleY = img.height / analysisResult.imageHeight;

          const x = detection.x * scaleX;
          const y = detection.y * scaleY;
          const width = detection.width * scaleX;
          const height = detection.height * scaleY;

          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, width, height);

          const confidence = Math.round(detection.confidence * 100);
          const label = `${detection.class} ${confidence}%`;

          ctx.fillStyle = '#ef4444';
          const textWidth = ctx.measureText(label).width;
          ctx.fillRect(x, y - 25, textWidth + 8, 25);

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px Arial';
          ctx.fillText(label, x + 4, y - 8);
        });
      }
    };
    img.src = uploadedImage;
  };

  const handleAnalyze = async () => {
    if (!uploadedImage) return;

    setIsAnalyzing(true);
    setError('');

    try {
      const canvas = document.createElement('canvas');
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Failed to process image');
          setIsAnalyzing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setError('Failed to convert image');
            setIsAnalyzing(false);
            return;
          }

          const formData = new FormData();
          formData.append('image', blob, fileName);

          try {
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            const response = await fetch(
              `${supabaseUrl}/functions/v1/yolo-tumor-detection`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseAnonKey}`,
                },
                body: formData,
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              setError(errorData.error || 'Analysis failed');
              setIsAnalyzing(false);
              return;
            }

            const data = await response.json();

            const severity = data.confidence > 90 ? 'high' : data.confidence > 70 ? 'moderate' : data.confidence > 50 ? 'low' : 'none';

            const result: AnalysisResult = {
              tumorDetected: data.tumorDetected || data.detections.length > 0,
              confidence: Math.round(data.confidence),
              detections: data.detections || [],
              imageWidth: data.imageWidth,
              imageHeight: data.imageHeight,
              severity,
              recommendations: [
                'Schedule follow-up MRI scan in 3 months',
                'Consult with neuro-oncology specialist',
                'Review clinical symptoms with patient',
                'Consider additional CT imaging for confirmation'
              ]
            };

            setAnalysisResult(result);
            setIsAnalyzing(false);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Analysis failed');
            setIsAnalyzing(false);
          }
        }, 'image/png');
      };

      img.src = uploadedImage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setFileName('');
    setError('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-5xl mx-auto px-6">
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

              {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">Error: {error}</p>
                  <p className="text-xs text-red-600 mt-2">Note: YOLO detection service needs to be configured. Make sure your Python backend is running.</p>
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

                {analysisResult.tumorDetected && analysisResult.detections.length > 0 && (
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

                    <div>
                      <p className="text-sm text-slate-600 mb-2">Detected Regions:</p>
                      <div className="space-y-2">
                        {analysisResult.detections.map((det, idx) => (
                          <div key={idx} className="bg-white p-3 rounded border border-slate-200">
                            <div className="flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-900">{det.class}</span>
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">{Math.round(det.confidence * 100)}%</span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1">Size: {Math.round(det.width)}x{Math.round(det.height)} px</p>
                          </div>
                        ))}
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

            {!analysisResult && uploadedImage && !isAnalyzing && !error && (
              <div className="flex items-center justify-center">
                <p className="text-slate-600 text-center">Upload complete. Click "Analyze Image" to start the diagnosis.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center gap-4 text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                <div>
                  <p className="font-semibold text-slate-900 mb-1">Analyzing Image</p>
                  <p className="text-slate-600 text-sm">Processing scan with YOLO model...</p>
                </div>
              </div>
            )}
          </div>

          {analysisResult && (
            <div className="mt-8 bg-slate-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Annotated Image</h3>
              <div className="bg-white rounded-lg p-4 overflow-auto max-h-96">
                <canvas
                  ref={canvasRef}
                  className="mx-auto rounded border border-slate-200"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
