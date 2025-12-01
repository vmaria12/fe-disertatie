import { useState, useEffect } from 'react';
import {
    Brain, Upload, ArrowLeft, AlertTriangle, Loader2,
    RotateCcw, Target, FileText,
    CheckCircle2, Vote, Scale, ChevronRight, Check
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
    const [jsonYoloResult, setJsonYoloResult] = useState<any | null>(null);
    const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null);

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
                setJsonYoloResult(null);
                setCnnResult(null);
                setCroppedImageUrl(null);
                setExecutionTime(null);
                setStep(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const runYoloAnalysis = async (): Promise<VotingResponseYolo | null> => {
        if (!uploadedFile || yoloResult) return null;

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
                return data;
            }

            // 2. Call Label Endpoint (JSON) - Auto fetch for JSON view
            const responseJson = await fetch('http://localhost:8000/api/detect-tumor/yolo/voting-label', {
                method: 'POST',
                body: formData,
            });

            if (responseJson.ok) {
                const jsonData = await responseJson.json();
                setJsonYoloResult(jsonData);
            }

        } catch (error) {
            console.error('Error analyzing image (Yolo):', error);
            alert('A apărut o eroare la analiza Yolo.');
            return null;
        } finally {
            setIsAnalyzingYolo(false);
        }
        return null;
    };

    const cropImage = (imageFile: File, bbox: { x1: number; y1: number; x2: number; y2: number }): Promise<Blob> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');

                // Calculate dimensions of the original box
                const boxWidth = bbox.x2 - bbox.x1;
                const boxHeight = bbox.y2 - bbox.y1;

                // Use exact coordinates from YOLO
                const x1 = bbox.x1;
                const y1 = bbox.y1;
                const x2 = bbox.x2;
                const y2 = bbox.y2;

                const width = x2 - x1;
                const height = y2 - y1;

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }
                ctx.drawImage(
                    img,
                    x1, y1, width, height,
                    0, 0, width, height
                );
                canvas.toBlob((blob) => {
                    if (blob) resolve(blob);
                    else reject(new Error('Canvas to Blob failed'));
                }, imageFile.type);
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(imageFile);
        });
    };

    const runCnnAnalysis = async (yoloData?: VotingResponseYolo | null) => {
        if (!uploadedFile) return;

        setIsAnalyzingCnn(true);
        try {
            const formData = new FormData();
            // Always use the original image for analysis, as requested
            formData.append('image', uploadedFile);

            const sourceYoloResult = yoloData || yoloResult;

            // Check if we have a bounding box from YOLO to crop (FOR DISPLAY ONLY)
            if (sourceYoloResult?.best_detection?.bounding_box) {
                try {
                    const croppedBlob = await cropImage(uploadedFile, sourceYoloResult.best_detection.bounding_box);

                    // Create URL for display
                    const croppedUrl = URL.createObjectURL(croppedBlob);
                    setCroppedImageUrl(croppedUrl);

                    console.log('Generated cropped image for display only');
                } catch (cropError) {
                    console.error('Error cropping image for display:', cropError);
                }
            }

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
                const yoloData = await runYoloAnalysis();

                setStep(3);
                await runCnnAnalysis(yoloData);

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
                                Detecție & Clasificare Completă - imagine decupată
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

                {/* Step 2: Yolo Results */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Pasul 2: Detecție Yolo</h2>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setUploadedImage(null);
                                        setUploadedFile(null);
                                        setYoloResult(null);
                                        setCnnResult(null);
                                        setProcessedImageUrl(null);
                                        setCroppedImageUrl(null);
                                    }}
                                    className="px-6 py-3 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 text-gray-700 transition-all flex items-center gap-2"
                                >
                                    <RotateCcw className="w-5 h-5" /> Incarca alta Imagine
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={!yoloResult || (yoloResult.voting_result.vote_count === 3 && yoloResult.voting_result.winning_class === 'Nu s-a detectat tumoare')}
                                    title={yoloResult?.voting_result.vote_count === 3 && yoloResult.voting_result.winning_class === 'Nu s-a detectat tumoare' ? "Rezultat unanim - Pasul 3 nu este necesar" : ""}
                                    className="px-8 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight className="w-5 h-5" />
                                </button>
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

                            {/* Right: Results */}
                            <div className="space-y-6">
                                {yoloResult && (
                                    <div className="space-y-6">
                                        {/* Main Result Block */}
                                        <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-xl ${yoloResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                            ? 'bg-emerald-100/80 border-emerald-300'
                                            : 'bg-red-100/80 border-red-300'
                                            }`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h2 className="text-gray-600 text-sm font-medium uppercase tracking-wider mb-1">
                                                        Rezultat Final Yolo
                                                    </h2>
                                                    <div className="flex items-center gap-3">
                                                        <span className={`text-3xl font-bold ${yoloResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                                            ? 'text-emerald-600'
                                                            : 'text-red-600'
                                                            }`}>
                                                            {yoloResult.voting_result.winning_class}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-600 mb-1">Suma Voturilor</div>
                                                    <div className="text-2xl font-mono font-bold text-gray-900">
                                                        {yoloResult.voting_result.vote_count}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Best Detection Info */}
                                            {yoloResult.best_detection && (
                                                <div className="mt-4 pt-4 border-t border-gray-300">
                                                    <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                        <Target className="w-4 h-4 text-blue-400" />
                                                        Cel mai bun bounding box
                                                    </h3>
                                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                                                            <span className="text-gray-600 block text-xs">Model</span>
                                                            <span className="text-blue-600 font-mono font-bold">YOLO {yoloResult.best_detection.model}</span>
                                                        </div>
                                                        <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                                                            <span className="text-gray-600 block text-xs">Probabilitate</span>
                                                            <span className="text-green-600 font-mono font-bold">{yoloResult.best_detection.confidence_procent}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Individual Results */}
                                        <div className="bg-white/80 rounded-2xl p-6 border border-gray-300/50">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-blue-400" />
                                                Rezultate Individuale
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4">
                                                {Object.entries(yoloResult.individual_results).map(([version, results]) => (
                                                    <div key={version} className="p-4 bg-gray-50 rounded-xl border border-gray-300">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-sm font-bold text-blue-600 uppercase tracking-wider">
                                                                YOLO {version}
                                                            </span>
                                                            <span className="text-xs text-gray-600">
                                                                {Array.isArray(results) ? `${results.length} detecții` : 'Eroare'}
                                                            </span>
                                                        </div>
                                                        {Array.isArray(results) && results.length > 0 ? (
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
                                                        )}
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
                                        setCroppedImageUrl(null);
                                    }}
                                    className="px-6 py-3 rounded-xl font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center gap-2 shadow-lg"
                                >
                                    <RotateCcw className="w-5 h-5" /> Incarca alta Imagine
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Left: Image (Original + Cropped) */}
                            <div className="space-y-6">


                                {croppedImageUrl && (
                                    <div className="bg-white/80 rounded-2xl p-8 border border-gray-300/50 backdrop-blur-sm shadow-xl text-center">

                                        <div className="relative rounded-xl overflow-hidden shadow-2xl border border-gray-300 inline-block max-h-96">
                                            <img
                                                src={croppedImageUrl}
                                                alt="Cropped Tumor"
                                                className="max-h-96 w-auto object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
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