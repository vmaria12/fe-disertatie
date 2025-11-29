import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft, Loader2, FileText, CheckCircle, AlertCircle, Brain, Activity, ScanLine, Eye, Target } from 'lucide-react';

interface AutoAnnotateProps {
    onNavigate: (page: string) => void;
}

interface AnnotationResponse {
    filename: string;
    annotation: string;
    image_base64?: string;
    segmented_image_base64?: string;
    message?: string;
}

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

interface VotingResponseCnn {
    individual_results: {
        [key: string]: {
            predicted_class: string;
            confidence: string;
            all_probabilities: { [key: string]: string };
        } | { error: string };
    };
    voting_result: {
        winning_class: string;
        vote_counts: { [key: string]: number };
        prob_sums: { [key: string]: string };
        tie_break_used: boolean;
    };
}

export function AutoAnnotate({ onNavigate }: AutoAnnotateProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnnotationResponse | null>(null);
    const [detectionImage, setDetectionImage] = useState<string | null>(null);
    const [yoloResult, setYoloResult] = useState<VotingResponseYolo | null>(null);
    const [cnnResult, setCnnResult] = useState<VotingResponseCnn | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [progressStep, setProgressStep] = useState(0); // 0: Idle, 1: Detection, 2: Segmentation, 3: Classification, 4: Done
    const [activeTab, setActiveTab] = useState<'detection' | 'segmentation' | 'classification'>('detection');
    const [bgBrightness, setBgBrightness] = useState(255);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setDetectionImage(null);
            setYoloResult(null);
            setCnnResult(null);
            setError(null);
            setProgressStep(0);
            setActiveTab('detection');
            setBgBrightness(255);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);
        setProgressStep(1); // Step 1: Detection (Voting)
        setActiveTab('detection');
        setDetectionImage(null);
        setYoloResult(null);
        setResult(null);
        setCnnResult(null);
        setBgBrightness(255);

        try {
            // --- Step 1: Voting & Detection ---
            const detectionFormData = new FormData();
            detectionFormData.append('image', selectedFile);

            const detectionResponse = await fetch('http://localhost:8000/api/detect-tumor/yolo/voting-complex/label', {
                method: 'POST',
                body: detectionFormData,
            });

            if (!detectionResponse.ok) {
                throw new Error('Failed to perform detection voting.');
            }

            // Get JSON data from header
            const votingDataHeader = detectionResponse.headers.get('X-Voting-Data');
            if (!votingDataHeader) {
                throw new Error('No voting data received from detection API.');
            }

            // Capture the detection image
            const imageBlob = await detectionResponse.blob();
            const imageUrl = URL.createObjectURL(imageBlob);
            setDetectionImage(imageUrl);

            const votingData: VotingResponseYolo = JSON.parse(atob(votingDataHeader));
            setYoloResult(votingData);
            const bestDetection = votingData.best_detection;

            if (!bestDetection) {
                throw new Error('No tumor detected by voting system. Cannot proceed to segmentation.');
            }

            const bbox = bestDetection.bounding_box;
            const bboxArray = [bbox.x1, bbox.y1, bbox.x2, bbox.y2];

            // --- Step 2: Segmentation (Auto Annotate with Box) ---
            setProgressStep(2);

            const annotationFormData = new FormData();
            annotationFormData.append('image', selectedFile);
            annotationFormData.append('bbox', JSON.stringify(bboxArray));

            const annotationResponse = await fetch('http://localhost:8000/api/auto-annotate', {
                method: 'POST',
                body: annotationFormData,
            });

            if (!annotationResponse.ok) {
                const errorData = await annotationResponse.json();
                throw new Error(errorData.error || 'Failed to generate segmentation.');
            }

            const data: AnnotationResponse = await annotationResponse.json();
            setResult(data);

            if (!data.segmented_image_base64) {
                throw new Error('Segmentation succeeded but no segmented image was returned.');
            }

            // --- Step 3: Classification (CNN/ViT on Segmented Image) ---
            setProgressStep(3);

            // Convert base64 segmented image to Blob for upload
            const byteCharacters = atob(data.segmented_image_base64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const segmentedBlob = new Blob([byteArray], { type: 'image/png' });

            const classificationFormData = new FormData();
            classificationFormData.append('image', segmentedBlob, 'segmented_tumor.png');

            const classificationResponse = await fetch('http://localhost:8000/api/detect-tumor/neuronal-network/voting-label', {
                method: 'POST',
                body: classificationFormData,
            });

            if (!classificationResponse.ok) {
                throw new Error('Failed to classify segmented tumor.');
            }

            const classificationData: VotingResponseCnn = await classificationResponse.json();
            setCnnResult(classificationData);

            setProgressStep(4); // Done
            setActiveTab('classification'); // Switch to final result

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setProgressStep(0);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setDetectionImage(null);
        setYoloResult(null);
        setCnnResult(null);
        setError(null);
        setProgressStep(0);
        setActiveTab('detection');
        setBgBrightness(255);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const steps = [
        { id: 1, label: '1. Detecție (YOLO)', icon: Brain, tab: 'detection' },
        { id: 2, label: '2. Segmentare (SAM)', icon: ScanLine, tab: 'segmentation' },
        { id: 3, label: '3. Clasificare (CNN)', icon: Activity, tab: 'classification' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                    <ScanLine className="w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">Segmentare & Diagnostic</h1>
                                    <p className="text-slate-500 text-sm mt-1">
                                        Detecție - Segmentare - Clasificare
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onNavigate('home')}
                                className="flex items-center text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 rounded-lg hover:bg-slate-50"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Înapoi
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Progress Stepper */}
                        {(isLoading || progressStep > 0) && (
                            <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-8">
                                {steps.map((step) => {
                                    const Icon = step.icon;
                                    const isActive = progressStep === step.id;
                                    const isCompleted = progressStep > step.id;
                                    const isClickable = progressStep >= step.id;

                                    return (
                                        <button
                                            key={step.id}
                                            disabled={!isClickable}
                                            onClick={() => {
                                                if (step.tab === 'detection') setActiveTab('detection');
                                                if (step.tab === 'segmentation' && result) setActiveTab('segmentation');
                                                if (step.tab === 'classification' && cnnResult) setActiveTab('classification');
                                            }}
                                            className={`w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all duration-200 flex items-center justify-center gap-2
                                            ${isActive
                                                    ? 'bg-white text-blue-700 shadow ring-1 ring-black/5'
                                                    : isCompleted
                                                        ? 'text-green-600 bg-green-50/50 hover:bg-white hover:shadow'
                                                        : 'text-slate-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isCompleted ? (
                                                <CheckCircle className="w-4 h-4" />
                                            ) : (
                                                isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />
                                            )}
                                            {step.label}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        <div className="grid gap-8 md:grid-cols-2">
                            {/* Upload Section */}
                            <div className="space-y-4">
                                <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-blue-500" />
                                    Încărcare Imagine MRI
                                </h2>

                                {!selectedFile ? (
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group h-[400px] flex flex-col items-center justify-center"
                                    >
                                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                            <Upload className="w-10 h-10" />
                                        </div>
                                        <p className="text-xl text-slate-900 font-medium mb-2">Click pentru a încărca</p>
                                        <p className="text-slate-500">sau trage imaginea aici</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-white h-[400px] flex items-center justify-center">
                                            <img
                                                src={previewUrl!}
                                                alt="Preview"
                                                className="max-w-full max-h-full object-contain"
                                            />
                                        </div>
                                        <div className="text-right text-sm text-slate-500 font-medium">
                                            {selectedFile.name}
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleUpload}
                                                disabled={isLoading}
                                                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                                            >
                                                {isLoading ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Se procesează...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Activity className="w-5 h-5" />
                                                        Start Analiză Completă
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={handleReset}
                                                disabled={isLoading}
                                                className="px-6 py-3 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors font-medium"
                                            >
                                                Resetează
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileSelect}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>

                            {/* Results Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-green-500" />
                                        Rezultat {activeTab === 'detection' ? 'Detecție (Pas 1)' : activeTab === 'segmentation' ? 'Segmentare (Pas 2)' : 'Clasificare (Pas 3)'}
                                    </h2>
                                </div>

                                <div className={`border border-slate-200 rounded-xl bg-slate-50 flex flex-col overflow-hidden relative ${activeTab === 'segmentation' ? 'h-[600px]' : 'min-h-[600px]'}`}>
                                    {error ? (
                                        <div className="m-4 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium">Eroare</p>
                                                <p className="text-sm">{error}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Detection View */}
                                            {activeTab === 'detection' && detectionImage && (
                                                <div className="flex flex-col h-full overflow-y-auto">
                                                    <div className="bg-white flex items-center justify-center p-4 min-h-[300px]">
                                                        <img
                                                            src={detectionImage}
                                                            alt="Detection Result"
                                                            className="max-w-full max-h-[300px] object-contain"
                                                        />
                                                    </div>

                                                    {yoloResult && (
                                                        <div className="p-6 space-y-6 bg-white">
                                                            {/* Main Result Block */}
                                                            <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-sm ${yoloResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                                                ? 'bg-emerald-50 border-emerald-200'
                                                                : 'bg-red-50 border-red-200'
                                                                }`}>
                                                                <div className="flex items-start justify-between mb-4">
                                                                    <div>
                                                                        <h2 className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                                                                            Rezultat Final Yolo
                                                                        </h2>
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`text-2xl font-bold ${yoloResult.voting_result.winning_class === 'Nu s-a detectat tumoare'
                                                                                ? 'text-emerald-600'
                                                                                : 'text-red-600'
                                                                                }`}>
                                                                                {yoloResult.voting_result.winning_class}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <div className="text-xs text-gray-600 mb-1">Suma Voturilor</div>
                                                                        <div className="text-xl font-mono font-bold text-gray-900">
                                                                            {yoloResult.voting_result.vote_count}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Best Detection Info */}
                                                                {yoloResult.best_detection && (
                                                                    <div className="mt-4 pt-4 border-t border-gray-300/50">
                                                                        <h3 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-2">
                                                                            <Target className="w-3 h-3 text-blue-500" />
                                                                            Cel mai bun bounding box
                                                                        </h3>
                                                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                                                            <div className="bg-white/50 p-2 rounded border border-blue-100">
                                                                                <span className="text-gray-500 block text-[10px]">Model</span>
                                                                                <span className="text-blue-600 font-mono font-bold">YOLO {yoloResult.best_detection.model}</span>
                                                                            </div>
                                                                            <div className="bg-white/50 p-2 rounded border border-green-100">
                                                                                <span className="text-gray-500 block text-[10px]">Probabilitate</span>
                                                                                <span className="text-green-600 font-mono font-bold">{yoloResult.best_detection.confidence_procent}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Individual Results */}
                                                            <div>
                                                                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-blue-500" />
                                                                    Rezultate Individuale
                                                                </h3>
                                                                <div className="space-y-3">
                                                                    {Object.entries(yoloResult.individual_results).map(([version, results]) => (
                                                                        <div key={version} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                                                    YOLO {version}
                                                                                </span>
                                                                                <span className="text-[10px] text-gray-500">
                                                                                    {Array.isArray(results) ? `${results.length} detecții` : 'Eroare'}
                                                                                </span>
                                                                            </div>
                                                                            {Array.isArray(results) && results.length > 0 ? (
                                                                                <div className="space-y-1">
                                                                                    {results.map((det, idx) => (
                                                                                        <div key={idx} className="flex justify-between text-xs p-1.5 bg-white rounded border border-slate-100">
                                                                                            <span className="text-gray-700">{det.clasa}</span>
                                                                                            <span className="font-mono text-green-600">{det.confidence_procent}</span>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            ) : (
                                                                                <div className="text-xs text-gray-400 italic">Nicio tumoare detectată</div>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Segmentation View */}
                                            {activeTab === 'segmentation' && result ? (
                                                <div className="flex-1 flex flex-col h-full">
                                                    {result.image_base64 ? (
                                                        <div className="flex-1 bg-white flex items-center justify-center overflow-hidden border-b border-slate-200 relative">
                                                            <img
                                                                src={`data:image/png;base64,${result.image_base64}`}
                                                                alt="Annotated Result"
                                                                className="max-w-full max-h-full object-contain"
                                                            />
                                                        </div>
                                                    ) : null}
                                                </div>
                                            ) : null}

                                            {/* Classification View */}
                                            {activeTab === 'classification' && cnnResult && result?.segmented_image_base64 && (
                                                <div className="flex flex-col">
                                                    <div
                                                        className="flex flex-col items-center justify-center p-4 min-h-[200px] transition-colors duration-200"
                                                        style={{ backgroundColor: `rgb(${bgBrightness}, ${bgBrightness}, ${bgBrightness})` }}
                                                    >
                                                        <img
                                                            src={`data:image/png;base64,${result.segmented_image_base64}`}
                                                            alt="Segmented Tumor"
                                                            className="max-w-full max-h-[200px] object-contain"
                                                        />
                                                        <div className="mt-4 w-full max-w-xs flex items-center gap-3 bg-white/80 p-2 rounded-lg backdrop-blur-sm">
                                                            <div className="w-4 h-4 rounded-full border border-gray-300 bg-black"></div>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="255"
                                                                value={bgBrightness}
                                                                onChange={(e) => setBgBrightness(Number(e.target.value))}
                                                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                            />
                                                            <div className="w-4 h-4 rounded-full border border-gray-300 bg-white"></div>
                                                        </div>
                                                    </div>

                                                    <div className="p-6 space-y-6 bg-white">
                                                        <div className={`p-6 rounded-2xl border backdrop-blur-sm shadow-sm ${cnnResult.voting_result.winning_class === 'notumor' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                                                            }`}>
                                                            <div className="flex items-start justify-between">
                                                                <div>
                                                                    <h2 className="text-gray-600 text-xs font-bold uppercase tracking-wider mb-1">
                                                                        Diagnostic Final (CNN/ViT)
                                                                    </h2>
                                                                    <div className="flex items-center gap-3">
                                                                        <span className={`text-2xl font-bold ${cnnResult.voting_result.winning_class === 'notumor' ? 'text-emerald-600' : 'text-red-600'
                                                                            }`}>
                                                                            {cnnResult.voting_result.winning_class}
                                                                        </span>
                                                                    </div>
                                                                    {cnnResult.voting_result.tie_break_used && (
                                                                        <span className="text-[10px] text-amber-600 font-medium mt-1 block">
                                                                            *Departajare prin suma probabilităților
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <div className="text-xs text-gray-600 mb-1">Voturi</div>
                                                                    <div className="text-xl font-mono font-bold text-gray-900">
                                                                        {cnnResult.voting_result.vote_counts[cnnResult.voting_result.winning_class]} / 3
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Individual Model Results */}
                                                        <div>
                                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <Activity className="w-4 h-4 text-blue-500" />
                                                                Rezultate Modele Individuale
                                                            </h3>
                                                            <div className="space-y-3">
                                                                {Object.entries(cnnResult.individual_results).map(([model, res]) => (
                                                                    <div key={model} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                                                                                {model}
                                                                            </span>
                                                                            {'predicted_class' in res ? (
                                                                                <span className="text-[10px] text-gray-500">
                                                                                    Confidență: <span className="font-mono font-bold text-gray-900">{res.confidence}</span>
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-[10px] text-red-500">Eroare</span>
                                                                            )}
                                                                        </div>
                                                                        {'predicted_class' in res && (
                                                                            <div className="flex justify-between text-xs p-1.5 bg-white rounded border border-slate-100">
                                                                                <span className="text-gray-700 font-medium">{res.predicted_class}</span>
                                                                                <div className="flex gap-2">
                                                                                    {Object.entries(res.all_probabilities).map(([cls, prob]) => (
                                                                                        <span key={cls} className="text-[10px] text-gray-400">
                                                                                            {cls}: {prob}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Empty State */}
                                            {!detectionImage && !result && !isLoading && (
                                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                                    <Brain className="w-16 h-16 mb-4 opacity-20" />
                                                    <p className="font-medium">Rezultatele vor apărea aici</p>
                                                    <p className="text-sm opacity-70">Încarcă o imagine pentru a începe</p>
                                                </div>
                                            )}

                                            {/* Loading State Overlay for Image Area */}
                                            {isLoading && !detectionImage && !result && (
                                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                                                    <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-500" />
                                                    <p className="font-medium text-slate-600">Se procesează...</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
