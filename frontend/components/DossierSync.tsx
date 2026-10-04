"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  WifiOff,
  CloudUpload,
  Database,
  MapPin,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Sprout,
  Trash2,
  RefreshCw,
} from "lucide-react";

export interface SyncDossierPayload {
  id: string;
  farmer_id: string;
  farmer_name: string;
  crop_type: string;
  offline_diagnosis: string;
  symptoms_description: string;
  geo_lat: number;
  geo_lon: number;
  altitude_m: number;
  client_recorded_at: string;
}

interface SyncedRecordResult {
  id?: string;
  urgency_level?: string;
  advisory_summary?: string;
  recommended_action?: string;
}

interface DossierSyncProps {
  onSyncComplete?: () => void;
}

const STORAGE_KEY = "ondera_offline_dossiers_vault";

export default function DossierSync({ onSyncComplete }: DossierSyncProps) {
  // Real browser connectivity state
  const [browserOnline, setBrowserOnline] = useState<boolean>(true);
  // Manual simulation toggle so evaluators can test offline without disabling machine Wi-Fi
  const [simulateOffline, setSimulateOffline] = useState<boolean>(false);

  // Form input state for Farmer Noor
  const [farmerId, setFarmerId] = useState<string>("farmer_noor_01");
  const [farmerName, setFarmerName] = useState<string>("Noor");
  const [cropType, setCropType] = useState<string>("Arabica Coffee (Bourbon)");
  const [symptoms, setSymptoms] = useState<string>(
    "yellow spots on leaves, powdery underside, leaf drop after rain"
  );
  const [offlineDiagnosis, setOfflineDiagnosis] = useState<string>(
    "Suspected Coffee Leaf Rust (Hemileia vastatrix) - Edge Confidence: 92%"
  );
  const [latitude, setLatitude] = useState<number>(6.4521);
  const [longitude, setLongitude] = useState<number>(38.5412);
  const [altitude, setAltitude] = useState<number>(1840);

  // Offline queue state
  const [cachedQueue, setCachedQueue] = useState<SyncDossierPayload[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string>("");
  const [lastSyncResult, setLastSyncResult] = useState<SyncedRecordResult | null>(null);

  // Effective connectivity: true only if browser is online AND simulation is off
  const isEffectiveOnline = browserOnline && !simulateOffline;

  // Load cached dossiers from localStorage upon mounting
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setCachedQueue(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load local dossier vault:", e);
    }

    const handleOnline = () => setBrowserOnline(true);
    const handleOffline = () => setBrowserOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check
    if (typeof navigator !== "undefined") {
      setBrowserOnline(navigator.onLine);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync state changes to localStorage
  const updateCachedQueue = (newList: SyncDossierPayload[]) => {
    setCachedQueue(newList);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  };

  // Helper to prefill symptom presets
  const applyPreset = (presetType: "rust" | "cbd" | "chlorosis") => {
    if (presetType === "rust") {
      setFarmerName("Noor");
      setFarmerId("farmer_noor_01");
      setCropType("Arabica Coffee (Bourbon)");
      setSymptoms("yellow spots on leaves, powdery underside, leaf drop after rain");
      setOfflineDiagnosis("Suspected Coffee Leaf Rust (Hemileia vastatrix) - Edge Confidence: 92%");
      setAltitude(1840);
    } else if (presetType === "cbd") {
      setFarmerName("Abera");
      setFarmerId("farmer_abera_02");
      setCropType("Arabica Coffee (SL28)");
      setSymptoms("dark sunken necrotic lesions on green berries, early cherry drop");
      setOfflineDiagnosis("Suspected Coffee Berry Disease (Colletotrichum kahawae) - Edge Confidence: 88%");
      setAltitude(1890);
    } else {
      setFarmerName("Chaltu");
      setFarmerId("farmer_chaltu_03");
      setCropType("Arabica Coffee (Ruiru 11)");
      setSymptoms("yellowing between leaf veins with small rosette leaves, no fungus observed");
      setOfflineDiagnosis("Interveinal Micronutrient Deficiency (Zinc / Magnesium)");
      setAltitude(1810);
    }
  };

  // Handle capture of observation
  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();

    const newDossier: SyncDossierPayload = {
      id: `ondera-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      farmer_id: farmerId,
      farmer_name: farmerName,
      crop_type: cropType,
      offline_diagnosis: offlineDiagnosis,
      symptoms_description: symptoms,
      geo_lat: latitude,
      geo_lon: longitude,
      altitude_m: altitude,
      client_recorded_at: new Date().toISOString(),
    };

    const updated = [newDossier, ...cachedQueue];
    updateCachedQueue(updated);

    if (!isEffectiveOnline) {
      setSyncStatusMessage("⚠️ Mesh Offline: Dossier preserved in Edge Store-and-Forward Vault.");
    } else {
      setSyncStatusMessage("Stored in vault. Ready to transmit to Extension Network.");
    }
  };

  // Synchronize cached queue with FastAPI backend
  const handleSyncToExtensionNetwork = useCallback(async () => {
    if (cachedQueue.length === 0) return;
    if (!isEffectiveOnline) {
      alert("Cannot sync: Connection is offline. Switch mesh status to online to synchronize.");
      return;
    }

    setIsSyncing(true);
    setSyncStatusMessage("Transmitting cached dossiers through Ondera Edge Gateway...");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    let successfulCount = 0;
    const remainingQueue = [...cachedQueue];
    let latestResponse: SyncedRecordResult | null = null;

    try {
      for (const dossier of cachedQueue) {
        const res = await fetch(`${apiUrl}/api/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dossier),
        });

        if (res.ok) {
          const data: SyncedRecordResult = await res.json();
          latestResponse = data;
          successfulCount++;
          // Remove processed item from remaining queue
          const index = remainingQueue.findIndex((item) => item.id === dossier.id);
          if (index !== -1) {
            remainingQueue.splice(index, 1);
          }
        } else {
          const errDetail = await res.text();
          throw new Error(`Sync failed with status ${res.status}: ${errDetail}`);
        }
      }

      updateCachedQueue(remainingQueue);
      setLastSyncResult(latestResponse);
      setSyncStatusMessage(
        `✅ Successfully synced ${successfulCount} dossier(s)! Claude AI agronomic advisory generated.`
      );

      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (error: unknown) {
      console.error("Sync error:", error);
      const errMsg = error instanceof Error ? error.message : "Failed to reach backend";
      setSyncStatusMessage(`❌ Sync Error: ${errMsg}`);
    } finally {
      setIsSyncing(false);
    }
  }, [cachedQueue, isEffectiveOnline, onSyncComplete]);

  // Request browser geolocation if available
  const handleDetectGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          if (pos.coords.altitude) {
            setAltitude(Math.round(pos.coords.altitude));
          }
        },
        () => {
          alert("GPS fallback: Using Ondera Highlands coordinates (6.4521° N, 38.5412° E)");
        }
      );
    }
  };

  const removeQueueItem = (id: string) => {
    const updated = cachedQueue.filter((item) => item.id !== id);
    updateCachedQueue(updated);
  };

  return (
    <div className="bg-[#0A281B] border border-[#13422E] rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Mesh Header & Connectivity Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#13422E]">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-[#0F382A] rounded-xl border border-[#1B5E20]">
            <Sprout className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-white tracking-wide">
                Farmer Edge Mesh Terminal
              </h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Sector 4 Node
              </span>
            </div>
            <p className="text-xs text-emerald-300/70">
              Ondera Highlands Store-and-Forward Client (Noor)
            </p>
          </div>
        </div>

        {/* Connectivity Simulator & Live Status */}
        <div className="flex items-center space-x-3 bg-[#051A11] px-3 py-2 rounded-xl border border-[#13422E]">
          <div className="flex items-center space-x-2">
            {isEffectiveOnline ? (
              <span className="flex items-center text-xs font-medium text-emerald-400">
                <Wifi className="w-4 h-4 mr-1 text-emerald-400 animate-pulse" />
                Mesh Online
              </span>
            ) : (
              <span className="flex items-center text-xs font-medium text-amber-400">
                <WifiOff className="w-4 h-4 mr-1 text-amber-400" />
                Offline (Vault Active)
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-[#13422E]" />

          {/* Toggle button to simulate offline for hackathon evaluators */}
          <button
            type="button"
            onClick={() => setSimulateOffline(!simulateOffline)}
            className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
              simulateOffline
                ? "bg-amber-600/30 text-amber-300 border border-amber-500/50"
                : "bg-emerald-900/40 text-emerald-200 border border-emerald-700/50 hover:bg-emerald-800/40"
            }`}
          >
            {simulateOffline ? "Disable Offline Simulation" : "Simulate Offline"}
          </button>
        </div>
      </div>

      {/* Quick Scenario Fill Buttons */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-emerald-400/80 font-medium">Quick Presets:</span>
        <button
          type="button"
          onClick={() => applyPreset("rust")}
          className="text-xs px-2.5 py-1 rounded-md bg-[#0F382A] text-emerald-300 hover:bg-emerald-800/50 border border-[#1B5E20] transition-colors"
        >
          ☕ Noor: Leaf Rust (Yellow Spots)
        </button>
        <button
          type="button"
          onClick={() => applyPreset("cbd")}
          className="text-xs px-2.5 py-1 rounded-md bg-[#0F382A] text-amber-300 hover:bg-emerald-800/50 border border-[#1B5E20] transition-colors"
        >
          🚨 Abera: Berry Disease
        </button>
        <button
          type="button"
          onClick={() => applyPreset("chlorosis")}
          className="text-xs px-2.5 py-1 rounded-md bg-[#0F382A] text-emerald-200 hover:bg-emerald-800/50 border border-[#1B5E20] transition-colors"
        >
          🌿 Chaltu: Nutrient Leaching
        </button>
      </div>

      {/* Farmer Input Form */}
      <form onSubmit={handleSaveObservation} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Farmer Profile &amp; Plot ID
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="Farmer Name"
                className="w-1/2 bg-[#051A11] border border-[#13422E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                value={farmerId}
                onChange={(e) => setFarmerId(e.target.value)}
                placeholder="Farmer ID"
                className="w-1/2 bg-[#051A11] border border-[#13422E] rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-200 mb-1">
              Coffee Variety
            </label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full bg-[#051A11] border border-[#13422E] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="Arabica Coffee (Bourbon)">Arabica Coffee (Bourbon)</option>
              <option value="Arabica Coffee (SL28)">Arabica Coffee (SL28)</option>
              <option value="Arabica Coffee (Ruiru 11)">Arabica Coffee (Ruiru 11)</option>
              <option value="Arabica Coffee (Geisha Selection)">Arabica Coffee (Geisha)</option>
            </select>
          </div>
        </div>

        {/* Symptoms observation input */}
        <div>
          <label className="block text-xs font-semibold text-emerald-200 mb-1">
            Field Symptom Observations (Farmer Noor)
          </label>
          <textarea
            rows={2}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe leaf spots, berry lesions, defoliation..."
            className="w-full bg-[#051A11] border border-[#13422E] rounded-lg px-3 py-2 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Offline Edge ML Classification */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-emerald-200 flex items-center">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              Edge On-Device ML Diagnosis (Offline Classifier)
            </label>
            <span className="text-[11px] text-emerald-400/70">Edge Model v1.4</span>
          </div>
          <input
            type="text"
            value={offlineDiagnosis}
            onChange={(e) => setOfflineDiagnosis(e.target.value)}
            className="w-full bg-[#051A11] border border-[#13422E] rounded-lg px-3 py-2 text-sm text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
            required
          />
        </div>

        {/* Geolocation & Altitude */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-emerald-300/80 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(e) => setLatitude(parseFloat(e.target.value))}
              className="w-full bg-[#051A11] border border-[#13422E] rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-emerald-300/80 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(e) => setLongitude(parseFloat(e.target.value))}
              className="w-full bg-[#051A11] border border-[#13422E] rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-emerald-300/80">
                Altitude (m)
              </label>
              <button
                type="button"
                onClick={handleDetectGPS}
                className="text-[10px] text-emerald-400 underline hover:text-emerald-200"
              >
                Detect GPS
              </button>
            </div>
            <input
              type="number"
              value={altitude}
              onChange={(e) => setAltitude(parseInt(e.target.value))}
              className="w-full bg-[#051A11] border border-[#13422E] rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
          </div>
        </div>

        {/* Action Button: Record Observation */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg transition-all active:scale-[0.99]"
        >
          <Database className="w-4 h-4 mr-1" />
          <span>
            {isEffectiveOnline
              ? "Record Observation (Store in Vault)"
              : "Record Offline (Preserve in Local Store-and-Forward Vault)"}
          </span>
        </button>
      </form>

      {/* Sync Status Banner */}
      {syncStatusMessage && (
        <div className="p-3 rounded-xl bg-[#051A11] border border-[#13422E] text-xs text-emerald-200 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatusMessage}</span>
        </div>
      )}

      {/* Store-and-Forward Offline Vault Queue */}
      <div className="border-t border-[#13422E] pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              Store-and-Forward Vault Queue
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-800">
              {cachedQueue.length} pending
            </span>
          </div>

          {cachedQueue.length > 0 && (
            <button
              type="button"
              onClick={() => updateCachedQueue([])}
              className="text-xs text-red-400 hover:text-red-300 flex items-center"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Clear Queue
            </button>
          )}
        </div>

        {cachedQueue.length === 0 ? (
          <p className="text-xs text-emerald-400/50 italic py-2">
            No pending dossiers. All field observations are synchronized or queue is empty.
          </p>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {cachedQueue.map((item) => (
              <div
                key={item.id}
                className="bg-[#051A11] border border-[#13422E] rounded-xl p-3 flex items-start justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-white">{item.farmer_name}</span>
                    <span className="text-[11px] text-emerald-300/70">
                      ({item.crop_type})
                    </span>
                    <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded">
                      Unsynced
                    </span>
                  </div>
                  <p className="text-emerald-200/90 font-mono text-[11px]">
                    {item.offline_diagnosis}
                  </p>
                  <p className="text-emerald-400/70 text-[11px] italic">
                    &ldquo;{item.symptoms_description}&rdquo;
                  </p>
                  <div className="flex items-center space-x-3 text-[10px] text-emerald-400/60">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-0.5" />
                      {item.geo_lat}, {item.geo_lon} ({item.altitude_m}m)
                    </span>
                    <span>{new Date(item.client_recorded_at).toLocaleTimeString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeQueueItem(item.id)}
                  className="text-emerald-600 hover:text-red-400 p-1"
                  title="Remove from queue"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Primary Action Button: "Sync to Extension Network" */}
        <button
          type="button"
          onClick={handleSyncToExtensionNetwork}
          disabled={cachedQueue.length === 0 || !isEffectiveOnline || isSyncing}
          className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm shadow-xl transition-all ${
            cachedQueue.length === 0 || !isEffectiveOnline || isSyncing
              ? "bg-[#0F382A] text-emerald-600 border border-[#13422E] cursor-not-allowed"
              : "bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white glow-mesh cursor-pointer active:scale-[0.99]"
          }`}
        >
          {isSyncing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Transmitting Payloads to Claude Orchestrator...</span>
            </>
          ) : (
            <>
              <CloudUpload className="w-5 h-5 mr-1" />
              <span>
                Sync to Extension Network ({cachedQueue.length} Queued)
              </span>
            </>
          )}
        </button>

        {!isEffectiveOnline && cachedQueue.length > 0 && (
          <p className="text-[11px] text-center text-amber-400/80">
            📡 Edge Mesh is currently offline. Switch back to &quot;Online&quot; to dispatch dossiers to the District Extension Officer.
          </p>
        )}
      </div>

      {/* Instant Feedback on Last Synced Advisory */}
      {lastSyncResult && (
        <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-[#0F382A] to-[#0A281B] border border-emerald-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center text-xs font-bold text-emerald-300">
              <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-400" />
              Synced &amp; Advisory Received (Dossier #{lastSyncResult.id?.slice(0, 8)})
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                lastSyncResult.urgency_level === "CRITICAL"
                  ? "bg-red-950 text-red-300 border border-red-800"
                  : lastSyncResult.urgency_level === "HIGH"
                  ? "bg-amber-950 text-amber-300 border border-amber-800"
                  : "bg-emerald-950 text-emerald-300 border border-emerald-800"
              }`}
            >
              Urgency: {lastSyncResult.urgency_level}
            </span>
          </div>
          <p className="text-xs text-white/90 font-medium">
            {lastSyncResult.advisory_summary}
          </p>
          <div className="p-2.5 bg-[#051A11] rounded-lg border border-[#13422E]">
            <p className="text-[11px] font-semibold text-emerald-300 mb-1">
              Agronomic Action Recommended:
            </p>
            <p className="text-xs text-emerald-200/90 whitespace-pre-line">
              {lastSyncResult.recommended_action}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
