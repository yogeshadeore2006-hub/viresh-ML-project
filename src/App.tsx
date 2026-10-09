/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useId } from 'react';
import {
  Calculator,
  BookOpen,
  HelpCircle,
  Info,
  Presentation,
  Moon,
  Sun,
  RefreshCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Activity,
  ShieldCheck,
  Mail,
  Stethoscope,
  Brain,
  Cpu,
  Sliders,
  Award,
  ChevronRight,
  Check
} from 'lucide-react';

interface ExampleScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  prior: number; // percentage 0-100
  likelihood: number; // percentage 0-100
  evidence: number; // percentage 0-100
  priorLabel: string;
  likelihoodLabel: string;
  evidenceLabel: string;
  notes: string;
}

const PRESET_EXAMPLES: ExampleScenario[] = [
  {
    id: 'medical',
    title: 'Medical Diagnosis (Disease Test)',
    category: 'Healthcare / Diagnostics',
    description: 'A rare disease affects 1% of the population. A screening test correctly identifies a sick person 99% of the time (sensitivity), but has a 5% false-positive rate for healthy people.',
    prior: 1,
    likelihood: 99,
    evidence: 5.94, // (0.99 * 0.01) + (0.05 * 0.99) = 0.0099 + 0.0495 = 0.0594 (5.94%)
    priorLabel: 'P(Disease) = 1%',
    likelihoodLabel: 'P(Positive | Disease) = 99%',
    evidenceLabel: 'P(Positive) = 5.94% (Total Law of Probability)',
    notes: 'Even with a 99% accurate test, because the disease is rare, a positive test result only gives ~16.67% probability of having the disease due to false positives!'
  },
  {
    id: 'spam',
    title: 'Spam Email Detection',
    category: 'Natural Language Processing',
    description: '5% of all incoming emails are spam. A specific trigger word ("Win Free Cash") appears in 80% of spam emails, but also appears in 10% of legitimate (ham) emails.',
    prior: 5,
    likelihood: 80,
    evidence: 13.5, // (0.80 * 0.05) + (0.10 * 0.95) = 0.04 + 0.095 = 0.135 (13.5%)
    priorLabel: 'P(Spam) = 5%',
    likelihoodLabel: 'P(Word | Spam) = 80%',
    evidenceLabel: 'P(Word) = 13.5% (Total occurrence of word)',
    notes: 'Naive Bayes classifiers use this exact principle across thousands of words to filter spam with high accuracy.'
  },
  {
    id: 'fraud',
    title: 'Credit Card Fraud Detection',
    category: 'Financial Security',
    description: '0.5% of transactions are fraudulent. An anomaly detection system flags 98% of fraudulent transactions, but also incorrectly flags 2% of legitimate transactions as suspicious.',
    prior: 0.5,
    likelihood: 98,
    evidence: 2.48, // (0.98 * 0.005) + (0.02 * 0.995) = 0.0049 + 0.0199 = 0.0248 (2.48%)
    priorLabel: 'P(Fraud) = 0.5%',
    likelihoodLabel: 'P(Flagged | Fraud) = 98%',
    evidenceLabel: 'P(Flagged) = 2.48%',
    notes: 'Demonstrates why alert triage is critical in security: out of all flagged transactions, only ~19.76% are actual fraud, requiring secondary verification.'
  }
];

