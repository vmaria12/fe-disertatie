import { useState } from 'react';
import { Upload, Loader, ArrowLeft, BarChart3, Image as ImageIcon, Activity } from 'lucide-react';

interface ClassifyCnnVitProps {
    onNavigate: (page: string) => void;
}

interface ClassificationResponse {
    tumor_type: string;
    accuracy: string;
    model: string;
}

export function ClassifyCnnVit({ onNavigate }: ClassifyCnnVitProps) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [modelType, setModelType] = useState<string>('efficientnet_b7');
    const [classificationResult, setClassificationResult] = useState<ClassificationResponse | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string);
                setFileName(file.name);
                setClassificationResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setIsAnalyzing(true);
        setClassificationResult(null);

        try {
            const formData = new FormData();
            formData.append('image', uploadedFile);

            const response = await fetch(`http://localhost:8000/api/detect-tumor/neuronal-network/${modelType}`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setClassificationResult(data);
            } else {
                console.error('API error:', await response.text());
                alert(`Eroare la analiză: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error calling API:', error);
            alert('A apărut o eroare la analiză. Verificați dacă backend-ul rulează.');
        }

        setIsAnalyzing(false);
    };

    const handleReset = () => {
        setUploadedImage(null);
        setUploadedFile(null);
        setClassificationResult(null);
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
                        <Activity className="w-8 h-8 text-indigo-600" />
                        <h2 className="text-3xl font-bold text-slate-900">Clasificare CNN & ViT</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-4">Încărcați imaginea MRI</h3>
                                <div className="border-2 border-dashed border-indigo-300 rounded-xl p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-indigo-50">
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
                                                <Upload className="w-12 h-12 text-indigo-600 mx-auto mb-3" />
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
                                    <div className="mb-4">
                                        <label htmlFor="model-type" className="block text-sm font-medium text-slate-700 mb-2">
                                            Selectați modelul:
                                        </label>
                                        <select
                                            id="model-type"
                                            value={modelType}
                                            onChange={(e) => setModelType(e.target.value)}
                                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900"
                                            disabled={isAnalyzing}
                                        >
                                            <option value="efficientnet_b7">EfficientNet-B7</option>
                                            <option value="resnet101">ResNet101</option>
                                            <option value="vit_b16">Vision Transformer (ViT-B/16)</option>
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isAnalyzing}
                                        className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Se analizează...
                                            </>
                                        ) : (
                                            <>
                                                <BarChart3 className="w-5 h-5" />
                                                Clasifică Imaginea
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
                                    <Loader className="w-12 h-12 text-indigo-600 animate-spin" />
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Se Analizează Imaginea</p>
                                        <p className="text-slate-600 text-sm">Se procesează cu modelul {modelType}...</p>
                                    </div>
                                </div>
                            )}

                            {!isAnalyzing && uploadedImage && !classificationResult && (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-600 text-center">Încărcare finalizată. Selectați modelul și apăsați "Clasifică Imaginea".</p>
                                </div>
                            )}

                            {classificationResult && (
                                <div className="space-y-6">
                                    <div className={`rounded-xl border-l-4 p-6 mt-12 shadow-sm ${classificationResult.tumor_type !== 'notumor'
                                        ? 'bg-red-50 border-red-500'
                                        : 'bg-green-50 border-green-500'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className={`text-2xl font-bold mb-2 ${classificationResult.tumor_type !== 'notumor' ? 'text-red-800' : 'text-green-800'
                                                    }`}>
                                                    {classificationResult.tumor_type !== 'notumor'
                                                        ? `⚠️ Tumoare Detectată: ${classificationResult.tumor_type}`
                                                        : '✅ Nu s-a detectat tumoare'}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="font-medium text-slate-700">Acuratețe:</span>
                                                    <span className="text-xl font-bold font-mono text-slate-900">
                                                        {classificationResult.accuracy}
                                                    </span>
                                                </div>
                                                <div className="text-sm text-slate-500 mt-1">
                                                    Model: {classificationResult.model}
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
