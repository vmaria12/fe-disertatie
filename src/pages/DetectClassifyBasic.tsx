import { useState, useEffect } from 'react';
import {
    Brain, Upload, ArrowLeft, AlertTriangle, Loader2,
    RotateCcw, CheckCircle2, Vote, Scale, Check, ChevronRight
} from 'lucide-react';

// --- Interfaces for Step 2 (Yolo) ---
interface VotingResponseYolo {
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

// --- Interfaces for Step 3 (CNN/ViT) ---
interface IndividualResultCnn {
    predicted_class: string;
    confidence: string;
    all_probabilities: {
        [key: string]: string;
    };
}

interface VotingResultCnn {
    winning_class: string;
    vote_counts: {
        [key: string]: number;
    };
    prob_sums: {
        [key: string]: string;
    };
    tie_break_used: boolean;
}

interface VotingResponseCnn {
    individual_results: {
        [modelName: string]: IndividualResultCnn;
    };
    voting_result: VotingResultCnn;
}

interface DetectClassifyWizardProps {
    onNavigate: (page: string) => void;
}

export function DetectClassifyBasic({ onNavigate }: DetectClassifyWizardProps) {
    // Global State
    const [step, setStep] = useState(1);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [fileName, setFileName] = useState('');
    const [executionTime, setExecutionTime] = useState<number | null>(null);

    // Step 2 State (Yolo)
    const [isAnalyzingYolo, setIsAnalyzingYolo] = useState(false);
    const [yoloResult, setYoloResult] = useState<VotingResponseYolo | null>(null);
    const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

    // Step 3 State (CNN/ViT)
    const [isAnalyzingCnn, setIsAnalyzingCnn] = useState(false);
    const [cnnResult, setCnnResult] = useState<VotingResponseCnn | null>(null);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileName(file.name);
            setUploadedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedImage(reader.result as string);
                // Reset subsequent steps
                setYoloResult(null);
                setProcessedImageUrl(null);
                setCnnResult(null);
                setExecutionTime(null);
                setStep(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const runYoloAnalysis = async () => {
        if (!uploadedFile) return;

        setIsAnalyzingYolo(true);
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
                const data: VotingResponseYolo = JSON.parse(jsonStr);
                setYoloResult(data);
            }

        } catch (error) {
            console.error('Error analyzing image (Yolo):', error);
            alert('A apărut o eroare la analiza Yolo.');
        } finally {
            setIsAnalyzingYolo(false);
        }
    };

    const runCnnAnalysis = async () => {
        if (!uploadedFile) return;

        setIsAnalyzingCnn(true);
        try {
            const formData = new FormData();
            formData.append('image', uploadedFile);

            const response = await fetch('http://localhost:8000/api/detect-tumor/neuronal-network/voting-label', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setCnnResult(data);
            } else {
                console.error('API error:', await response.text());
                alert(`Eroare la analiză CNN: ${response.status}`);
            }
        } catch (error) {
            console.error('Error calling API (CNN):', error);
            alert('A apărut o eroare la analiza CNN.');
        } finally {
            setIsAnalyzingCnn(false);
        }
    };

