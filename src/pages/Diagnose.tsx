import { useState } from 'react';
import { Brain, Upload, Loader, ArrowLeft, BarChart3, Image as ImageIcon } from 'lucide-react';

interface DiagnoseProps {
  onNavigate: (page: string) => void;
}

interface Detection {
  clasa: string;
  confidence: number;
  confidence_procent: string;
  bounding_box: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  };
}

interface YoloResponse {
  tumoare_detectata: boolean;
  numar_detecții: number;
  detecții: Detection[];
  [key: string]: any;
}

export function Diagnose({ onNavigate }: DiagnoseProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState('');
  const [yoloVersion, setYoloVersion] = useState<string>('v8');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [jsonResult, setJsonResult] = useState<YoloResponse | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setFileName(file.name);
        setProcessedImage(null);
        setJsonResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    setProcessedImage(null);
    setJsonResult(null);

    let imageSuccess = false;
    let jsonSuccess = false;

    // Call the image endpoint
    try {
      const formDataImage = new FormData();
      formDataImage.append('image', uploadedFile);

      const imageResponse = await fetch(`http://localhost:8000/api/detect-tumor/yolo/${yoloVersion}/image`, {
        method: 'POST',
        body: formDataImage,
      });

      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        const imageUrl = URL.createObjectURL(imageBlob);
        setProcessedImage(imageUrl);
        imageSuccess = true;
      } else {
        console.error('Image endpoint error:', await imageResponse.text());
        alert(`Eroare la obținerea imaginii: ${imageResponse.status} ${imageResponse.statusText}`);
      }
    } catch (error) {
      console.error('Error calling image endpoint:', error);
      alert('A apărut o eroare la obținerea imaginii procesate. Verificați dacă backend-ul rulează.');
    }

    // Call the JSON endpoint
    try {
      const formDataJson = new FormData();
      formDataJson.append('image', uploadedFile);

      const jsonResponse = await fetch(`http://localhost:8000/api/detect-tumor/yolo/${yoloVersion}/json`, {
        method: 'POST',
        body: formDataJson,
      });

      if (jsonResponse.ok) {
        const jsonData = await jsonResponse.json();
        setJsonResult(jsonData);
        jsonSuccess = true;
      } else {
        console.error('JSON endpoint error:', await jsonResponse.text());
        // Only show alert if image also failed
        if (!imageSuccess) {
          alert(`Eroare la obținerea rezultatului JSON: ${jsonResponse.status} ${jsonResponse.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error calling JSON endpoint:', error);
      // Only show alert if image also failed
      if (!imageSuccess) {
        alert('A apărut o eroare la obținerea rezultatului JSON. Verificați dacă backend-ul rulează.');
      }
    }

    setIsAnalyzing(false);

    // Show summary of what succeeded
    if (imageSuccess && !jsonSuccess) {
      console.log('Imaginea a fost procesată cu succes, dar rezultatul JSON nu a putut fi obținut.');
    } else if (!imageSuccess && !jsonSuccess) {
      alert('Ambele endpoint-uri au eșuat. Verificați dacă backend-ul rulează corect.');
    }
  };

  const handleReset = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setProcessedImage(null);
    setJsonResult(null);
    setFileName('');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-6">
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
            <h2 id="diagnosticare" className="text-3xl font-bold text-slate-900">Diagnosticarea Tumorilor Cerebrale</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-6">
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
                  {/* YOLO Version Dropdown */}
                  <div className="mb-4">
                    <label htmlFor="yolo-version" className="block text-sm font-medium text-slate-700 mb-2">
                      Selectați versiunea YOLO:
                    </label>
                    <select
                      id="yolo-version"
                      value={yoloVersion}
                      onChange={(e) => setYoloVersion(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                      disabled={isAnalyzing}
                    >
                      <option value="v8">YOLOv8</option>
                      <option value="v9">YOLOv9</option>
                      <option value="v12">YOLOv12</option>
                    </select>
                  </div>

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

            {/* Results Section */}
            <div>
              {isAnalyzing && (
                <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
                  <Loader className="w-12 h-12 text-blue-600 animate-spin" />
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">Se Analizează Imaginea</p>
                    <p className="text-slate-600 text-sm">Se procesează scanarea cu modelul {yoloVersion.toUpperCase()}...</p>
                  </div>
                </div>
              )}

              {!isAnalyzing && uploadedImage && !processedImage && !jsonResult && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-slate-600 text-center">Încărcare finalizată. Selectați versiunea YOLO și apăsați "Analizează Imaginea".</p>
                </div>
              )}

              {processedImage && (
                <div className="space-y-6">
                  {/* New Summary Block */}
                  {jsonResult && (
                    <div className={`rounded-xl border-l-4 p-6 shadow-sm ${jsonResult.tumoare_detectata
                      ? 'bg-red-50 border-red-500'
                      : 'bg-green-50 border-green-500'
                      }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`text-2xl font-bold mb-2 ${jsonResult.tumoare_detectata ? 'text-red-800' : 'text-green-800'
                            }`}>
                            {jsonResult.tumoare_detectata ? '⚠️ Tumoare Detectată' : '✅ Nu s-a detectat tumoare'}
                          </h3>
                          {jsonResult.tumoare_detectata && jsonResult.detecții && jsonResult.detecții.length > 0 && (
                            <div className="flex items-center gap-2 text-red-900">
                              <span className="font-medium">Acuratețe (Încredere):</span>
                              <span className="text-xl font-bold font-mono">
                                {jsonResult.detecții[0].confidence_procent}
                              </span>
                            </div>
                          )}
                          {!jsonResult.tumoare_detectata && (
                            <p className="text-green-800">
                              Analiza nu a identificat formațiuni tumorale în imaginea furnizată.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="w-6 h-6 text-blue-600" />
                      <h3 className="text-lg font-semibold text-slate-900">Imagine Procesată ({yoloVersion.toUpperCase()})</h3>
                    </div>
                    <img
                      src={processedImage}
                      alt="Rezultat procesare"
                      className="w-full rounded-lg border-2 border-slate-200"
                    />
                  </div>

                  {jsonResult && (
                    <div className="bg-slate-50 rounded-xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <BarChart3 className="w-6 h-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Rezultat JSON</h3>
                      </div>
                      <div className="bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(jsonResult, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}


                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}