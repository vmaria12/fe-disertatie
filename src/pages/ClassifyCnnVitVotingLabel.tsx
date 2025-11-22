import { useState } from 'react';
import { Upload, Loader, ArrowLeft, Activity, Vote, CheckCircle2, AlertTriangle, Scale } from 'lucide-react';

interface ClassifyCnnVitVotingLabelProps {
    onNavigate: (page: string) => void;
}

interface IndividualResult {
    predicted_class: string;
    confidence: string;
    all_probabilities: {
        [key: string]: string;
    };
}

interface VotingResult {
    winning_class: string;
    vote_counts: {
        [key: string]: number;
    };
    prob_sums: {
        [key: string]: string;
    };
    tie_break_used: boolean;
}

interface VotingResponse {
    individual_results: {
        [modelName: string]: IndividualResult;
    };
    voting_result: VotingResult;
}

export function ClassifyCnnVitVotingLabel({ onNavigate }: ClassifyCnnVitVotingLabelProps) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [result, setResult] = useState<VotingResponse | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImage(e.target?.result as string);
                setFileName(file.name);
                setResult(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setIsAnalyzing(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('image', uploadedFile);

            const response = await fetch('http://localhost:8000/api/detect-tumor/neuronal-network/voting-label', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setResult(data);
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
        setResult(null);
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
                        <Vote className="w-8 h-8 text-purple-600" />
                        <h2 className="text-3xl font-bold text-slate-900">Votare - Suma Etichetelor (CNN & ViT)</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column: Upload */}
                        <div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-4">Încărcați imaginea MRI</h3>
                                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50">
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
                                                <Upload className="w-12 h-12 text-purple-600 mx-auto mb-3" />
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
                                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader className="w-5 h-5 animate-spin" />
                                                Se analizează...
                                            </>
                                        ) : (
                                            <>
                                                <Activity className="w-5 h-5" />
                                                Analizează cu Voting Label
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

                        {/* Right Column: Results */}
                        <div>
                            {isAnalyzing && (
                                <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
                                    <Loader className="w-12 h-12 text-purple-600 animate-spin" />
                                    <div>
                                        <p className="font-semibold text-slate-900 mb-1">Se Analizează Imaginea</p>
                                        <p className="text-slate-600 text-sm">Se rulează EfficientNet, ResNet101 și ViT...</p>
                                    </div>
                                </div>
                            )}

                            {!isAnalyzing && uploadedImage && !result && (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-slate-600 text-center">Încărcare finalizată. Apăsați "Analizează" pentru a vedea rezultatele.</p>
                                </div>
                            )}

                            {result && (
                                <div className="space-y-6">
                                    {/* Main Voting Result */}
                                    <div className={`rounded-xl border-l-4 p-6 mt-4 shadow-sm ${result.voting_result.winning_class !== 'notumor'
                                        ? 'bg-red-50 border-red-500'
                                        : 'bg-green-50 border-green-500'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className={`text-l font-bold mb-2 ${result.voting_result.winning_class !== 'notumor' ? 'text-red-800' : 'text-green-800'
                                                    }`}>
                                                    {result.voting_result.winning_class !== 'notumor'
                                                        ? `⚠️ Rezultat Final: ${result.voting_result.winning_class}`
                                                        : '✅ Rezultat Final: Nu s-a detectat tumoare'}
                                                </h3>
                                                <div className="flex flex-col gap-1 mt-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium text-slate-700">Nr. voturi:</span>
                                                        <span className="text-xl font-bold font-mono text-slate-900">
                                                            {result.voting_result.vote_counts[result.voting_result.winning_class]}
                                                        </span>
                                                    </div>
                                                    {result.voting_result.tie_break_used && (
                                                        <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                                                            <Scale className="w-4 h-4" />
                                                            <span>Departajare prin suma probabilităților</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {result.voting_result.winning_class !== 'notumor' ? (
                                                <AlertTriangle className="w-12 h-12 text-red-500 opacity-80" />
                                            ) : (
                                                <CheckCircle2 className="w-12 h-12 text-green-500 opacity-80" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Vote Counts Breakdown */}
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                        <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                            <Vote className="w-5 h-5 text-purple-600" />
                                            Număr Voturi (Etichete)
                                        </h4>
                                        <div className="space-y-3">
                                            {Object.entries(result.voting_result.vote_counts).map(([className, count]) => (
                                                <div key={className} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${className === result.voting_result.winning_class ? 'bg-purple-50 border border-purple-200' : 'bg-slate-50'
                                                    }`}>
                                                    <span className={`font-medium capitalize ${className === result.voting_result.winning_class ? 'text-purple-900' : 'text-slate-700'}`}>
                                                        {className}
                                                    </span>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-xs text-slate-500">
                                                            (Prob. Sum: {result.voting_result.prob_sums[className]})
                                                        </span>
                                                        <span className={`font-mono font-bold text-lg ${className === result.voting_result.winning_class ? 'text-purple-700' : 'text-slate-600'}`}>
                                                            {count}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Individual Model Results */}
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                                        <h4 className="text-md font-semibold text-slate-700 mb-4">Rezultate Individuale (Modele)</h4>
                                        <div className="grid gap-4">
                                            {Object.entries(result.individual_results).map(([modelName, modelResult]) => (
                                                <div key={modelName} className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
                                                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100">
                                                        <span className="font-semibold text-slate-800 capitalize">{modelName}</span>
                                                        <span className={`text-sm font-medium px-2 py-1 rounded ${modelResult.predicted_class !== 'notumor' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {modelResult.predicted_class}
                                                        </span>
                                                    </div>

                                                    <div className="space-y-1">
                                                        {Object.entries(modelResult.all_probabilities).map(([cls, prob]) => (
                                                            <div key={cls} className="flex justify-between text-xs">
                                                                <span className={`capitalize ${cls === modelResult.predicted_class ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
                                                                    {cls}
                                                                </span>
                                                                <span className={`font-mono ${cls === modelResult.predicted_class ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                                                                    {prob}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
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
