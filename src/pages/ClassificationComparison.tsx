import { useState, useEffect } from 'react';
import { Loader2, BarChart3, TrendingUp, AlertCircle } from "lucide-react";

interface ClassificationResult {
    file_name: string;
    clasa_reala: string;
    clasa_detectata: string;
}

interface DatasetStats {
    name: string;
    total: number;
    correct: number;
    accuracy: number;
    perClass: Record<string, { total: number; correct: number; accuracy: number }>;
}

const ClassificationComparison = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<DatasetStats[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const endpoints = [

                    { name: 'Imagine Originală', url: 'http://127.0.0.1:8000/api/reports/classification-report-cropped' },
                    { name: 'Detecție, Decupare, Clasificare', url: 'http://127.0.0.1:8000/api/reports/classification-report' },
                    { name: 'Detecție,Segmentare, Clasificare', url: 'http://127.0.0.1:8000/api/reports/classification-report-sam' }
                ];

                const results = await Promise.all(
                    endpoints.map(async (endpoint) => {
                        const response = await fetch(endpoint.url);
                        if (!response.ok) throw new Error(`Failed to fetch ${endpoint.name}`);
                        const data: ClassificationResult[] = await response.json();
                        return processData(endpoint.name, data);
                    })
                );

                setStats(results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const processData = (name: string, data: ClassificationResult[]): DatasetStats => {
        const total = data.length;
        const correct = data.filter(item => item.clasa_reala === item.clasa_detectata).length;
        const accuracy = total > 0 ? (correct / total) * 100 : 0;

        const perClass: Record<string, { total: number; correct: number; accuracy: number }> = {};

        // Initialize classes
        ['gliomă', 'meningioma', 'notumor', 'pituitară'].forEach(cls => {
            perClass[cls] = { total: 0, correct: 0, accuracy: 0 };
        });

        data.forEach(item => {
            const cls = item.clasa_reala;
            if (!perClass[cls]) perClass[cls] = { total: 0, correct: 0, accuracy: 0 };

            perClass[cls].total++;
            if (item.clasa_reala === item.clasa_detectata) {
                perClass[cls].correct++;
            }
        });

        Object.keys(perClass).forEach(cls => {
            if (perClass[cls].total > 0) {
                perClass[cls].accuracy = (perClass[cls].correct / perClass[cls].total) * 100;
            }
        });

        return { name, total, correct, accuracy, perClass };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-slate-50">
                <div className="text-red-500 text-center bg-white p-6 rounded-xl shadow-lg">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                    <p className="font-bold mb-2">Error loading data</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const classes = ['glioma', 'meningioma', 'notumor', 'pituitary'];
    const maxAccuracy = Math.max(...stats.map(s => s.accuracy));

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                        <BarChart3 className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Analiză Comparativă</h1>
                    </div>
                </div>

                {/* Overall Accuracy Cards */}
                <div className="grid md:grid-cols-3 gap-6">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-all">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <TrendingUp className="w-16 h-16 text-blue-600" />
                            </div>
                            <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider mb-2">{stat.name}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-slate-900">{stat.accuracy.toFixed(1)}%</span>
                                <span className="text-sm text-slate-500">acuratețe</span>
                            </div>
                            <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ${stat.accuracy === maxAccuracy ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                    style={{ width: `${stat.accuracy}%` }}
                                />
                            </div>
                            <div className="mt-2 text-xs text-slate-400 text-right">
                                {stat.correct} / {stat.total} imagini corecte
                            </div>
                        </div>
                    ))}
                </div>

                {/* Comparative Chart */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
                    <h2 className="text-xl font-bold text-slate-900 mb-8">Comparație Acuratețe pe Clase</h2>

                    <div className="space-y-8">
                        {classes.map(cls => (
                            <div key={cls} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-700 capitalize w-24">{cls}</span>
                                    <div className="flex-1 ml-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {stats.map((stat, idx) => {
                                            const acc = stat.perClass[cls].accuracy;
                                            const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500'];
                                            const bgColors = ['bg-blue-50', 'bg-indigo-50', 'bg-violet-50'];

                                            return (
                                                <div key={stat.name} className="relative group">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="text-slate-500 font-medium">{stat.name}</span>
                                                        <span className="font-bold text-slate-700">{acc.toFixed(1)}%</span>
                                                    </div>
                                                    <div className={`w-full ${bgColors[idx]} rounded-full h-3 overflow-hidden`}>
                                                        <div
                                                            className={`h-full ${colors[idx]} rounded-full transition-all duration-1000 group-hover:opacity-80`}
                                                            style={{ width: `${acc}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>


                </div>
            </div>
        </div>
    );
};

export default ClassificationComparison;
