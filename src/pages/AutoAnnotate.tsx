import React, { useState, useRef } from 'react';
import { Upload, ArrowLeft, Loader2, FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface AutoAnnotateProps {
    onNavigate: (page: string) => void;
}

interface AnnotationResponse {
    filename: string;
    annotation: string;
    image_base64?: string;
    message?: string;
}

export function AutoAnnotate({ onNavigate }: AutoAnnotateProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<AnnotationResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const response = await fetch('http://localhost:8000/api/auto-annotate', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to process image');
            }

            const data = await response.json();
            setResult(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <button
                            onClick={() => onNavigate('home')}
                            className="flex items-center text-slate-600 hover:text-blue-600 transition-colors mb-2"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Înapoi la Home
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900">Auto Adnotare (YOLO + SAM)</h1>
                        <p className="text-slate-600 mt-2">
                            Încarcă o imagine MRI pentru a genera automat adnotări de segmentare.
                        </p>
                    </div>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Upload Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Încărcare Imagine</h2>

                        {!selectedFile ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                            >
                                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <p className="text-slate-900 font-medium mb-1">Click pentru a încărca</p>
                                <p className="text-slate-500 text-sm">sau trage imaginea aici</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="relative rounded-lg overflow-hidden border border-slate-200">
                                    <img
                                        src={previewUrl!}
                                        alt="Preview"
                                        className="w-full h-64 object-contain bg-slate-900"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleUpload}
                                        disabled={isLoading}
                                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Se procesează...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Generează Adnotări
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={handleReset}
                                        disabled={isLoading}
                                        className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
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
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
                        <h2 className="text-xl font-semibold text-slate-800 mb-4">Rezultat Adnotare</h2>

                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-medium">Eroare</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                            </div>
                        )}

                        {result ? (
                            <div className="flex-1 flex flex-col">


                                {result.image_base64 ? (
                                    <div className="mb-4 border border-slate-200 rounded-lg overflow-hidden bg-slate-900">
                                        <img
                                            src={`data:image/png;base64,${result.image_base64}`}
                                            alt="Annotated Result"
                                            className="w-full h-auto object-contain"
                                        />
                                    </div>
                                ) : null}


                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-100 rounded-lg">
                                <div className="text-center">
                                    <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Rezultatele vor apărea aici</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
