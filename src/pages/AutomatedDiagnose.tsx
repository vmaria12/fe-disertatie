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
        total_score: number;
        all_scores: { [key: string]: number };
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

interface AutomatedDiagnoseProps {
    onNavigate: (page: string) => void;
}

export function AutomatedDiagnose({ onNavigate }: AutomatedDiagnoseProps) {
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
            const responseComplex = await fetch('http://localhost:8000/api/detect-tumor/yolo/voting-complex/likelihood', {
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

            // 2. Call Likelihood Endpoint (JSON) - Auto fetch
            const responseJson = await fetch('http://localhost:8000/api/detect-tumor/yolo/voting-likelihood', {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                            <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Detecție Automată cu Yolo (Votare -Suma Probabilităților)
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Modele YOLO v8, v9 și v12
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('home')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all text-slate-300 hover:text-white"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Înapoi la meniu
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Upload & Image */}
                    <div className="space-y-6">
                        <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700/50 backdrop-blur-sm shadow-xl">
                            {!uploadedImage ? (
                                <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500/50 transition-colors bg-slate-900/50 group cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="p-4 bg-slate-800 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                            <Upload className="w-8 h-8 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-1">Încarcă imaginea MRI</h3>
                                            <p className="text-slate-400 text-sm">Click sau trage imaginea aici</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-slate-700/50 group">
                                        {/* Display Processed Image if available, otherwise Original */}
                                        <img
                                            src={processedImageUrl || uploadedImage}
                                            alt="MRI Scan"
                                            className="w-full h-auto object-cover"
                                        />

                                        {/* Overlay for original image */}
                                        {!processedImageUrl && (
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                                <p className="text-white font-medium">{fileName}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing}
                                            className={`flex-1 py-4 rounded-xl font-semibold shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 ${isAnalyzing
                                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
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
                                                    Analiză Automată ( Votare - Suma probabilităților )
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleReset}
                                            disabled={isAnalyzing}
                                            className="px-6 py-4 rounded-xl font-semibold bg-slate-700 hover:bg-slate-600 text-white transition-all border border-slate-600 hover:border-slate-500 shadow-lg"
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
                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                    : 'bg-red-500/10 border-red-500/20'
                                    }`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h2 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-1">
                                                Rezultat Final
                                            </h2>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-3xl font-bold ${votingResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                                    ? 'text-emerald-400'
                                                    : 'text-red-400'
                                                    }`}>
                                                    {votingResult.voting_result.winning_class}
                                                </span>
                                                {votingResult.voting_result.winning_class !== 'Nu s-a detectat tumoare' && (
                                                    <div className="px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-medium flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Detectat
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-400 mb-1">Suma Probabilităților</div>
                                            <div className="text-2xl font-mono font-bold text-white">
                                                {(() => {
                                                    if (votingResult.voting_result.winning_class === 'Nu s-a detectat tumoare') {
                                                        const noTumorModels = Object.entries(votingResult.individual_results)
                                                            .filter(([_, results]) => Array.isArray(results) && results.length === 0)
                                                            .map(([model]) => model);
                                                        const score = noTumorModels.length * 100;
                                                        return `${score}%`;
                                                    }
                                                    return `${(votingResult.voting_result.total_score * 100).toFixed(2)}%`;
                                                })()}

                                            </div>
                                        </div>
                                    </div>

                                    {/* Best Detection Info */}
                                    {votingResult.best_detection && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <h3 className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                                                <Target className="w-4 h-4 text-blue-400" />
                                                Modelul cu probabilitatea maximă pentru box
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                                    <span className="text-slate-400 block text-xs">Model</span>
                                                    <span className="text-blue-300 font-mono font-bold">YOLO {votingResult.best_detection.model}</span>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5">
                                                    <span className="text-slate-400 block text-xs">Probabilitate</span>
                                                    <span className="text-green-300 font-mono font-bold">{votingResult.best_detection.confidence_procent}</span>
                                                </div>
                                                <div className="bg-slate-900/50 p-3 rounded-lg border border-white/5 col-span-2">
                                                    <span className="text-slate-400 block text-xs">Poziție (Box)</span>
                                                    <span className="text-slate-300 font-mono text-xs">
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
                                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-purple-400" />
                                        Scoruri Totale ( Votare - Suma probabilităților )
                                    </h3>
                                    <div className="space-y-3">
                                        {votingResult.voting_result.winning_class === 'Nu s-a detectat tumoare' && (() => {
                                            const noTumorModels = Object.entries(votingResult.individual_results)
                                                .filter(([_, results]) => Array.isArray(results) && results.length === 0)
                                                .map(([model]) => model);
                                            const score = noTumorModels.length * 100;

                                            return (
                                                <div className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-lg border border-green-500/30">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-green-300">Nu s-a detectat tumoare</span>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-green-500 rounded-full"
                                                                    style={{ width: '100%' }}
                                                                />
                                                            </div>
                                                            <span className="font-mono font-bold text-green-300 w-12 text-right">
                                                                {score}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex justify-end gap-2 border-t border-slate-700/30 pt-2 mt-1">
                                                        <span className="text-slate-600 mr-auto">Calcul:</span>
                                                        {noTumorModels.map((model, idx) => (
                                                            <span key={model}>
                                                                {idx > 0 && " + "}
                                                                <span className="text-slate-400">{model}</span>(1.00)
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                        {Object.entries(votingResult.voting_result.all_scores).map(([className, score]) => {
                                            const breakdown = Object.entries(votingResult.individual_results)
                                                .map(([model, results]) => {
                                                    if (Array.isArray(results)) {
                                                        const det = results.find(d => d.clasa === className);
                                                        if (det) return { model, conf: det.confidence };
                                                    }
                                                    return null;
                                                })
                                                .filter(item => item !== null) as { model: string, conf: number }[];

                                            return (
                                                <div key={className} className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-slate-300">{className}</span>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className="h-full bg-purple-500 rounded-full"
                                                                    style={{ width: `${score === 0 ? 100 : Math.min((score / 3) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="font-mono font-bold text-purple-300 w-12 text-right">
                                                                {score.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-xs text-slate-500 flex justify-end gap-2 border-t border-slate-700/30 pt-2 mt-1">
                                                        <span className="text-slate-600 mr-auto">Calcul:</span>
                                                        {breakdown.map((item, idx) => (
                                                            <span key={idx}>
                                                                {idx > 0 && " + "}
                                                                <span className="text-slate-400">{item.model}</span>({item.conf.toFixed(2)})
                                                            </span>
                                                        ))}
                                                        <span>= {score.toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Individual Results */}
                                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Rezultate Individuale
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {Object.entries(votingResult.individual_results).map(([version, results]) => (
                                            <div key={version} className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-sm font-bold text-blue-400 uppercase tracking-wider">
                                                        YOLO {version}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {Array.isArray(results) ? `${results.length} detecții` : 'Eroare'}
                                                    </span>
                                                </div>

                                                {Array.isArray(results) ? (
                                                    results.length > 0 ? (
                                                        <div className="space-y-2">
                                                            {results.map((det, idx) => (
                                                                <div key={idx} className="flex justify-between text-sm p-2 bg-slate-800/50 rounded border border-slate-700/30">
                                                                    <span className="text-slate-300">{det.clasa}</span>
                                                                    <span className="font-mono text-green-400">{det.confidence_procent}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-slate-500 italic">Nicio tumoare detectată</div>
                                                    )
                                                ) : (
                                                    <div className="text-sm text-red-400">{results.error}</div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* JSON Result Display */}
                                <div className="pt-4 border-t border-slate-700/50">
                                    {jsonVotingResult && (
                                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#0f172a] rounded-xl border border-slate-800 overflow-hidden shadow-2xl mt-4">
                                            <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                                    </div>
                                                    <div className="flex items-center gap-2 pl-2 border-l border-slate-800 ml-2">
                                                        <FileJson className="w-3.5 h-3.5 text-amber-400" />
                                                        <span className="text-xs font-medium text-slate-300">Votare - Suma probabilităților - Rezultat JSON</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(JSON.stringify(jsonVotingResult, null, 2));
                                                        }}
                                                        className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-blue-400 transition-colors"
                                                        title="Copy JSON"
                                                    >
                                                        <Copy className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => setJsonVotingResult(null)}
                                                        className="p-1.5 hover:bg-slate-800 rounded-md text-slate-500 hover:text-red-400 transition-colors"
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