export default function App() {
  const priorInputId = useId();
  const likelihoodInputId = useId();
  const evidenceInputId = useId();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('bayesai_dark_mode');
    return saved !== null ? JSON.parse(saved) : true; // Default to dark mode for AI/ML vibe
  });

  const [activeTab, setActiveTab] = useState<'calculator' | 'examples' | 'howitworks' | 'conditional' | 'about' | 'presentation'>('calculator');

  // Calculator state (stored as percentages 0 to 100 for user friendliness)
  const [priorStr, setPriorStr] = useState<string>('20');
  const [likelihoodStr, setLikelihoodStr] = useState<string>('80');
  const [evidenceStr, setEvidenceStr] = useState<string>('40');

  // Error state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('bayesai_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Parsing and validation
  const priorNum = parseFloat(priorStr);
  const likelihoodNum = parseFloat(likelihoodStr);
  const evidenceNum = parseFloat(evidenceStr);

  const isValidInputs =
    !isNaN(priorNum) &&
    !isNaN(likelihoodNum) &&
    !isNaN(evidenceNum) &&
    priorStr.trim() !== '' &&
    likelihoodStr.trim() !== '' &&
    evidenceStr.trim() !== '' &&
    priorNum >= 0 &&
    priorNum <= 100 &&
    likelihoodNum >= 0 &&
    likelihoodNum <= 100 &&
    evidenceNum >= 0 &&
    evidenceNum <= 100;

  // Calculation logic
  let posteriorPercent = 0;
  let posteriorDecimal = 0;
  let stepNumerator = 0;

  if (isValidInputs) {
    if (evidenceNum === 0) {
      // handled in validation
    } else {
      const priorDec = priorNum / 100;
      const likelihoodDec = likelihoodNum / 100;
      const evidenceDec = evidenceNum / 100;

      stepNumerator = likelihoodDec * priorDec;
      posteriorDecimal = stepNumerator / evidenceDec;
      posteriorPercent = Math.min(Math.max(posteriorDecimal * 100, 0), 100);
    }
  }

  // Error validation check
  useEffect(() => {
    if (priorStr.trim() === '' || likelihoodStr.trim() === '' || evidenceStr.trim() === '') {
      setError('All probability fields are required.');
    } else if (isNaN(priorNum) || isNaN(likelihoodNum) || isNaN(evidenceNum)) {
      setError('Please enter valid numeric values for all probabilities.');
    } else if (priorNum < 0 || priorNum > 100 || likelihoodNum < 0 || likelihoodNum > 100 || evidenceNum < 0 || evidenceNum > 100) {
      setError('All probability values must be between 0% and 100% (0.0 to 1.0).');
    } else if (evidenceNum === 0) {
      setError('Probability of Evidence P(B) cannot be 0 (division by zero is undefined).');
    } else if (likelihoodNum * (priorNum / 100) > evidenceNum * 100 / 100 && evidenceNum > 0) {
      // Mathematical sanity check: P(B|A)*P(A) cannot exceed P(B) because P(B) >= P(B AND A) = P(B|A)P(A)
      // Note: user might input inconsistent P(B). Let's warn them or let Bayes theorem clamp/show warning.
      setError(null);
    } else {
      setError(null);
    }
  }, [priorStr, likelihoodStr, evidenceStr, priorNum, likelihoodNum, evidenceNum]);

  const handleReset = () => {
    setPriorStr('20');
    setLikelihoodStr('80');
    setEvidenceStr('40');
    setError(null);
  };

  const loadExample = (ex: ExampleScenario) => {
    setPriorStr(ex.prior.toString());
    setLikelihoodStr(ex.likelihood.toString());
    setEvidenceStr(ex.evidence.toString());
    setActiveTab('calculator');
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const scrollToCalculator = () => {
    setActiveTab('calculator');
    const el = document.getElementById('calculator-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* HEADER */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('calculator')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white font-black text-xl">
              Bγ
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                BayesAI
              </span>
              <span className={`block text-xs font-medium tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Bayes' Theorem Calculator & ML Project
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : darkMode ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('examples')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'examples'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : darkMode ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Examples
            </button>
            <button
              onClick={() => setActiveTab('howitworks')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'howitworks'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : darkMode ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              How It Works
            </button>
            <button
              onClick={() => setActiveTab('conditional')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'conditional'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : darkMode ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              Conditional Prob.
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'about'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : darkMode ? 'text-slate-300 hover:bg-slate-900' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Info className="w-4 h-4" />
              About Project
            </button>
            <button
              onClick={() => setActiveTab('presentation')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'presentation'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/20'
                  : darkMode ? 'text-purple-400 hover:bg-slate-900 border border-purple-500/30' : 'text-purple-600 hover:bg-purple-50 border border-purple-200'
              }`}
            >
              <Presentation className="w-4 h-4" />
              Presentation Mode
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
              className={`p-2.5 rounded-xl border transition-all ${
                darkMode
                  ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800'
                  : 'bg-white border-slate-200 text-indigo-600 hover:bg-slate-100 shadow-sm'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex overflow-x-auto px-4 py-2 border-t border-slate-200 dark:border-slate-800 gap-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'calculator' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('examples')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'examples' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Examples
          </button>
          <button
            onClick={() => setActiveTab('howitworks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'howitworks' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            How It Works
          </button>
          <button
            onClick={() => setActiveTab('conditional')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'conditional' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            Conditional Prob.
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'about' ? 'bg-indigo-600 text-white' : darkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-100 text-slate-700'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'presentation' ? 'bg-purple-600 text-white' : darkMode ? 'bg-slate-900 text-purple-400' : 'bg-purple-50 text-purple-700'
            }`}
          >
            Presentation
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      {activeTab === 'calculator' && (
        <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24 border-b border-slate-200 dark:border-slate-800">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-transparent pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-6">
              <Sparkles className="w-3.5 h-3.5" /> College Machine Learning & Probability Project
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto mb-6">
              Understand Probability with{' '}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                Bayes' Theorem
              </span>
            </h1>
            <p className={`text-lg sm:text-xl max-w-2xl mx-auto mb-10 font-normal ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Calculate conditional probabilities instantly and see how new evidence updates the probability of an event in machine learning and real-world inference.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={scrollToCalculator}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-xl shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center gap-3 text-base"
              >
                Try Calculator <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-8 py-4 rounded-xl font-bold border transition-all flex items-center gap-3 text-base ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800' : 'bg-white border-slate-300 text-slate-800 hover:bg-slate-100 shadow-sm'
                }`}
              >
                <BookOpen className="w-5 h-5 text-indigo-500" /> Explore Examples
              </button>
            </div>
          </div>
        </section>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'calculator' && (
          <div className="space-y-16" id="calculator-section">
            {/* BAYES THEOREM FORMULA CARD */}
            <div className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden ${darkMode ? 'bg-slate-900/90 border-slate-800 shadow-indigo-950/20' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="space-y-4 max-w-xl">
                  <div className="flex items-center gap-2 text-indigo-500 font-semibold text-sm">
                    <Brain className="w-4 h-4" /> Core Mathematical Formula
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Bayes' Theorem Equation</h2>
                  <div className={`p-4 rounded-2xl font-mono text-xl sm:text-2xl font-bold text-center lg:text-left border ${darkMode ? 'bg-slate-950/80 border-slate-800 text-indigo-400' : 'bg-indigo-50/50 border-indigo-100 text-indigo-700'}`}>
                    P(A|B) = [P(B|A) × P(A)] / P(B)
                  </div>
                  <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    Bayes' theorem describes the probability of an event, based on prior knowledge of conditions that might be related to the event. It is the mathematical foundation of Bayesian machine learning, spam filters, and diagnostic tests.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full lg:w-auto">
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs font-semibold text-indigo-500 mb-1">P(A)</div>
                    <div className="text-sm font-bold">Prior Probability</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Initial belief before evidence</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs font-semibold text-purple-500 mb-1">P(B|A)</div>
                    <div className="text-sm font-bold">Likelihood</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Chance of evidence if A is true</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs font-semibold text-pink-500 mb-1">P(B)</div>
                    <div className="text-sm font-bold">Evidence P(B)</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Total probability of evidence</div>
                  </div>
                  <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="text-xs font-semibold text-emerald-500 mb-1">P(A|B)</div>
                    <div className="text-sm font-bold">Posterior P(A|B)</div>
                    <div className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Updated probability after evidence</div>
                  </div>
                </div>
              </div>

              {/* Visual flow */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" /> Prior Probability P(A)
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> Evidence Likelihood P(B|A)
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 hidden sm:block" />
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Posterior Probability P(A|B)
                </div>
              </div>
            </div>

            {/* INTERACTIVE CALCULATOR GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* INPUTS COLUMN */}
              <div className={`lg:col-span-6 p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-md">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Probability Inputs</h3>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Enter values between 0% and 100%</p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <RefreshCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Validation Error</span>
                      {error}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Prior P(A) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={priorInputId} className="text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        Prior Probability P(A)
                      </label>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500">
                        {priorStr}% ({isValidInputs ? (priorNum / 100).toFixed(4) : '0.0000'})
                      </span>
                    </div>
                    <input
                      id={priorInputId}
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={priorNum}
                      onChange={(e) => setPriorStr(e.target.value)}
                      className="w-full accent-indigo-600 mb-2 cursor-pointer"
                    />
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={priorStr}
                        onChange={(e) => setPriorStr(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        placeholder="e.g. 20"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Probability of event A occurring overall before considering new evidence.
                    </p>
                  </div>

                  {/* Likelihood P(B|A) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={likelihoodInputId} className="text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Likelihood P(B|A)
                      </label>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-500">
                        {likelihoodStr}% ({isValidInputs ? (likelihoodNum / 100).toFixed(4) : '0.0000'})
                      </span>
                    </div>
                    <input
                      id={likelihoodInputId}
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={likelihoodNum}
                      onChange={(e) => setLikelihoodStr(e.target.value)}
                      className="w-full accent-purple-600 mb-2 cursor-pointer"
                    />
                    <div className="relative">
                      <input
                        id={likelihoodInputId}
                        type="number"
                        min="0"
                        max="100"
                        step="any"
                        value={likelihoodStr}
                        onChange={(e) => setLikelihoodStr(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        placeholder="e.g. 80"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Probability of observing evidence B given that event A is true.
                    </p>
                  </div>

                  {/* Evidence P(B) */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={evidenceInputId} className="text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        Probability of Evidence P(B)
                      </label>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-pink-500/10 text-pink-500">
                        {evidenceStr}% ({isValidInputs ? (evidenceNum / 100).toFixed(4) : '0.0000'})
                      </span>
                    </div>
                    <input
                      id={evidenceInputId}
                      type="range"
                      min="0.1"
                      max="100"
                      step="0.1"
                      value={evidenceNum}
                      onChange={(e) => setEvidenceStr(e.target.value)}
                      className="w-full accent-pink-600 mb-2 cursor-pointer"
                    />
                    <div className="relative">
                      <input
                        id={evidenceInputId}
                        type="number"
                        min="0.0001"
                        max="100"
                        step="any"
                        value={evidenceStr}
                        onChange={(e) => setEvidenceStr(e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 ${
                          darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                        }`}
                        placeholder="e.g. 40"
                      />
                      <span className="absolute right-4 top-2.5 text-xs font-bold text-slate-400">%</span>
                    </div>
                    <p className={`text-xs mt-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Total probability of observing evidence B across all scenarios (Law of Total Probability).
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                  <button
                    onClick={() => {
                      // Trigger calculate / scroll to results
                      const el = document.getElementById('results-panel');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    disabled={!isValidInputs}
                    className={`flex-1 py-3.5 px-6 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${
                      isValidInputs
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-600/30 hover:opacity-95'
                        : 'bg-slate-700 text-slate-400 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" /> Calculate Posterior P(A|B)
                  </button>
                </div>
              </div>

              {/* RESULTS & VISUALIZATION COLUMN */}
              <div className="lg:col-span-6 space-y-6" id="results-panel">
                {/* RESULT CARD */}
                <div className={`p-8 rounded-3xl border shadow-xl relative overflow-hidden flex flex-col justify-between ${darkMode ? 'bg-slate-900/90 border-slate-800 shadow-purple-950/20' : 'bg-white border-slate-200'}`}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
                        <Activity className="w-4 h-4" /> Posterior Probability Result
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Exact Calculation
                      </span>
                    </div>

                    <div className="text-center py-8">
                      <span className={`text-xs font-bold uppercase tracking-widest block mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        P(A | B) — Probability of A given Evidence B
                      </span>
                      {isValidInputs ? (
                        <div className="space-y-2">
                          <div className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            {posteriorPercent.toFixed(2)}%
                          </div>
                          <div className={`text-sm font-mono font-medium ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Decimal Value: <strong className="text-indigo-400">{posteriorDecimal.toFixed(4)}</strong>
                          </div>
                        </div>
                      ) : (
                        <div className="text-2xl font-bold text-red-500">
                          Invalid Inputs
                        </div>
                      )}
                    </div>

                    {/* COMPARISON PROGRESS BAR */}
                    <div className="space-y-3 mt-4">
                      <div className="flex justify-between text-xs font-semibold">
                        <span>Prior: {priorNum}%</span>
                        <span className="text-emerald-400">Posterior: {isValidInputs ? posteriorPercent.toFixed(1) : 0}%</span>
                      </div>
                      <div className={`w-full h-4 rounded-full overflow-hidden p-0.5 border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-500"
                          style={{ width: `${isValidInputs ? Math.min(posteriorPercent, 100) : 0}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>0%</span>
                        <span>50%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>

                  {/* SHIFT SUMMARY */}
                  {isValidInputs && (
                    <div className={`mt-6 p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 ${
                      posteriorPercent > priorNum
                        ? darkMode ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : posteriorPercent < priorNum
                        ? darkMode ? 'bg-amber-950/30 border-amber-800/50 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'
                        : darkMode ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}>
                      <Sparkles className="w-5 h-5 shrink-0" />
                      <div>
                        <strong>Inference Insight: </strong>
                        {posteriorPercent > priorNum
                          ? `Evidence B increased the probability of A by ${(posteriorPercent - priorNum).toFixed(2)} percentage points.`
                          : posteriorPercent < priorNum
                          ? `Evidence B decreased the probability of A by ${(priorNum - posteriorPercent).toFixed(2)} percentage points.`
                          : 'Evidence B had no net impact on the probability of A.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP BY STEP BREAKDOWN */}
                <div className={`p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-500" /> Step-by-Step Calculation
                  </h4>

                  {isValidInputs ? (
                    <div className="space-y-4 text-sm">
                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-bold text-indigo-400 block mb-1">Step 1: Calculate Numerator (Likelihood × Prior)</span>
                        <div className="font-mono text-xs sm:text-sm">
                          P(B|A) × P(A) = {(likelihoodNum / 100).toFixed(4)} × {(priorNum / 100).toFixed(4)} = <strong className="text-indigo-400">{stepNumerator.toFixed(4)}</strong>
                        </div>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-bold text-purple-400 block mb-1">Step 2: Divide by Evidence P(B)</span>
                        <div className="font-mono text-xs sm:text-sm">
                          P(A|B) = {stepNumerator.toFixed(4)} / {(evidenceNum / 100).toFixed(4)} = <strong className="text-purple-400">{posteriorDecimal.toFixed(4)}</strong>
                        </div>
                      </div>

                      <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="font-bold text-emerald-400 block mb-1">Step 3: Convert to Percentage</span>
                        <div className="font-mono text-xs sm:text-sm">
                          {posteriorDecimal.toFixed(4)} × 100% = <strong className="text-emerald-400 text-base">{posteriorPercent.toFixed(2)}%</strong>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Provide valid inputs to generate the step-by-step mathematical breakdown.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* QUICK LOAD PRESET EXAMPLES */}
            <div className={`p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold">Quick Presets</h3>
                  <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Click any scenario to load it directly into the calculator</p>
                </div>
                <button
                  onClick={() => setActiveTab('examples')}
                  className="text-xs font-bold text-indigo-500 hover:underline flex items-center gap-1"
                >
                  View All Examples <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {PRESET_EXAMPLES.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => loadExample(ex)}
                    className={`p-6 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.02] ${
                      darkMode
                        ? 'bg-slate-950/60 border-slate-800 hover:border-indigo-500/50 hover:bg-slate-950'
                        : 'bg-slate-50 border-slate-200 hover:border-indigo-500 hover:bg-white shadow-sm'
                    }`}
                  >
                    <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500 mb-3">
                      {ex.category}
                    </span>
                    <h4 className="text-lg font-bold mb-2 group-hover:text-indigo-400 transition-colors">{ex.title}</h4>
                    <p className={`text-xs leading-relaxed mb-4 line-clamp-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {ex.description}
                    </p>
                    <div className="flex items-center justify-between text-xs font-mono font-bold pt-4 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-indigo-400">Prior: {ex.prior}%</span>
                      <span className="text-purple-400">Likelihood: {ex.likelihood}%</span>
                      <span className="text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Load <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'examples' && (
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black">Real-World Bayes' Theorem Scenarios</h2>
              <p className={`text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Explore how Bayes' theorem solves ambiguity in medicine, cybersecurity, and natural language processing.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {PRESET_EXAMPLES.map((ex) => {
                const priorDec = ex.prior / 100;
                const likelihoodDec = ex.likelihood / 100;
                const evidenceDec = ex.evidence / 100;
                const calculatedPosterior = (likelihoodDec * priorDec) / evidenceDec * 100;

                return (
                  <div
                    key={ex.id}
                    className={`p-8 rounded-3xl border shadow-xl flex flex-col lg:flex-row gap-8 items-start justify-between ${
                      darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-4 max-w-2xl">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-500">
                        {ex.category}
                      </span>
                      <h3 className="text-2xl font-bold">{ex.title}</h3>
                      <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        {ex.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className={`p-3 rounded-xl border text-xs font-mono ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <strong className="block text-indigo-400 mb-1">Prior</strong>
                          {ex.priorLabel}
                        </div>
                        <div className={`p-3 rounded-xl border text-xs font-mono ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <strong className="block text-purple-400 mb-1">Likelihood</strong>
                          {ex.likelihoodLabel}
                        </div>
                        <div className={`p-3 rounded-xl border text-xs font-mono ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                          <strong className="block text-pink-400 mb-1">Evidence P(B)</strong>
                          {ex.evidenceLabel}
                        </div>
                      </div>

                      <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${darkMode ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-900'}`}>
                        <strong>Key Takeaway:</strong> {ex.notes}
                      </div>
                    </div>

                    <div className={`w-full lg:w-80 p-6 rounded-2xl border flex flex-col justify-between shrink-0 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Calculated Result</div>
                        <div className="text-4xl font-black text-emerald-400 mb-4">
                          {calculatedPosterior.toFixed(2)}%
                        </div>
                        <p className={`text-xs mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                          Posterior probability computed using exact law of total probability denominator.
                        </p>
                      </div>

                      <button
                        onClick={() => loadExample(ex)}
                        className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:opacity-95 transition-all flex items-center justify-center gap-2"
                      >
                        Load in Calculator <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'howitworks' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black">How Bayes' Theorem Works</h2>
              <p className={`text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                A 3-step intuitive framework for understanding conditional probability updates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-8 rounded-3xl border shadow-xl relative ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30 mb-6">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Start with Prior P(A)</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Before observing any evidence, what is our baseline belief or historical frequency of event A? For example, what percentage of emails are spam overall?
                </p>
              </div>

              <div className={`p-8 rounded-3xl border shadow-xl relative ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-purple-600/30 mb-6">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Gather Evidence P(B|A)</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Measure how frequently evidence B appears when event A is true (likelihood) compared to its overall occurrence across all situations (evidence).
                </p>
              </div>

              <div className={`p-8 rounded-3xl border shadow-xl relative ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-emerald-600/30 mb-6">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Update to Posterior P(A|B)</h3>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Multiply prior by likelihood and divide by evidence to compute the mathematically rigorous updated probability.
                </p>
              </div>
            </div>

            {/* Law of total probability info box */}
            <div className={`p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-500" /> The Law of Total Probability
              </h3>
              <p className={`text-sm leading-relaxed mb-4 ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                In many real-world problems, the denominator P(B) is not given directly. Instead, it is computed using mutually exclusive outcomes:
              </p>
              <div className={`p-4 rounded-2xl font-mono text-sm font-bold text-center border ${darkMode ? 'bg-slate-950 border-slate-800 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-700'}`}>
                P(B) = P(B|A)P(A) + P(B|¬A)P(¬A)
              </div>
            </div>
          </div>
        )}

        {activeTab === 'conditional' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black">Understanding Conditional Probability</h2>
              <p className={`text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                The mathematical bridge between independent events and dependent Bayesian updates.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
              <h3 className="text-2xl font-bold">What is Conditional Probability?</h3>
              <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Conditional probability measures the probability of an event occurring given that another event has already occurred. Denoted as <strong className="text-indigo-400">P(A|B)</strong> (read as "Probability of A given B").
              </p>

              <div className={`p-6 rounded-2xl border text-center font-mono text-lg font-bold ${darkMode ? 'bg-slate-950 border-slate-800 text-purple-400' : 'bg-indigo-50/50 border-indigo-100 text-purple-700'}`}>
                P(A|B) = P(A ∩ B) / P(B)
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-base mb-2 text-indigo-400">Joint Probability P(A ∩ B)</h4>
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    The probability that both event A and event B occur simultaneously.
                  </p>
                </div>
                <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                  <h4 className="font-bold text-base mb-2 text-purple-400">Marginal Probability P(B)</h4>
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    The total probability of event B occurring across all possible states of A.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black">About BayesAI Project</h2>
              <p className={`text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                A college-level machine learning project demonstrating probabilistic inference and Bayesian reasoning.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border shadow-xl space-y-6 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider block mb-1">Project Title</span>
                  <div className="text-lg font-bold">BayesAI – Bayes' Theorem Calculator</div>
                </div>
                <div>
                  <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block mb-1">Domain</span>
                  <div className="text-lg font-bold">Machine Learning / Probability</div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-lg mb-3">Project Purpose</h4>
                <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  "To demonstrate how Bayes' theorem is used to calculate conditional probabilities and update predictions based on new evidence in modern machine learning models and intelligent systems."
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <h4 className="font-bold text-lg mb-4">Real-World Applications</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Spam Detection', desc: 'Filtering emails using token probabilities.' },
                    { title: 'Medical Diagnosis', desc: 'Assessing disease probability from symptoms.' },
                    { title: 'Fraud Detection', desc: 'Flagging anomalous financial transactions.' },
                    { title: 'Weather Prediction', desc: 'Updating rain forecasts based on barometer readings.' },
                    { title: 'ML Classification', desc: 'Naive Bayes classifiers in scikit-learn.' },
                    { title: 'Recommendation Systems', desc: 'Predicting user preference given past behavior.' }
                  ].map((app, idx) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="font-bold text-sm mb-1 text-indigo-400">{app.title}</div>
                      <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>{app.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'presentation' && (
          <div className="space-y-12 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Award className="w-3.5 h-3.5" /> Student Presentation Guide
              </div>
              <h2 className="text-3xl sm:text-4xl font-black">Project Explanation Mode</h2>
              <p className={`text-base ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Designed for college students to easily explain Bayes' Theorem and demonstrate this project live to professors and peers.
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: '1. What is Bayes\' Theorem?',
                  a: 'Bayes\' Theorem is a mathematical formula for determining conditional probability. It tells us how to update the probability of a hypothesis (Prior) given new evidence (Likelihood).'
                },
                {
                  q: '2. Why is it useful in Machine Learning?',
                  a: 'Machine learning deals with uncertainty. Algorithms like Naive Bayes classifiers use Bayes\' Theorem to categorize data (like spam vs ham or cat vs dog images) by calculating probabilities across multiple features.'
                },
                {
                  q: '3. How does this calculator work?',
                  a: 'Users enter Prior P(A), Likelihood P(B|A), and Evidence P(B). The app performs exact floating-point arithmetic following P(A|B) = [P(B|A) × P(A)] / P(B) and renders real-time step-by-step math and visual progress bars.'
                },
                {
                  q: '4. Where can Bayes\' Theorem be applied?',
                  a: 'It is used everywhere from spam filters in email clients, COVID-19 diagnostic screening tests, self-driving car sensor fusion, to anomaly detection in banking.'
                }
              ].map((item, idx) => (
                <div key={idx} className={`p-8 rounded-3xl border shadow-xl ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-lg font-bold text-indigo-400 mb-3">{item.q}</h3>
                  <p className={`text-sm sm:text-base leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className={`mt-20 border-t py-12 transition-colors ${darkMode ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div>
            <div className="text-base font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              BayesAI – Bayes' Theorem Calculator
            </div>
            <p className="text-xs mt-1">College Machine Learning & Probability Project • Built for interactive learning</p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <button onClick={() => setActiveTab('calculator')} className="hover:text-indigo-500 transition-colors">Calculator</button>
            <button onClick={() => setActiveTab('examples')} className="hover:text-indigo-500 transition-colors">Examples</button>
            <button onClick={() => setActiveTab('presentation')} className="hover:text-indigo-500 transition-colors">Presentation Mode</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
