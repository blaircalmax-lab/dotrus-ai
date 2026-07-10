'use client';

import { useState, useEffect } from 'react';

interface HistoryItem {
  id: number;
  type: string;
  timestamp: string;
  result: any;
}

// ✅ Correct Railway Backend URL
const BACKEND_URL = "https://dotrus-ai-production.up.railway.app";

export default function DotrusGrantAI() {
  const [activeTab, setActiveTab] = useState<'rfp' | 'score' | 'draft' | 'budget' | 'logframe' | 'review' | 'eligibility' | 'donor'>('rfp');
  const [rfpText, setRfpText] = useState('');
  const [orgProfile, setOrgProfile] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [userEmail, setUserEmail] = useState('guest@dotrus.ai');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [toast, setToast] = useState('');
  const [savedAnalyses, setSavedAnalyses] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'RFP Analysis' | 'Proposal Scoring' | 'Proposal Draft'>('all');

  useEffect(() => {
    const saved = localStorage.getItem('dotrus_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(''), 2500);
  };

  const saveToHistory = (type: string, resultData: any) => {
    const newItem: HistoryItem = {
      id: Date.now(),
      type,
      timestamp: new Date().toLocaleString(),
      result: resultData
    };
    const updated = [newItem, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('dotrus_history', JSON.stringify(updated));
    showToast("Saved to history");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'rfp' | 'proposal') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setStatusMessage(`Extracting text from ${file.name}...`);

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-file`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (data.success) {
        if (target === 'rfp') setRfpText(data.text);
        else setProposalText(data.text);
        setStatusMessage(`File loaded: ${file.name}`);
        showToast("File uploaded successfully");
      } else {
        alert("Failed to extract text");
      }
    } catch (error) {
      alert("Error uploading file");
    }
    setLoading(false);
  };

  const clearAll = () => {
    setRfpText('');
    setOrgProfile('');
    setProposalText('');
    setResult(null);
    setStatusMessage('');
    setSavedAnalyses([]);
    setFilterType('all');
    showToast("All fields cleared");
  };

  const analyzeRFP = async () => {
    if (!rfpText.trim()) return alert("Please paste or upload RFP text");

    setLoading(true);
    setStatusMessage("Analyzing RFP with AI...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/analyze-rfp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          organization_profile: orgProfile,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Analysis complete!");
      saveToHistory('RFP Analysis', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const scoreProposal = async () => {
    if (!rfpText.trim() || !proposalText.trim()) {
      return alert("Please paste or upload both RFP and Proposal text");
    }

    setLoading(true);
    setStatusMessage("Scoring proposal against RFP...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/score-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          proposal_text: proposalText,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Scoring complete!");
      saveToHistory('Proposal Scoring', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const generateDraft = async () => {
    if (!rfpText.trim()) return alert("Please paste or upload RFP text first");

    setLoading(true);
    setStatusMessage("Generating proposal draft...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          organization_profile: orgProfile,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Draft generated!");
      saveToHistory('Proposal Draft', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const generateBudget = async () => {
    if (!rfpText.trim()) return alert("Please paste or upload RFP text first");

    setLoading(true);
    setStatusMessage("Generating budget...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          organization_profile: orgProfile,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Budget generated!");
      saveToHistory('Budget', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const generateLogframe = async () => {
    if (!rfpText.trim()) return alert("Please paste or upload RFP text first");

    setLoading(true);
    setStatusMessage("Generating Logframe...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/generate-logframe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          organization_profile: orgProfile,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Logframe generated!");
      saveToHistory('Logframe', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const reviewProposal = async () => {
    if (!proposalText.trim()) return alert("Please paste a proposal draft");

    setLoading(true);
    setStatusMessage("Reviewing proposal...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/review-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          proposal_text: proposalText, 
          rfp_text: rfpText,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Review complete!");
      saveToHistory('Proposal Review', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const checkEligibility = async () => {
    if (!rfpText.trim()) return alert("Please paste or upload RFP text");

    setLoading(true);
    setStatusMessage("Checking eligibility...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/check-eligibility`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          organization_profile: orgProfile,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Eligibility check complete!");
      saveToHistory('Eligibility Check', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const getDonorIntelligence = async () => {
    if (!rfpText.trim()) return alert("Please paste or upload RFP text");

    setLoading(true);
    setStatusMessage("Analyzing donor...");
    setResult(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/donor-intelligence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rfp_text: rfpText, 
          organization_profile: orgProfile,
          user_email: userEmail
        })
      });
      const data = await res.json();
      setResult(data);
      setStatusMessage("Donor analysis complete!");
      saveToHistory('Donor Intelligence', data);
    } catch (error) {
      alert("Error connecting to backend");
      setStatusMessage("");
    }
    setLoading(false);
  };

  const copyResults = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result, null, 2));
    setCopied(true);
    showToast("Results copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const loadFromHistory = (item: HistoryItem) => {
    setResult(item.result);
    setStatusMessage(`Loaded from history (${item.type})`);
    showToast("Loaded from history");
  };

  const loadMyAnalyses = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/my-analyses?email=${userEmail}`);
      const data = await res.json();
      
      if (data.success) {
        setSavedAnalyses(data.analyses);
        showToast(`Loaded ${data.analyses.length} analyses`);
      }
    } catch (error) {
      alert("Error loading analyses from database");
    }
  };

  const deleteAnalysis = async (id: number, index: number) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/delete-analysis?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const updatedList = savedAnalyses.filter((_, i) => i !== index);
        setSavedAnalyses(updatedList);
        showToast("Analysis deleted successfully");
      } else {
        alert(`Delete failed: ${data.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to connect to backend.");
    }
  };

  const filteredAnalyses = filterType === 'all' 
    ? savedAnalyses 
    : savedAnalyses.filter(item => item.type === filterType);

  const renderRFPAnalysis = (analysis: any) => {
    if (!analysis) return null;
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <p className="text-xs text-zinc-400">PROJECT TITLE</p>
            <p className="font-semibold mt-1 text-xl">{analysis.project_title}</p>
          </div>
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <p className="text-xs text-zinc-400">DONOR</p>
            <p className="font-semibold mt-1 text-xl">{analysis.donor}</p>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
          <p className="font-semibold mb-4 text-lg">Evaluation Criteria</p>
          {analysis.evaluation_criteria?.map((c: any, i: number) => (
            <div key={i} className="flex justify-between py-3 border-b border-zinc-700 last:border-none">
              <span>{c.name}</span>
              <span className="font-mono text-emerald-400 font-medium">{c.weight}</span>
            </div>
          ))}
        </div>

        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
          <p className="font-semibold mb-3 text-lg">Eligibility Criteria</p>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            {analysis.eligibility_criteria?.map((item: string, i: number) => <li key={i}>{item}</li>)}
          </ul>
        </div>
      </div>
    );
  };

  const renderScoring = (scoring: any) => {
    if (!scoring) return null;
    return (
      <div className="space-y-8">
        <div className="flex items-end gap-6">
          <div className="text-7xl font-bold text-emerald-400 tabular-nums tracking-tighter">{scoring.overall_score}</div>
          <div className="pb-3">
            <p className="text-2xl font-semibold">Overall Score</p>
            <p className="text-sm text-zinc-400">out of 100</p>
          </div>
        </div>

        <div className="bg-zinc-800 p-6 rounded-2xl border border-zinc-700">
          <p className="font-semibold mb-5 text-lg">Criteria Scores</p>
          {scoring.criteria_scores?.map((c: any, i: number) => (
            <div key={i} className="mb-5 last:mb-0">
              <div className="flex justify-between text-sm mb-1.5">
                <span>{c.name}</span>
                <span className="font-mono font-medium">{c.score}</span>
              </div>
              <div className="h-2.5 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-2.5 bg-emerald-400 rounded-full transition-all" style={{ width: `${c.score}%` }}></div>
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">{c.justification}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <p className="font-semibold text-emerald-400 mb-3">Strengths</p>
            <ul className="text-sm space-y-1.5">{scoring.strengths?.map((s: string, i: number) => <li key={i}>• {s}</li>)}</ul>
          </div>
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <p className="font-semibold text-red-400 mb-3">Weaknesses</p>
            <ul className="text-sm space-y-1.5">{scoring.weaknesses?.map((w: string, i: number) => <li key={i}>• {w}</li>)}</ul>
          </div>
          <div className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700">
            <p className="font-semibold text-amber-400 mb-3">Recommendations</p>
            <ul className="text-sm space-y-1.5">{scoring.recommendations?.map((r: string, i: number) => <li key={i}>• {r}</li>)}</ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold tracking-tighter">Dotrus Grant AI</h1>
            <p className="text-zinc-400 mt-1 text-lg">Grant Intelligence Platform</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">Stage 1 • MVP</div>
            <button onClick={clearAll} className="text-sm px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full transition">
              Clear All
            </button>
          </div>
        </div>

        {/* User Email Input */}
        <div className="mb-8 max-w-md">
          <label className="block text-sm font-medium mb-1.5">Your Email</label>
          <input 
            type="email" 
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-zinc-600"
            placeholder="your@email.com"
          />
          <p className="text-xs text-zinc-500 mt-1.5">Used to save and retrieve your analyses</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-zinc-800 pb-1">
          <button onClick={() => { setActiveTab('rfp'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'rfp' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Analyze RFP
          </button>
          <button onClick={() => { setActiveTab('score'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'score' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Score Proposal
          </button>
          <button onClick={() => { setActiveTab('draft'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'draft' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Generate Draft
          </button>
          <button onClick={() => { setActiveTab('budget'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'budget' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Budget Generator
          </button>
          <button onClick={() => { setActiveTab('logframe'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'logframe' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Logframe
          </button>
          <button onClick={() => { setActiveTab('review'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'review' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Proposal Reviewer
          </button>
          <button onClick={() => { setActiveTab('eligibility'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'eligibility' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Eligibility Checker
          </button>
          <button onClick={() => { setActiveTab('donor'); setResult(null); setStatusMessage(''); }}
            className={`px-6 py-3 rounded-t-lg font-medium transition ${activeTab === 'donor' ? 'bg-white text-black' : 'hover:bg-zinc-900 text-zinc-300'}`}>
            Donor Intelligence
          </button>
        </div>

        {/* Status / Error Message */}
        {statusMessage && (
          <div className={`mb-6 px-5 py-3 rounded-2xl text-sm flex items-center gap-3 ${
            statusMessage.includes("quota") || statusMessage.includes("Error") 
              ? "bg-red-950 text-red-300 border border-red-900" 
              : "bg-emerald-950 text-emerald-300 border border-emerald-900"
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              statusMessage.includes("quota") || statusMessage.includes("Error") 
                ? "bg-red-400" 
                : "bg-emerald-400"
            }`}></div>
            {statusMessage}
          </div>
        )}

        {/* RFP Tab */}
        {activeTab === 'rfp' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:border-zinc-600" placeholder="Paste RFP text or upload a file..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization Profile (Optional)</label>
              <textarea value={orgProfile} onChange={(e) => setOrgProfile(e.target.value)}
                className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm" placeholder="Brief description of your organization..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={analyzeRFP} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Analyzing..." : "Analyze RFP"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Score Tab */}
        {activeTab === 'score' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-56 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste or upload RFP..." />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Proposal Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'proposal')} />
                </label>
              </div>
              <textarea value={proposalText} onChange={(e) => setProposalText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste or upload proposal..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={scoreProposal} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Scoring..." : "Score Proposal"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Generate Draft Tab */}
        {activeTab === 'draft' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste RFP text..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization Profile (Optional)</label>
              <textarea value={orgProfile} onChange={(e) => setOrgProfile(e.target.value)}
                className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm" placeholder="Brief description of your organization..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={generateDraft} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Generating Draft..." : "Generate Proposal Draft"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Budget Generator Tab */}
        {activeTab === 'budget' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste RFP text..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization Profile (Optional)</label>
              <textarea value={orgProfile} onChange={(e) => setOrgProfile(e.target.value)}
                className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm" placeholder="Brief description of your organization..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={generateBudget} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Generating Budget..." : "Generate Budget"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Logframe Tab */}
        {activeTab === 'logframe' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste RFP text..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization Profile (Optional)</label>
              <textarea value={orgProfile} onChange={(e) => setOrgProfile(e.target.value)}
                className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm" placeholder="Brief description of your organization..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={generateLogframe} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Generating Logframe..." : "Generate Logframe"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Proposal Reviewer Tab */}
        {activeTab === 'review' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text (Optional)</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste RFP text (optional)..." />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Proposal Draft</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'proposal')} />
                </label>
              </div>
              <textarea value={proposalText} onChange={(e) => setProposalText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste your proposal draft here..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={reviewProposal} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Reviewing..." : "Review Proposal"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Eligibility Checker Tab */}
        {activeTab === 'eligibility' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste RFP text..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization Profile</label>
              <textarea value={orgProfile} onChange={(e) => setOrgProfile(e.target.value)}
                className="w-full h-48 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm" placeholder="Brief description of your organization..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={checkEligibility} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Checking..." : "Check Eligibility"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Donor Intelligence Tab */}
        {activeTab === 'donor' && (
          <div className="space-y-6 max-w-4xl">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">RFP Text</label>
                <label className="text-xs px-4 py-1.5 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-700 transition">
                  Upload PDF / DOCX / TXT
                  <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => handleFileUpload(e, 'rfp')} />
                </label>
              </div>
              <textarea value={rfpText} onChange={(e) => setRfpText(e.target.value)}
                className="w-full h-72 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 font-mono text-sm" placeholder="Paste RFP text..." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organization Profile (Optional)</label>
              <textarea value={orgProfile} onChange={(e) => setOrgProfile(e.target.value)}
                className="w-full h-24 bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-sm" placeholder="Brief description of your organization..." />
            </div>

            <div className="flex gap-4 pt-2">
              <button onClick={getDonorIntelligence} disabled={loading}
                className="flex-1 bg-white text-black py-4 rounded-2xl font-semibold hover:bg-zinc-200 disabled:opacity-50 transition text-lg">
                {loading ? "Analyzing Donor..." : "Analyze Donor"}
              </button>
              <button onClick={clearAll} className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700">
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-12 max-w-5xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-2xl">Results</h3>
              <button onClick={copyResults} className="px-5 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-xl transition">
                {copied ? "Copied!" : "Copy Results"}
              </button>
            </div>
            {result.analysis && renderRFPAnalysis(result.analysis)}
            {result.scoring && renderScoring(result.scoring)}
            {result.draft && (
              <div className="bg-zinc-800 p-7 rounded-2xl border border-zinc-700">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result.draft, null, 2)}</pre>
              </div>
            )}
            {result.budget && (
              <div className="bg-zinc-800 p-7 rounded-2xl border border-zinc-700">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result.budget, null, 2)}</pre>
              </div>
            )}
            {result.logframe && (
              <div className="bg-zinc-800 p-7 rounded-2xl border border-zinc-700">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result.logframe, null, 2)}</pre>
              </div>
            )}
            {result.review && (
              <div className="bg-zinc-800 p-7 rounded-2xl border border-zinc-700">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result.review, null, 2)}</pre>
              </div>
            )}
            {result.eligibility && (
              <div className="bg-zinc-800 p-7 rounded-2xl border border-zinc-700">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result.eligibility, null, 2)}</pre>
              </div>
            )}
            {result.donor_intelligence && (
              <div className="bg-zinc-800 p-7 rounded-2xl border border-zinc-700">
                <pre className="whitespace-pre-wrap text-sm leading-relaxed">{JSON.stringify(result.donor_intelligence, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* My Saved Analyses from Database */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-xl">My Saved Analyses</h3>
            <button 
              onClick={loadMyAnalyses}
              className="text-sm px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Load My Analyses
            </button>
          </div>

          {/* Filter Buttons */}
          {savedAnalyses.length > 0 && (
            <div className="flex gap-2 mb-4">
              <button 
                onClick={() => setFilterType('all')}
                className={`px-4 py-1.5 text-sm rounded-lg transition ${filterType === 'all' ? 'bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilterType('RFP Analysis')}
                className={`px-4 py-1.5 text-sm rounded-lg transition ${filterType === 'RFP Analysis' ? 'bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                RFP Analysis
              </button>
              <button 
                onClick={() => setFilterType('Proposal Scoring')}
                className={`px-4 py-1.5 text-sm rounded-lg transition ${filterType === 'Proposal Scoring' ? 'bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                Proposal Scoring
              </button>
              <button 
                onClick={() => setFilterType('Proposal Draft')}
                className={`px-4 py-1.5 text-sm rounded-lg transition ${filterType === 'Proposal Draft' ? 'bg-white text-black' : 'bg-zinc-800 hover:bg-zinc-700'}`}
              >
                Proposal Draft
              </button>
            </div>
          )}

          {filteredAnalyses.length > 0 && (
            <div className="space-y-3">
              {filteredAnalyses.map((item, index) => {
                const projectTitle = item.result?.analysis?.project_title || 
                                    item.result?.draft?.title || 
                                    null;

                return (
                  <div 
                    key={index}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl hover:bg-zinc-800 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div 
                        onClick={() => {
                          setResult(item.result);
                          setStatusMessage(`Loaded saved ${item.type}`);
                        }}
                        className="flex-1 cursor-pointer pr-4"
                      >
                        <div className="font-medium">{item.type}</div>
                        {projectTitle && (
                          <div className="text-sm text-emerald-400 mt-1">{projectTitle}</div>
                        )}
                        <div className="text-xs text-zinc-500 mt-1">
                          {new Date(item.created_at).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0">
                        <button 
                          onClick={() => {
                            setResult(item.result);
                            setStatusMessage(`Loaded saved ${item.type}`);
                          }}
                          className="text-xs px-3 py-1 bg-zinc-800 hover:bg-zinc-700 rounded"
                        >
                          Load
                        </button>
                        <button 
                          onClick={() => deleteAnalysis(item.id, index)}
                          className="text-xs px-3 py-1 bg-red-900 hover:bg-red-800 rounded text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {savedAnalyses.length === 0 && (
            <p className="text-sm text-zinc-400">No analyses loaded yet. Click the button above.</p>
          )}
        </div>

        {/* Local History */}
        {history.length > 0 && (
          <div className="mt-10">
            <h3 className="font-semibold mb-4 text-xl">Recent Activity (Local)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {history.map((item) => (
                <button key={item.id} onClick={() => loadFromHistory(item)}
                  className="text-left bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 p-5 rounded-2xl transition flex justify-between items-center">
                  <span className="font-medium">{item.type}</span>
                  <span className="text-xs text-zinc-500">{item.timestamp}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-800 text-white px-6 py-3 rounded-2xl border border-zinc-700 shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}