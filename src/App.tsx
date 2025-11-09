import { Brain, Shield, Activity, FileCheck, ArrowRight } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-slate-900">NeuroDetect</span>
          </div>
          <div className="flex gap-6">
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors">About</a>
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
            <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors">Contact</a>
          </div>
        </div>
      </nav>

      <main>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                Advanced Medical Research
              </div>
              <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Early Detection of Brain Tumors Through AI Analysis
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Our cutting-edge platform combines medical imaging with artificial intelligence to assist healthcare professionals in identifying brain tumors with enhanced accuracy and speed.
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button className="px-6 py-3 bg-white text-slate-700 rounded-lg font-medium border border-slate-300 hover:border-slate-400 transition-colors">
                  Learn More
                </button>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-12 shadow-2xl">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-white">
                <Brain className="w-24 h-24 mx-auto mb-6 opacity-90" />
                <div className="text-center">
                  <p className="text-3xl font-bold mb-2">95.8%</p>
                  <p className="text-blue-100">Detection Accuracy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">Key Features</h2>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                Our platform provides comprehensive tools for medical professionals to enhance diagnostic capabilities
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Activity className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Real-Time Analysis</h3>
                <p className="text-slate-600 leading-relaxed">
                  Process MRI and CT scans in minutes with our advanced AI algorithms, providing instant preliminary results.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">HIPAA Compliant</h3>
                <p className="text-slate-600 leading-relaxed">
                  Complete patient data security with encrypted storage and transmission following healthcare regulations.
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <FileCheck className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Detailed Reports</h3>
                <p className="text-slate-600 leading-relaxed">
                  Generate comprehensive diagnostic reports with annotated images and confidence scores for medical review.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 bg-slate-50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-900 mb-4">About Our Research</h2>
              <p className="text-xl text-slate-600 leading-relaxed">
                Our study focuses on improving early detection rates of brain tumors through the integration of machine learning with traditional diagnostic methods. By analyzing thousands of medical images, our system learns to identify patterns that may indicate the presence of tumors, supporting radiologists in making faster and more accurate diagnoses.
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">10,000+</h3>
                <p className="text-slate-600">Scans Analyzed</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-2xl font-bold text-blue-600 mb-2">50+</h3>
                <p className="text-slate-600">Partner Hospitals</p>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Join Our Research</h2>
            <p className="text-xl text-slate-600 mb-8">
              Healthcare professionals interested in participating in our study or learning more about our technology
            </p>
            <button className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Contact Us
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-6 h-6 text-blue-400" />
              <span className="text-white font-semibold">NeuroDetect</span>
            </div>
            <p className="text-sm">© 2025 NeuroDetect Research. For research purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