    // Auto-run analysis pipeline
    useEffect(() => {
        const runPipeline = async () => {
            if (uploadedFile && !yoloResult && !cnnResult && !isAnalyzingYolo && !isAnalyzingCnn) {
                const startTime = performance.now();

                setStep(2);
                await runYoloAnalysis();

                setStep(3);
                await runCnnAnalysis();

                const endTime = performance.now();
                setExecutionTime(endTime - startTime);
            }
        };

        runPipeline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uploadedFile]);

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-12">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-300 ${step === s
                        ? 'bg-blue-600 text-white shadow-lg scale-110'
                        : step > s
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                        {step > s ? <Check className="w-6 h-6" /> : s}
                    </div>
                    {s < 3 && (
                        <div className={`w-24 h-1 mx-2 rounded transition-all duration-300 ${step > s ? 'bg-green-500' : 'bg-slate-200'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 text-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                            <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                Detecție & Clasificare Completă
                            </h1>

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

                {executionTime !== null && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-center animate-in fade-in slide-in-from-top-4">
                        <p className="text-lg font-semibold text-blue-900">
                            Timp total de execuție: <span className="font-mono text-2xl">{executionTime.toFixed(2)} ms</span>
                        </p>
                    </div>
                )}

                {renderStepIndicator()}

                {/* Step 1: Upload */}
                {step === 1 && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white/80 rounded-2xl p-8 border border-gray-300/50 backdrop-blur-sm shadow-xl text-center">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Pasul 1: Încărcare Imagine</h2>

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
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-300 group max-h-96 mx-auto inline-block">
                                        <img
                                            src={uploadedImage}
                                            alt="MRI Scan"
                                            className="max-h-96 w-auto object-cover"
                                        />
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium mt-2">{fileName}</p>
                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => setUploadedImage(null)}
                                            className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all"
                                        >
                                            Schimbă Imaginea
                                        </button>
                                        {yoloResult && (
                                            <button
                                                onClick={() => setStep(2)}
                                                className="px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg flex items-center gap-2"
                                            >
                                                Next <ChevronRight className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Yolo Results (Shown briefly or if stuck) */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Pasul 2: Detecție Yolo</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Înapoi
                                </button>
                                {cnnResult && (
                                    <button
                                        onClick={() => setStep(3)}
                                        className="px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2 shadow-lg"
                                    >
                                        Next <ChevronRight className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Image */}
                            <div className="space-y-6">
                                <div className="bg-white/80 rounded-2xl p-8 border border-gray-300/50 backdrop-blur-sm shadow-xl text-center">
                                    {isAnalyzingYolo ? (
                                        <div className="flex flex-col items-center justify-center h-96">
                                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                                            <p className="text-lg font-medium text-slate-700">Se analizează cu Yolo v8, v9, v12...</p>
                                        </div>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-300 inline-block max-h-96">
                                            <img
                                                src={processedImageUrl || uploadedImage || ''}
                                                alt="MRI Scan Processed"
                                                className="max-h-96 w-auto object-cover"
                                            />
                                        </div>
                                    )}
                                    <p className="text-sm text-slate-600 font-medium mt-2">{fileName}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: CNN/ViT Results */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Pasul 3: Clasificare CNN & ViT</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" /> Înapoi
                                </button>
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setUploadedImage(null);
                                        setUploadedFile(null);
                                        setYoloResult(null);
                                        setCnnResult(null);
                                        setExecutionTime(null);
                                    }}
                                    className="px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <RotateCcw className="w-5 h-5" /> Incarca alta Imagine
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Image (Original) */}
                            <div className="space-y-6">
                                <div className="bg-white/80 rounded-2xl p-8 border border-gray-300/50 backdrop-blur-sm shadow-xl text-center">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 text-left">
                                        {processedImageUrl ? 'Imagine Procesată (Yolo)' : 'Imagine Originală'}
                                    </h3>
                                    <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-300 inline-block max-h-96">
                                        <img
                                            src={processedImageUrl || uploadedImage || ''}
                                            alt="MRI Scan"
                                            className="max-h-96 w-auto object-cover"
                                        />
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium mt-2">{fileName}</p>
                                </div>
                            </div>

                            {/* Right: Results */}
                            <div className="space-y-6">
                                {isAnalyzingCnn && (
                                    <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-slate-200">
                                        <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                                        <p className="text-lg font-medium text-slate-700">Se rulează EfficientNet, ResNet101 și ViT...</p>
                                    </div>
                                )}

                                {cnnResult && (
                                    <div className="space-y-6">
                                        {/* Main Voting Result */}
                                        <div className={`rounded-xl border-l-4 p-6 shadow-sm ${cnnResult.voting_result.winning_class !== 'notumor'
                                            ? 'bg-red-50 border-red-500'
                                            : 'bg-green-50 border-green-500'
                                            }`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className={`text-l font-bold mb-2 ${cnnResult.voting_result.winning_class !== 'notumor' ? 'text-red-800' : 'text-green-800'
                                                        }`}>
                                                        {cnnResult.voting_result.winning_class !== 'notumor'
                                                            ? `⚠️ Rezultat Final: ${cnnResult.voting_result.winning_class}`
                                                            : '✅ Rezultat Final: Nu s-a detectat tumoare'}
                                                    </h3>
                                                    <div className="flex flex-col gap-1 mt-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-medium text-slate-700">Nr. voturi:</span>
                                                            <span className="text-xl font-bold font-mono text-slate-900">
                                                                {cnnResult.voting_result.vote_counts[cnnResult.voting_result.winning_class]}
                                                            </span>
                                                        </div>
                                                        {cnnResult.voting_result.tie_break_used && (
                                                            <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                                                                <Scale className="w-4 h-4" />
                                                                <span>Departajare prin suma probabilităților</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {cnnResult.voting_result.winning_class !== 'notumor' ? (
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
                                                {Object.entries(cnnResult.voting_result.vote_counts).map(([className, count]) => (
                                                    <div key={className} className={`flex items-center justify-between p-3 rounded-lg transition-colors ${className === cnnResult.voting_result.winning_class ? 'bg-purple-50 border border-purple-200' : 'bg-slate-50'
                                                        }`}>
                                                        <span className={`font-medium capitalize ${className === cnnResult.voting_result.winning_class ? 'text-purple-900' : 'text-slate-700'}`}>
                                                            {className}
                                                        </span>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs text-slate-500">
                                                                (Prob. Sum: {cnnResult.voting_result.prob_sums[className]})
                                                            </span>
                                                            <span className={`font-mono font-bold text-lg ${className === cnnResult.voting_result.winning_class ? 'text-purple-700' : 'text-slate-600'}`}>
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
                                                {Object.entries(cnnResult.individual_results).map(([modelName, modelResult]) => (
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
                )}
            </div>
        </div>
    );
}