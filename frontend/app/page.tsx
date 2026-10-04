"use client";

import React, { useState, useEffect, useCallback } from "react";
import DossierSync from "@/components/DossierSync";
import {
  Sprout,
  ShieldAlert,
  TrendingUp,
  Radio,
  MapPin,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  Send,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from "lucide-react";

import { getApiUrl } from "@/utils/api";

interface SyncDossier {
  id: string;
  farmer_id: string;
  farmer_name: string;
  crop_type: string;
  offline_diagnosis: string;
  symptoms_description?: string;
  geo_lat: number;
  geo_lon: number;
  altitude_m?: number;
  client_recorded_at?: string;
  synced_at: string;
  advisory_summary?: string;
  recommended_action?: string;
  urgency_level?: string;
  market_context?: string;
  status: string;
}

interface DashboardStats {
  total_dossiers: number;
  critical_alerts: number;
  high_urgency: number;
  medium_urgency: number;
  low_urgency: number;
  active_farmers: number;
  market_price_parchment: string;
  mesh_status: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<"officer" | "farmer" | "architecture">("officer");
  const [dossiers, setDossiers] = useState<SyncDossier[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDossier, setSelectedDossier] = useState<SyncDossier | null>(null);

  // Fetch dossiers and stats from backend
  const fetchData = useCallback(async () => {
    setLoading(true);
    const resolvedApiUrl = getApiUrl();
    try {
      const [dossiersRes, statsRes] = await Promise.all([
        fetch(`${resolvedApiUrl}/api/sync/dossiers?limit=50`),
        fetch(`${resolvedApiUrl}/api/sync/stats`),
      ]);

      if (dossiersRes.ok) {
        const data = await dossiersRes.json();
        setDossiers(data);
        if (data.length > 0 && !selectedDossier) {
          setSelectedDossier(data[0]);
        }
      }

      if (statsRes.ok) {
        const sData = await statsRes.json();
        setStats(sData);
      }
    } catch (err) {
      console.warn("Could not reach backend API at", resolvedApiUrl, err);
    } finally {
      setLoading(false);
    }
  }, [selectedDossier]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter dossiers
  const filteredDossiers = dossiers.filter((d) => {
    const matchesUrgency =
      urgencyFilter === "ALL" || d.urgency_level?.toUpperCase() === urgencyFilter;
    const matchesSearch =
      d.farmer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.crop_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.offline_diagnosis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.symptoms_description && d.symptoms_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesUrgency && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#051A11] text-[#F0FDF4] pb-16">
      {/* Top Agricultural Navigation Header */}
      <header className="border-b border-[#13422E] bg-[#0A281B]/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-[#0F382A] p-2 flex items-center justify-center border border-emerald-400/40 shadow-lg">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  KrishiKotha AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  World Bank Small AI
                </span>
              </div>
              <p className="text-xs text-emerald-300/70">
                Offline-First Multi-Agent Agronomic Mesh &bull; Bandarban Hill Tracts
              </p>
            </div>
          </div>

          {/* Highlands Micro-Climate & Market Pricing Ticker */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#051A11] border border-[#13422E]">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300/80">LoRa Gateway:</span>
              <span className="text-emerald-300 font-semibold">Active</span>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#051A11] border border-[#13422E]">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-emerald-300/80">Arabica Gr. 1:</span>
              <span className="text-amber-300 font-bold">$3.85 / kg</span>
            </div>

            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="p-2 rounded-lg bg-[#0F382A] hover:bg-emerald-800/50 border border-[#1B5E20] transition-colors"
              title="Refresh Dashboard"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-emerald-300 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#13422E] pb-2">
          <button
            onClick={() => setActiveTab("officer")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "officer"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-emerald-300/80 hover:bg-[#0A281B] hover:text-white"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>District Extension Officer Command Center</span>
            {dossiers.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-950 text-emerald-200 border border-emerald-700">
                {dossiers.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("farmer")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "farmer"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-emerald-300/80 hover:bg-[#0A281B] hover:text-white"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Farmer Noor Field Terminal (Offline Edge)</span>
          </button>

          <button
            onClick={() => setActiveTab("architecture")}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "architecture"
                ? "bg-emerald-600 text-white shadow-lg"
                : "text-emerald-300/80 hover:bg-[#0A281B] hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Multi-Agent Architecture</span>
          </button>
        </div>

        {/* Global Key Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0A281B] border border-[#13422E] rounded-xl p-4">
            <p className="text-xs text-emerald-300/70">Synced Dossiers</p>
            <p className="text-2xl font-black text-white mt-1">
              {stats?.total_dossiers ?? dossiers.length}
            </p>
            <span className="text-[10px] text-emerald-400">PostgreSQL Store-and-Forward</span>
          </div>

          <div className="bg-[#0A281B] border border-[#13422E] rounded-xl p-4">
            <p className="text-xs text-amber-300/70">Critical / High Alerts</p>
            <p className="text-2xl font-black text-amber-400 mt-1">
              {(stats?.critical_alerts ?? 0) + (stats?.high_urgency ?? 0)}
            </p>
            <span className="text-[10px] text-amber-400/80">Requires Extension Officer Visit</span>
          </div>

          <div className="bg-[#0A281B] border border-[#13422E] rounded-xl p-4">
            <p className="text-xs text-emerald-300/70">Active Smallholders</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">
              {stats?.active_farmers ?? 1}
            </p>
            <span className="text-[10px] text-emerald-400">Ondera Highlands Sector 4</span>
          </div>

          <div className="bg-[#0A281B] border border-[#13422E] rounded-xl p-4">
            <p className="text-xs text-emerald-300/70">Fair-Trade Parchment Benchmark</p>
            <p className="text-2xl font-black text-white mt-1">$3.85 / kg</p>
            <span className="text-[10px] text-emerald-400">Cooperative Protected Floor</span>
          </div>
        </div>

        {/* TAB 1: District Extension Officer Command Center */}
        {activeTab === "officer" && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="bg-[#0A281B] border border-[#13422E] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-emerald-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search farmer, coffee variety, symptoms, diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#051A11] border border-[#13422E] rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                <Filter className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                <span className="text-xs text-emerald-300/80">Urgency:</span>
                {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setUrgencyFilter(level)}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      urgencyFilter === level
                        ? level === "CRITICAL"
                          ? "bg-red-600 text-white font-bold"
                          : level === "HIGH"
                          ? "bg-amber-600 text-white font-bold"
                          : "bg-emerald-600 text-white font-bold"
                        : "bg-[#051A11] text-emerald-300/80 hover:bg-[#0F382A]"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Split Master-Detail Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Dossier Stream (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Incoming Synchronized Dossiers ({filteredDossiers.length})
                  </h3>
                  <span className="text-[11px] text-emerald-300/60">
                    Store-and-Forward Stream
                  </span>
                </div>

                {filteredDossiers.length === 0 ? (
                  <div className="bg-[#0A281B] border border-[#13422E] rounded-2xl p-8 text-center space-y-3">
                    <Info className="w-8 h-8 text-emerald-500 mx-auto" />
                    <p className="text-sm text-emerald-200">
                      No dossiers matched your criteria.
                    </p>
                    <p className="text-xs text-emerald-400/60">
                      Switch to the &quot;Farmer Noor Field Terminal&quot; tab to input a field observation or check if backend is running.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                    {filteredDossiers.map((d) => {
                      const isSelected = selectedDossier?.id === d.id;
                      const urgency = d.urgency_level?.toUpperCase() || "MEDIUM";

                      return (
                        <div
                          key={d.id}
                          onClick={() => setSelectedDossier(d)}
                          className={`p-4 rounded-xl cursor-pointer transition-all border ${
                            isSelected
                              ? "bg-gradient-to-r from-[#0F382A] to-[#0A281B] border-emerald-400 shadow-xl ring-1 ring-emerald-400/30"
                              : "bg-[#0A281B] border-[#13422E] hover:border-emerald-700/60"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white text-sm">
                                {d.farmer_name}
                              </span>
                              <span className="text-[11px] text-emerald-300/70">
                                &bull; {d.crop_type}
                              </span>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                urgency === "CRITICAL"
                                  ? "bg-red-950 text-red-300 border border-red-800"
                                  : urgency === "HIGH"
                                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              }`}
                            >
                              {urgency}
                            </span>
                          </div>

                          <p className="text-xs text-emerald-200 mt-2 font-medium line-clamp-1">
                            {d.offline_diagnosis}
                          </p>

                          {d.symptoms_description && (
                            <p className="text-[11px] text-emerald-400/70 italic mt-0.5 line-clamp-1">
                              &ldquo;{d.symptoms_description}&rdquo;
                            </p>
                          )}

                          <div className="flex items-center justify-between text-[10px] text-emerald-400/60 mt-3 pt-2 border-t border-[#13422E]/60">
                            <span className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {d.geo_lat}, {d.geo_lon} ({d.altitude_m || 1840}m)
                            </span>
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {new Date(d.synced_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Claude AI Agronomic Advisory Detail (7 cols) */}
              <div className="lg:col-span-7">
                {selectedDossier ? (
                  <div className="bg-[#0A281B] border border-[#13422E] rounded-2xl p-6 shadow-2xl space-y-6 sticky top-24">
                    {/* Header with Urgency and Metadata */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#13422E]">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h2 className="text-xl font-extrabold text-white">
                            {selectedDossier.farmer_name}
                          </h2>
                          <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                            {selectedDossier.farmer_id}
                          </span>
                        </div>
                        <p className="text-xs text-emerald-300/70 mt-0.5">
                          {selectedDossier.crop_type} &bull; Ondera Highlands (Elev. {selectedDossier.altitude_m || 1840}m)
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-extrabold tracking-wide uppercase ${
                            selectedDossier.urgency_level === "CRITICAL"
                              ? "bg-red-950 text-red-200 border border-red-700 animate-pulse"
                              : selectedDossier.urgency_level === "HIGH"
                              ? "bg-amber-950 text-amber-200 border border-amber-700"
                              : "bg-emerald-950 text-emerald-200 border border-emerald-700"
                          }`}
                        >
                          Urgency: {selectedDossier.urgency_level || "MEDIUM"}
                        </span>
                      </div>
                    </div>

                    {/* Offline Field Diagnostic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#051A11] p-4 rounded-xl border border-[#13422E]">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                          Edge On-Device ML Diagnosis
                        </span>
                        <p className="text-xs font-mono text-white">
                          {selectedDossier.offline_diagnosis}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                          Farmer Noor&apos;s Field Observation
                        </span>
                        <p className="text-xs text-emerald-200 italic">
                          &ldquo;{selectedDossier.symptoms_description || "No notes provided"}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Claude AI Multi-Agent Agronomic Advisory Box */}
                    <div className="bg-gradient-to-br from-[#0F382A] via-[#0A281B] to-[#051A11] p-5 rounded-xl border border-emerald-500/50 shadow-xl space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-emerald-800/60">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-5 h-5 text-emerald-400" />
                          <h3 className="text-sm font-bold text-white tracking-wide">
                            Claude 3.7 Agronomic Intelligence Advisory
                          </h3>
                        </div>
                        <span className="text-[10px] text-emerald-300 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700">
                          Small AI Multi-Agent
                        </span>
                      </div>

                      {/* Technical Summary for Extension Officer */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          District Extension Officer Briefing
                        </h4>
                        <p className="text-xs text-white/95 leading-relaxed bg-[#051A11]/60 p-3 rounded-lg border border-[#13422E]">
                          {selectedDossier.advisory_summary ||
                            "Advisory is being analyzed by the multi-agent mesh..."}
                        </p>
                      </div>

                      {/* Prescriptive Agronomic Action Plan */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                          Recommended Agronomic Action Plan
                        </h4>
                        <div className="text-xs text-emerald-100 whitespace-pre-line leading-relaxed bg-[#051A11]/60 p-3 rounded-lg border border-[#13422E]">
                          {selectedDossier.recommended_action ||
                            "1. Inspect foliage and verify underside sporulation.\n2. Apply localized organic protective wash."}
                        </div>
                      </div>

                      {/* Market Context & Farmer Protection */}
                      {selectedDossier.market_context && (
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                            Market Pricing Context &amp; Timing
                          </h4>
                          <p className="text-xs text-amber-200/95 leading-relaxed bg-[#051A11]/60 p-3 rounded-lg border border-[#13422E]">
                            {selectedDossier.market_context}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Extension Officer Operational Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() =>
                          alert(
                            `SMS Dispatch simulated: Guidance queued for ${selectedDossier.farmer_name} over KrishiKotha SMS gateway.`
                          )
                        }
                        className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Dispatch SMS Advisory to {selectedDossier.farmer_name}</span>
                      </button>

                      <button
                        onClick={() =>
                          alert(
                            `Treatment kit request submitted to District Agronomy Store for Sector 4.`
                          )
                        }
                        className="flex-1 flex items-center justify-center space-x-2 bg-[#0F382A] hover:bg-emerald-800/60 text-emerald-200 border border-[#1B5E20] font-semibold py-2.5 px-4 rounded-xl text-xs transition-all"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Schedule Field Officer Visit</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0A281B] border border-[#13422E] rounded-2xl p-12 text-center text-emerald-400/60">
                    Select a dossier from the stream to view Claude agronomic intelligence.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Farmer Noor Field Terminal */}
        {activeTab === "farmer" && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="p-4 bg-[#0A281B] border border-[#13422E] rounded-xl text-xs text-emerald-300 flex items-start space-x-3">
              <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Offline-First Field Simulation:</span>{" "}
                Coffee farmer Noor enters crop health observations in deep mountain plots where cellular coverage is unavailable. The dossier is stored safely in the device&apos;s Store-and-Forward Vault and synced when reconnecting with a KrishiKotha Edge Mesh relay.
              </div>
            </div>

            <DossierSync
              onSyncComplete={() => {
                fetchData();
              }}
              onNavigateToOfficer={() => {
                fetchData();
                setActiveTab("officer");
              }}
            />
          </div>
        )}

        {/* TAB 3: Multi-Agent Architecture Documentation */}
        {activeTab === "architecture" && (
          <div className="bg-[#0A281B] border border-[#13422E] rounded-2xl p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">
                KrishiKotha AI: System Architecture
              </h2>
              <p className="text-xs text-emerald-300/70 mt-1">
                World Bank Small AI for Development Hackathon Specification
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#051A11] border border-[#13422E] p-5 rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-300">
                  1
                </div>
                <h3 className="text-sm font-bold text-white">
                  Offline Edge Client (Farmer Noor)
                </h3>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Runs as a Progressive Web App (PWA) with service worker caching. Evaluates lightweight on-device MobileNet/TFLite models to produce initial diagnostic tags offline. Stores payloads in persistent local vault.
                </p>
              </div>

              <div className="bg-[#051A11] border border-[#13422E] p-5 rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center font-bold text-amber-300">
                  2
                </div>
                <h3 className="text-sm font-bold text-white">
                  FastAPI Store-and-Forward Gateway
                </h3>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Asynchronous Python 3.11 backend with SQLAlchemy 2.0 and asyncpg connection pooling. Persists payloads to PostgreSQL container, preventing data loss across intermittent mesh uplinks.
                </p>
              </div>

              <div className="bg-[#051A11] border border-[#13422E] p-5 rounded-xl space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center font-bold text-emerald-300">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">
                  Claude Multi-Agent Orchestrator
                </h3>
                <p className="text-xs text-emerald-200/80 leading-relaxed">
                  Synthesizes high-altitude Arabica agronomic knowledge, local disease epidemiology (Leaf Rust, CBD), and fair-trade market pricing to deliver actionable guidance to District Extension Officers.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
