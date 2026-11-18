import React, { useState, useEffect } from 'react';
import {
  isSupabaseConnected,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  getSupabase
} from '../lib/supabaseClient';
import { FULL_SUPABASE_SCHEMA } from '../data/schemaText';
import {
  Database,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  X,
  Key,
  Globe,
  FileCode,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function SupabaseConfigModal({ isOpen, onClose }) {
  const isConnected = isSupabaseConnected();
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('tech_habba_supabase_url') || import.meta.env.VITE_SUPABASE_URL || 'https://pefazqsaqwcqperdgpas.supabase.co');
  const [supabaseKey, setSupabaseKey] = useState(() => localStorage.getItem('tech_habba_supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_f1ovBPyyeLeuJ_j044sxLw_Z8rrG5gz');
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState('instructions'); // 'instructions' | 'direct' | 'sql'
  const [testStatus, setTestStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      handleTestConnection();
    }
  }, [isOpen]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestStatus(null);
    try {
      const client = getSupabase();
      if (!client) {
        setTestStatus({ ok: false, msg: "Supabase client not initialized yet." });
        setTesting(false);
        return;
      }
      const { data, error } = await client.from('participants').select('count', { count: 'exact', head: true });
      if (error) {
        if (error.code === 'PGRST205') {
          setTestStatus({
            ok: true,
            warning: true,
            msg: "Connected to Supabase! (Notice: Tables not created yet. Please run the SQL schema in your Supabase SQL Editor.)"
          });
        } else {
          setTestStatus({ ok: false, msg: `Error: ${error.message} (${error.code})` });
        }
      } else {
        setTestStatus({ ok: true, msg: "Connected to Supabase! Database tables are live and ready." });
      }
    } catch (e) {
      setTestStatus({ ok: false, msg: `Connection error: ${e.message}` });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    if (supabaseUrl && supabaseKey) {
      saveCustomSupabaseConfig(supabaseUrl, supabaseKey);
    }
  };

  const handleCopyEnv = () => {
    const content = `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${supabaseKey}`;
    navigator.clipboard.writeText(content);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-navy-900 border border-electric-500/40 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-electric-500/10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-navy-800 flex items-center justify-between bg-navy-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-500/20 to-cyber-cyan/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Supabase Database Configuration</span>
                {isConnected ? (
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>Connected</span>
                  </span>
                ) : (
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>Local Mode</span>
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Connected to <span className="text-cyan-400 font-mono">pefazqsaqwcqperdgpas.supabase.co</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-750 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Status Alert Box */}
        {testStatus && (
          <div className={`px-5 py-2.5 text-xs flex items-center justify-between border-b ${
            testStatus.warning
              ? 'bg-amber-950/40 border-amber-500/30 text-amber-300'
              : testStatus.ok
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center space-x-2">
              {testStatus.ok && !testStatus.warning ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>{testStatus.msg}</span>
            </div>
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="text-[11px] underline font-medium hover:text-white shrink-0 ml-2"
            >
              {testing ? 'Testing...' : 'Re-test'}
            </button>
          </div>
        )}

        {/* Tab switcher */}
        <div className="flex border-b border-navy-800 px-5 bg-navy-900">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'instructions'
                ? 'border-electric-500 text-electric-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection Status & Setup
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'sql'
                ? 'border-electric-500 text-electric-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Database SQL Schema (Run in Supabase)
          </button>
          <button
            onClick={() => setActiveTab('direct')}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition ${
              activeTab === 'direct'
                ? 'border-electric-500 text-electric-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Edit Credentials
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="bg-navy-850 border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Your Supabase Project is Connected!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Your credentials have been added to <code className="text-cyan-300 bg-navy-950 px-1.5 py-0.5 rounded border border-navy-700">.env</code>:
                </p>
                <div className="relative bg-navy-950 border border-navy-800 rounded-lg p-3 font-mono text-xs text-slate-200">
                  <pre className="overflow-x-auto text-[11px]">
{`VITE_SUPABASE_URL=https://pefazqsaqwcqperdgpas.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_f1ovBPyyeLeuJ_j044sxLw_Z8rrG5gz`}
                  </pre>
                  <button
                    onClick={handleCopyEnv}
                    className="absolute top-2 right-2 px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white text-[11px] flex items-center space-x-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedEnv ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="bg-navy-850 border border-navy-750 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-cyan-500 text-navy-950 font-bold text-xs flex items-center justify-center">!</span>
                  <span>Next Step: Create the Database Tables</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  To complete the setup, execute the pre-configured SQL script in your Supabase Dashboard:
                </p>
                <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed mb-4">
                  <li>Go to your Supabase project: <a href="https://supabase.com/dashboard/project/pefazqsaqwcqperdgpas/sql" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline inline-flex items-center space-x-1 font-mono"><span>pefazqsaqwcqperdgpas / SQL Editor</span><ExternalLink className="w-3 h-3 inline" /></a></li>
                  <li>Click <strong>"New Query"</strong>.</li>
                  <li>Click the button below to copy the full SQL script, paste it into the editor, and click <strong>"Run"</strong>.</li>
                </ol>

                <button
                  onClick={() => {
                    handleCopySql();
                    setActiveTab('sql');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-electric-600 to-cyan-500 hover:from-electric-500 hover:to-cyan-400 text-white font-bold text-xs tracking-wider transition shadow-lg shadow-electric-600/20 flex items-center justify-center space-x-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy SQL Script & View Schema</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-300">
                  Run this in your <a href="https://supabase.com/dashboard/project/pefazqsaqwcqperdgpas/sql" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline font-semibold">Supabase SQL Editor</a> to create all 4 tables and insert all 25 questions:
                </p>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs flex items-center space-x-1.5 font-bold transition shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy Full SQL'}</span>
                </button>
              </div>

              <div className="bg-navy-950 border border-navy-800 rounded-xl p-3.5 max-h-72 overflow-y-auto font-mono text-[11px] text-slate-300">
                <pre>{FULL_SUPABASE_SCHEMA.slice(0, 1500) + "\n... [Remaining 25 questions and policies included] ..."}</pre>
              </div>
            </div>
          )}

          {activeTab === 'direct' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5 text-electric-400" />
                  <span>Supabase Project URL</span>
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-electric-400" />
                  <span>Supabase Publishable / Anon API Key</span>
                </label>
                <textarea
                  rows={3}
                  value={supabaseKey}
                  onChange={(e) => setSupabaseKey(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-750 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-electric-600 to-cyan-500 hover:from-electric-500 hover:to-cyan-400 text-white font-semibold text-xs tracking-wider transition shadow-lg shadow-cyan-500/20"
                >
                  Save & Apply Connection
                </button>
                {localStorage.getItem('tech_habba_supabase_url') && (
                  <button
                    type="button"
                    onClick={clearCustomSupabaseConfig}
                    className="py-2.5 px-4 rounded-xl bg-navy-800 hover:bg-navy-750 border border-navy-750 text-slate-300 text-xs font-semibold transition"
                  >
                    Reset to .env Defaults
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-navy-950 border-t border-navy-800 flex justify-between items-center text-xs text-slate-400">
          <span className="text-emerald-400">Connected to https://pefazqsaqwcqperdgpas.supabase.co</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-white font-medium transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
