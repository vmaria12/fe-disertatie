import { Brain, Activity, FileCheck, Menu, Stethoscope, Vote, ChevronDown, ChevronRight, Crop, Image } from 'lucide-react';
import { useState } from 'react';

interface HomeProps {
    onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isYoloExpanded, setIsYoloExpanded] = useState(false);
    const [isClassificationExpanded, setIsClassificationExpanded] = useState(false);
    const [isDetectClassifyExpanded, setIsDetectClassifyExpanded] = useState(false);
    const [isResultsExpanded, setIsResultsExpanded] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-white shadow-2xl transition-all duration-300 z-20 
                ${isSidebarOpen ? 'w-72' : 'w-20'} overflow-hidden`}
            >
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <span className="font-bold text-xl text-slate-800">NeuroScan</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-slate-600" />
                    </button>
                </div>

                <nav className="mt-8 px-4 space-y-3">
                    {/* Detectie Yolo Section */}
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (!isSidebarOpen) setIsSidebarOpen(true);
                                setIsYoloExpanded(!isYoloExpanded);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group hover:bg-slate-50
                            ${!isSidebarOpen ? 'justify-center' : ''}`}
                        >
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Brain className="w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="font-semibold text-slate-700">Detectie Yolo</span>
                                    {isYoloExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            )}
                        </button>

                        {/* Expandable Content Yolo */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out
                            ${isYoloExpanded && isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="pl-4 space-y-2 mt-2">
                                <button
                                    onClick={() => onNavigate('diagnose')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md group-hover:bg-blue-500 group-hover:text-white">
                                        <Brain className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-blue-700 text-left">
                                        Selectare Yolo
                                    </span>
                                </button>

                                <button
                                    onClick={() => onNavigate('automated-diagnose')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-green-50 text-green-500 rounded-md group-hover:bg-green-500 group-hover:text-white">
                                        <Vote className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-green-700 text-left">
                                        Votare-Suma probabilităților
                                    </span>
                                </button>

                                <button
                                    onClick={() => onNavigate('voting-label')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-500 group-hover:text-white">
                                        <Vote className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700 text-left">
                                        Votare-Suma etichetelor
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Clasificare Section */}
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (!isSidebarOpen) setIsSidebarOpen(true);
                                setIsClassificationExpanded(!isClassificationExpanded);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group hover:bg-slate-50
                            ${!isSidebarOpen ? 'justify-center' : ''}`}
                        >
                            <div className="p-1.5 bg-teal-50 text-teal-500 rounded-md group-hover:bg-teal-500 group-hover:text-white">
                                <Activity className="w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="font-semibold text-slate-700">Clasificare</span>
                                    {isClassificationExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            )}
                        </button>

                        {/* Expandable Content Clasificare */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out
                            ${isClassificationExpanded && isSidebarOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="pl-4 space-y-2 mt-2">
                                <button
                                    onClick={() => onNavigate('classify-cnn-vit')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-indigo-50 text-indigo-500 rounded-md group-hover:bg-indigo-500 group-hover:text-white">
                                        <Brain className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-700 text-left">
                                        efficientnet_b7/ resnet101/ vit_b16
                                    </span>
                                </button>

                                <button
                                    onClick={() => onNavigate('classify-voting-prob')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-teal-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-teal-50 text-teal-500 rounded-md group-hover:bg-teal-500 group-hover:text-white">
                                        <Vote className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-teal-700 text-left">
                                        Votare Suma probabilitatilor
                                    </span>
                                </button>


                                <button
                                    onClick={() => onNavigate('classify-voting-label')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-500 group-hover:text-white">
                                        <Vote className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700 text-left">
                                        Votare suma etichetelor
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Detectie & Clasificare Section */}
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (!isSidebarOpen) setIsSidebarOpen(true);
                                setIsDetectClassifyExpanded(!isDetectClassifyExpanded);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group hover:bg-slate-50
                            ${!isSidebarOpen ? 'justify-center' : ''}`}
                        >
                            <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-500 group-hover:text-white">
                                <Stethoscope className="w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="font-semibold text-slate-700">Detectie & Clasificare</span>
                                    {isDetectClassifyExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            )}
                        </button>

                        {/* Expandable Content Detectie & Clasificare */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out
                            ${isDetectClassifyExpanded && isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="pl-4 space-y-2 mt-2">
                                <button
                                    onClick={() => onNavigate('detect-classify')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-500 group-hover:text-white">
                                        <Crop className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700 text-left">
                                        Decupare
                                    </span>
                                </button>

                                <button
                                    onClick={() => onNavigate('detect-classify-basic')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-purple-50 text-purple-500 rounded-md group-hover:bg-purple-500 group-hover:text-white">
                                        <Image className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-purple-700 text-left">
                                        Basic
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Rezultate Section */}
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                if (!isSidebarOpen) setIsSidebarOpen(true);
                                setIsResultsExpanded(!isResultsExpanded);
                            }}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group hover:bg-slate-50
                            ${!isSidebarOpen ? 'justify-center' : ''}`}
                        >
                            <div className="p-1.5 bg-orange-50 text-orange-500 rounded-md group-hover:bg-orange-500 group-hover:text-white">
                                <FileCheck className="w-6 h-6" />
                            </div>
                            {isSidebarOpen && (
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="font-semibold text-slate-700">Rezultate</span>
                                    {isResultsExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-400" />
                                    )}
                                </div>
                            )}
                        </button>

                        {/* Expandable Content Rezultate */}
                        <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out
                            ${isResultsExpanded && isSidebarOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="pl-4 space-y-2 mt-2">
                                <button
                                    onClick={() => onNavigate('original-image-classification-results')}
                                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
                                >
                                    <div className="p-1.5 bg-orange-50 text-orange-500 rounded-md group-hover:bg-orange-500 group-hover:text-white">
                                        <Image className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-orange-700 text-left">
                                        Clasificare-Imagine Originală
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-72' : 'ml-20'}`}>
                <section className="max-w-7xl mx-auto px-8 py-12">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                                Proiect Disertație-Inginerie Software
                            </div>
                            <div className="text-xl font-bold text-slate-900 mb-6 leading-tight">
                                Clasificarea tumorilor cerebrale folosind YOLO, rețele neuronale și Transformer vizual
                            </div>
                            <p className="text-l text-slate-600 mb-8 leading-relaxed">
                                Platforma combină imagistica medicală cu rețele neuronale și Transformer vizual pentru a ajuta la identificarea tumorilor cerebrale.
                            </p>

                        </div>
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-12 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"></div>
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 text-white relative z-10 border border-white/20">
                                <Brain className="w-24 h-24 mx-auto mb-6 opacity-90" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold mb-2">Analiză Avansată</p>
                                    <p className="opacity-80">Detectare precisă cu AI</p>
                                </div>
                            </div>
                        </div>
                    </div >
                </section >

                <section id="features" className="bg-white py-20">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4">Funcționalități</h2>

                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 duration-300 border border-slate-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                    <Activity className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Analiză în Timp Real</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Procesează imagini medicale cu rețele neuronale și Transformer vizual
                                </p>
                            </div>

                            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 duration-300 border border-slate-100">
                                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                                    <FileCheck className="w-7 h-7 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-3">Detalii despre tumoră</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Afișează tipul tumorii, acuratețea acesteia.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="about" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4">Arhitectura Sistemului</h2>
                            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
                                Se utilizează Transfered Learning, care combină rețele convoluționale/Transfore vizuale și Yolo.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8 mt-12">
                            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Rețele Neuronale Convoluționale</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <p className="text-slate-700 font-medium">EfficientNet-B7</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <p className="text-slate-700 font-medium">ResNet101</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl p-8 shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Transformer Vizual</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                        <p className="text-slate-700 font-medium">ViT-B/16</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="yolo" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4">Modele YOLO Integrate</h2>
                            <p className="text-xl text-slate-600 leading-relaxed">
                                Detectare și localizarea tumorilor.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { ver: 'v8', color: 'text-blue-600', desc: '' },
                                { ver: 'v9', color: 'text-indigo-600', desc: '' },
                                { ver: 'v12', color: 'text-violet-600', desc: '' }
                            ].map((model) => (
                                <div key={model.ver} className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-all hover:-translate-y-1 duration-300 border border-slate-100">
                                    <div className={`text-3xl font-bold ${model.color} mb-4`}>YOLO{model.ver}</div>
                                    <p className="text-slate-600">{model.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="tehnici-votare" className="py-20 bg-slate-50">
                    <div className="max-w-7xl mx-auto px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl font-bold text-slate-900 mb-4">Tehnici de Votare</h2>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                                    <Activity className="w-6 h-6 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Votare pe bază de probabilități</h3>
                                <p className="text-slate-600">Media ponderată a probabilităților prezise de fiecare model individual.</p>
                            </div>
                            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-6">
                                    <FileCheck className="w-6 h-6 text-teal-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">Votare pe bază de etichete</h3>
                                <p className="text-slate-600">Sistem de vot majoritar bazat pe clasa prezisă de fiecare model.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main >
        </div>
    );
}