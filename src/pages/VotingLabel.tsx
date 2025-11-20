import { useState } from 'react';
import { Brain, Upload, ArrowLeft, BarChart3, AlertTriangle, Loader2, Activity, RotateCcw, Target, FileText, Copy, X, FileJson } from 'lucide-react';

interface VotingResponse {
    individual_results: {
        [key: string]: Array<{
            clasa: string;
            confidence: number;
            confidence_procent: string;
        }> | { error: string };
    };
    voting_result: {
        winning_class: string;
        vote_count: number;
        all_counts: { [key: string]: number };
        probability_sums: { [key: string]: number };
    };
    best_detection?: {
        clasa: string;
        confidence: number;
        confidence_procent: string;
        model: string;
        bounding_box: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
        };
    };
}

interface VotingLabelProps {
    onNavigate: (page: string) => void;
}

export function VotingLabel({ onNavigate }: VotingLabelProps) {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [votingResult, setVotingResult] = useState<VotingResponse | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
    const [jsonVotingResult, setJsonVotingResult] = useState<any | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                setVotingResult(null);
                setProcessedImageUrl(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!uploadedFile) return;

        setIsAnalyzing(true);
        setVotingResult(null);
        setProcessedImageUrl(null);
        setJsonVotingResult(null);

        try {
            const formData = new FormData();
            formData.append('image', uploadedFile);

            // 1. Call Complex Endpoint (Image + Header)
            const responseComplex = await fetch('http://localhost:8000/api/detect-tumor/yolo/voting-complex/label', {
                method: 'POST',
                body: formData,
            });

            if (!responseComplex.ok) throw new Error('Analysis failed');

            const blob = await responseComplex.blob();
            const imageUrl = URL.createObjectURL(blob);
            setProcessedImageUrl(imageUrl);

            const headerData = responseComplex.headers.get('X-Voting-Data');
            if (headerData) {
                const jsonStr = atob(headerData);
                const data: VotingResponse = JSON.parse(jsonStr);
                setVotingResult(data);
            }

            // 2. Call Label Endpoint (JSON) - Auto fetch
            const responseJson = await fetch('http://localhost:8000/api/detect-tumor/yolo/voting-label', {
                method: 'POST',
                body: formData,
            });

            if (responseJson.ok) {
                const jsonData = await responseJson.json();
                setJsonVotingResult(jsonData);
            }

        } catch (error) {
            console.error('Error analyzing image:', error);
            alert('A apărut o eroare la analiză. Vă rugăm încercați din nou.');
        } finally {
            setIsAnalyzing(false);
        }
    };



    const handleReset = () => {
        setUploadedImage(null);
        setUploadedFile(null);
        setFileName('');
        setVotingResult(null);
        setProcessedImageUrl(null);
        setJsonVotingResult(null);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 text-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                            <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Detecție Automată cu Yolo (Votare - Bazată pe Etichete)
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Modele YOLO v8, v9 și v12
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 border border-gray-300 transition-all text-gray-700 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Înapoi la meniu
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload & Image */}
                    <div className="space-y-6">
                        <div className="bg-white/80 rounded-2xl p-8 border border-gray-300/50 backdrop-blur-sm shadow-xl">
                            {!uploadedImage ? (
                                <div className="border-2 border-dashed border-gray-400 rounded-xl p-12 text-center hover:border-blue-500/50 transition-colors bg-gray-50 group cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-blue-100 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                            <Upload className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Încarcă imaginea MRI</h3>
                                            <p className="text-gray-600 text-sm">Click sau trage imaginea aici</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-300 group">
                                        {/* Display Processed Image if available, otherwise Original */}
                                        <img
                                            src={processedImageUrl || uploadedImage}
                                            alt="MRI Scan"
                                            className="w-full h-auto object-cover"
                                        />

                                        {/* Overlay for original image */}
                                        {!processedImageUrl && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-gray-800/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                <p className="text-white font-medium">{fileName}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing}
                                            className={`flex-1 py-4 rounded-xl font-semibold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${isAnalyzing
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white'
                                                }`}
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Se analizează (v8, v9, v12)...
                                                </>
                                            ) : (
                                                <>
                                                    <Activity className="w-5 h-5" />
                                                    Analiză Automată ( Votare - Suma etichetelor )
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            disabled={isAnalyzing}
                                            className="px-6 py-4 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all border border-gray-300 hover:border-gray-400 shadow-lg"
                                        >
                                            <RotateCcw className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Results */}
                    <div className="space-y-6">
                        {votingResult && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                                {/* Main Result Block */}
                                <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-xl ${votingResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                    ? 'bg-emerald-100/80 border-emerald-300'
                                    : 'bg-red-100/80 border-red-300'
                                    }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-1">
                                                Rezultat Final
                                            </h2>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-3xl font-bold ${votingResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                                    ? 'text-emerald-600'
                                                    : 'text-red-600'
                                                    }`}>
                                                    {votingResult.voting_result.winning_class}
                                                </span>
                                                {votingResult.voting_result.winning_class !== 'Nu s-a detectat tumoare' && (
                                                    <div className="px-3 py-1 rounded-full bg-red-100 border border-red-300 text-red-700 text-sm font-medium flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Detectat
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600 mb-1">Suma Voturilor</div>
                                            <div className="text-2xl font-mono font-bold text-gray-900">
                                                {votingResult.voting_result.vote_count} / 3
                                            </div>
                                        </div>
                                    </div>

                                    {/* Best Detection Info */}
                                    {votingResult.best_detection && (
                                        <div className="mt-4 pt-4 border-t border-gray-300">
                                            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-blue-400" />
                                                Modelul cu probabilitatea maximă pentru box
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                    <span className="text-gray-600 block text-xs">Model</span>
                                                    <span className="text-blue-600 font-mono font-bold">YOLO {votingResult.best_detection.model}</span>
                                                </div>
                                                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                    <span className="text-gray-600 block text-xs">Probabilitate</span>
                                                    <span className="text-green-600 font-mono font-bold">{votingResult.best_detection.confidence_procent}</span>
                                                </div>
                                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 col-span-2">
                                                    <span className="text-gray-600 block text-xs">Poziție (Box)</span>
                                                    <span className="text-gray-700 font-mono text-xs">
                                                        x1:{votingResult.best_detection.bounding_box.x1},
                                                        y1:{votingResult.best_detection.bounding_box.y1},
                                                        x2:{votingResult.best_detection.bounding_box.x2},
                                                        y2:{votingResult.best_detection.bounding_box.y2}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Total Scores Grid */}
                                <div className="bg-white/80 rounded-2xl p-6 border border-gray-300/50">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                        Scoruri Totale ( Votare - Suma etichetelor )
                                    </h3>
                                    <div className="space-y-3">
                                        {Object.entries(votingResult.voting_result.all_counts).map(([className, score]) => {
                                            const breakdown = Object.entries(votingResult.individual_results)
                                                .map(([model, results]) => {
                                                    if (Array.isArray(results)) {
                                                        const det = results.find(d => d.clasa === className);
                                                        if (det) return { model };
                                                    } else if (className === 'Nu s-a detectat tumoare' && Array.isArray(results) && results.length === 0) {
                                                        return { model };
                                                    }
                                                    return null;
                                                })
                                                .filter(item => item !== null) as { model: string }[];

                                            return (
                                                <div key={className} className="flex flex-col gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-gray-700">{className}</span>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-purple-500 rounded-full"
                                                                    style={{ width: `${(score / 3) * 100}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-mono font-bold text-purple-600 w-12 text-right">
                                                                {score}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-gray-600 flex justify-end gap-2 border-t border-gray-200 pt-2 mt-1">
                                                        <span className="text-gray-500 mr-auto">Voturi:</span>
                                                        {breakdown.map((item, idx) => (
                                                            <span key={idx}>
                                                                {idx > 0 && " + "}
                                                                <span className="text-gray-600">{item.model}</span>
                                                            </span>
                                                        ))}
                                                        <span>= {score}</span>
                                                        <span className="ml-2 text-blue-600 font-medium">
                                                            (Sum Prob: {votingResult.voting_result.probability_sums?.[className]?.toFixed(2) || '0.00'})
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Individual Results */}
                                <div className="bg-white/80 rounded-2xl p-6 border border-gray-300/50">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Rezultate Individuale
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {Object.entries(votingResult.individual_results).map(([version, results]) => (
                                            <div key={version} className="p-4 bg-gray-50 rounded-xl border border-gray-300">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                                                        YOLO {version}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        {Array.isArray(results) ? `${results.length} detecții` : 'Eroare'}
                                                    </span>
                                                </div>

                                                {Array.isArray(results) ? (
                                                    results.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {results.map((det, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm p-2 bg-white rounded border border-gray-200">
                                                                    <span className="text-gray-700">{det.clasa}</span>
                                                                    <span className="font-mono text-green-600">{det.confidence_procent}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-500 italic">Nicio tumoare detectată</div>
                                                    )
                                                ) : (
                                                    <div className="text-sm text-red-600">{results.error}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* JSON Result Display */}
                                <div className="pt-4 border-t border-gray-300">
                                    {jsonVotingResult && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden shadow-2xl mt-4">
                                            <div className="flex items-center justify-between px-4 py-2 bg-gray-200 border-b border-gray-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-2 border-l border-gray-400 ml-2">
                                                        <FileJson className="w-3.5 h-3.5 text-blue-600" />
                                                        <span className="text-xs font-medium text-gray-700">Votare - Suma etichetelor - Rezultat JSON</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(JSON.stringify(jsonVotingResult, null, 2));
                                                        }}
                                                        className="p-1.5 hover:bg-gray-300 rounded-md text-gray-600 hover:text-blue-600 transition-colors"
                                                        title="Copy JSON"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setJsonVotingResult(null)}
                                                        className="p-1.5 hover:bg-gray-300 rounded-md text-gray-600 hover:text-red-600 transition-colors"
                                                        title="Close"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="p-4 overflow-x-auto max-h-96 custom-scrollbar">
                                                <pre
                                                    className="text-xs font-mono leading-relaxed"
                                                    dangerouslySetInnerHTML={{
                                                        __html: JSON.stringify(jsonVotingResult, null, 2).replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
                                                            let cls = 'text-amber-400';
                                                            if (/^"/.test(match)) {
                                                                if (/:$/.test(match)) {
                                                                    cls = 'text-sky-400';
                                                                } else {
                                                                    cls = 'text-emerald-400';
                                                                }
                                                            } else if (/true|false/.test(match)) {
                                                                cls = 'text-purple-400';
                                                            } else if (/null/.test(match)) {
                                                                cls = 'text-slate-500';
                                                            }
                                                            return `<span class="${cls}">${match}</span>`;
                                                        })
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
