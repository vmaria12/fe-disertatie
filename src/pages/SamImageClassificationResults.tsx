import React, { useState, useEffect } from 'react';
import { Loader2, FileText } from "lucide-react";

interface ClassificationResult {
    file_name: string;
    clasa_reala: string;
    clasa_detectata: string;
}

const SamImageClassificationResults = () => {
    const [data, setData] = useState<ClassificationResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('notumor');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/reports/classification-report-sam');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const jsonData = await response.json();
                setData(jsonData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filterData = (clasa: string) => {
        return data.filter(item => item.clasa_reala === clasa);
    };

    const tabs = [
        { id: 'notumor', label: 'No Tumor' },
        { id: 'meningioma', label: 'Meningioma' },
        { id: 'pituitary', label: 'Pituitary' },
        { id: 'glioma', label: 'Glioma' },
    ];

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
                    <p className="font-bold mb-2">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    const filteredData = filterData(activeTab);

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Rezultate Detectie, Segmentare & Clasificare</h1>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Custom Tabs */}
                        <div className="flex space-x-1 rounded-xl bg-slate-100 p-1 mb-6">
                            {tabs.map((tab) => {
                                const tabData = filterData(tab.id);
                                const correctCount = tabData.filter(item => item.clasa_reala === item.clasa_detectata).length;
                                const totalCount = tabData.length;

                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 transition-all duration-200
                    ${activeTab === tab.id
                                                ? 'bg-white text-blue-700 shadow'
                                                : 'text-slate-600 hover:bg-white/[0.12] hover:text-slate-800'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{tab.label}</span>
                                            <span className="text-xs opacity-80">
                                                (Corecte: {correctCount}/{totalCount})
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Misclassification Summary */}
                        {(() => {
                            const misclassifications = filteredData.reduce((acc, item) => {
                                if (item.clasa_detectata !== item.clasa_reala) {
                                    acc[item.clasa_detectata] = (acc[item.clasa_detectata] || 0) + 1;
                                }
                                return acc;
                            }, {} as Record<string, number>);

                            if (Object.keys(misclassifications).length === 0) return null;

                            return (
                                <div className="mb-6">

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(misclassifications).map(([cls, count]) => (
                                            <div key={cls} className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center justify-between">
                                                <span className="text-red-700 font-medium capitalize">{cls}</span>
                                                <span className="bg-white text-red-700 border border-red-200 py-1 px-3 rounded-lg text-sm font-bold shadow-sm">
                                                    {count}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Table */}
                        <div className="overflow-x-auto rounded-lg border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Nume Imagine
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Clasa Reală
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Clasa Prezisa
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item, index) => (
                                            <tr key={index} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                                                    {item.file_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                        {item.clasa_reala}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${item.clasa_reala === item.clasa_detectata
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {item.clasa_detectata}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                                                Nu există date pentru această clasă.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-4 text-sm text-slate-500 text-right">
                            Total înregistrări: {filteredData.length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SamImageClassificationResults;
