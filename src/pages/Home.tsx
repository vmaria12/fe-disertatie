import { Brain, Shield, Activity, FileCheck, ArrowRight } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export function Home({ onNavigate }: HomeProps) {
  return (
    <main>
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              Proiect Disertație-Inginerie Software
            </div>
          <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
              Maria VASILACHE
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
              Clasificarea tumorilor cerebrale folosind YOLO, rețele neuronale și Transformer vizual 
            </h1>
            <p className="text-xl text-slate-600 mb-8 leading-relaxed">
              Platforma noastră de ultimă oră combină imagistica medicală cu rețele neuronale și Transformer vizual pentru a asista profesioniștii din sănătate în identificarea tumorilor cerebrale cu precizie.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => onNavigate('diagnose')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Diagnosticare
                <ArrowRight className="w-5 h-5" />
              </button>
             
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-12 shadow-2xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
              <Brain className="w-24 h-24 mx-auto mb-6 opacity-90" />

            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Funcționalități Cheie</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Platforma noastră oferă instrumente complete pentru profesioniștii medicali pentru a îmbunătăți capacitățile de diagnostic
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Activity className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Analiză în Timp Real</h3>
              <p className="text-slate-600 leading-relaxed">
                Procesează imagini medicale cu rețele neuronale și Transformer vizual, oferind rezultate  preliminare instantanee.
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <FileCheck className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Detalii despre tumoră</h3>
              <p className="text-slate-600 leading-relaxed">
                Afișează tipul tumorii, scorurile de încredere a tumorii.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Modele de rețele neuronale și transformatoare vizuale</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Platforma noastră combină imagistica medicală cu rețele neuronale și Transformer vizual pentru a asista profesioniștii din sănătate în identificarea tumorilor cerebrale cu precizie.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Rețele neuronale convoluționale</h3>
              <p className="text-slate-600">EfficientNet-B7, ResNet101</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Transformer vizual</h3>
              <p className="text-slate-600">ViT-B/16</p>
            </div>
          </div>
        </div>
      </section>



      <section id="yolo" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Modele YOLO</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Modele YOLO pentru detectarea tumorilor cerebrale.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">YOLOv8</h3> 
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">YOLOv9</h3> 
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">YOLOv12</h3> 
            </div>
          </div>
        </div>
      </section>

      <section id="tehnici-votare" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Tehnici de votare</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              Tehnici de votare pentru detectarea/clasificarea tumorilor cerebrale.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Votare pe bază de probabilități</h3> 
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-2xl font-bold text-blue-600 mb-2">Votare pe bază de etichete</h3> 
            </div>
            
          </div>
        </div>
      </section>



    </main>
  );
}