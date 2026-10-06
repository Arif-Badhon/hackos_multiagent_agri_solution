"use client";

import React, { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Camera,
  Sparkles,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Copy,
  Check,
  ShieldAlert,
  Sun,
  Scale,
  Volume2,
  ArrowRight,
} from "lucide-react";
import { getApiUrl } from "@/utils/api";

interface DossierSyncProps {
  onSyncComplete?: () => void;
  onNavigateToOfficer?: () => void;
}

// Minimal type definitions for Browser SpeechRecognition API
interface SpeechRecognitionResultItem {
  transcript: string;
}

interface SpeechRecognitionResultList {
  length: number;
  [index: number]: {
    [subIndex: number]: SpeechRecognitionResultItem;
  };
}

interface BrowserSpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface BrowserSpeechRecognitionErrorEvent {
  error: string;
}

interface BrowserSpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: BrowserSpeechRecognitionEvent) => void) | null;
  onerror: ((event: BrowserSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
    SpeechRecognition?: new () => BrowserSpeechRecognition;
  }
}

export default function DossierSync({
  onSyncComplete,
  onNavigateToOfficer,
}: DossierSyncProps) {
  // State for image input & preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State for voice recording (hardware MediaRecorder + live speech transcript)
  const [transcript, setTranscript] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);

  // Streaming, analysis, and sync states
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [analysisStream, setAnalysisStream] = useState<string>("");
  const [streamError, setStreamError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTranscriptRef = useRef<string>("");

  // Handle mobile camera / file capture
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setStreamError(null);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Toggle dual voice input: Hardware MediaRecorder (guaranteed) + SpeechRecognition (optional live text)
  const toggleListening = async () => {
    setSpeechError(null);

    // If currently listening/recording, STOP
    if (isListening) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch (e) {
          console.warn("Error stopping media recorder:", e);
        }
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
      }
      setIsListening(false);
      return;
    }

    if (typeof window === "undefined") return;

    // Check hardware microphone availability
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setSpeechError(
        "আপনার ব্রাউজারে সরাসরি মাইক্রোফোন অডিও রেকর্ডিং সমর্থিত নয়। অনুগ্রহ করে সরাসরি টাইপ করুন বা প্রস্তুত সমস্যা নির্বাচন করুন।"
      );
      return;
    }

    try {
      // 1. Start hardware audio stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : MediaRecorder.isTypeSupported("audio/webm")
        ? { mimeType: "audio/webm" }
        : MediaRecorder.isTypeSupported("audio/mp4")
        ? { mimeType: "audio/mp4" }
        : undefined;

      const mediaRecorder = options
        ? new MediaRecorder(stream, options)
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // If user didn't get speech-to-text transcript or didn't type, give a clear voice note indicator
        setTranscript((prev) => {
          if (!prev.trim()) {
            return "কৃষকের অডিও বার্তা (ভয়েস নোট রেকর্ড সংযুক্ত - কফি গাছের পর্যবেক্ষণ)";
          }
          return prev;
        });
      };

      mediaRecorder.start(250);
      setIsListening(true);
      setRecordingSeconds(0);
      initialTranscriptRef.current = transcript.trim();

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // 2. Concurrently attempt Web Speech Recognition for live text transcription (best-effort)
      const SpeechRecognitionConstructor =
        window.webkitSpeechRecognition || window.SpeechRecognition;

      if (SpeechRecognitionConstructor) {
        try {
          const recognition = new SpeechRecognitionConstructor();
          recognition.lang = "bn-BD";
          recognition.continuous = false;
          recognition.interimResults = true;

          recognition.onresult = (event: BrowserSpeechRecognitionEvent) => {
            let sessionTranscript = "";
            for (let i = 0; i < event.results.length; i++) {
              sessionTranscript += event.results[i][0].transcript;
            }
            const base = initialTranscriptRef.current;
            setTranscript(base ? `${base} ${sessionTranscript}` : sessionTranscript);
          };

          recognition.onerror = (event: BrowserSpeechRecognitionErrorEvent) => {
            // Silently log; local hardware audio recording is already active and unaffected!
            console.warn("Web Speech API note (local hardware recording is active):", event.error);
          };

          recognitionRef.current = recognition;
          recognition.start();
        } catch (speechErr) {
          console.warn("Speech recognition optional enhancement unavailable:", speechErr);
        }
      }
    } catch (err: unknown) {
      console.error("Microphone hardware access failure:", err);
      const isNotAllowed =
        err instanceof DOMException &&
        (err.name === "NotAllowedError" || err.name === "PermissionDeniedError");
      if (isNotAllowed) {
        setSpeechError(
          "মাইক্রোফোনের অনুমতি দেওয়া হয়নি (Permission Denied): অনুগ্রহ করে আপনার ব্রাউজারের সাইট সেটিংসে গিয়ে KrishiKotha AI-এর জন্য মাইক্রোফোন পারমিশন Allow করুন।"
        );
      } else {
        setSpeechError(
          "মাইক্রোফোন চালু করা যায়নি। অনুগ্রহ করে আপনার ডিভাইসের অডিও ইনপুট চেক করুন অথবা সরাসরি বাংলায় লিখুন।"
        );
      }
      setIsListening(false);
    }
  };

  // Submission function streaming to Claude Opus 5.5
  const streamToClaude = async () => {
    if (!transcript.trim() && !imageFile && !audioBlob) {
      setStreamError("অনুগ্রহ করে আপনার সমস্যার কথা বলুন, অডিও রেকর্ড করুন অথবা কফি ফসলের ছবি তুলুন।");
      return;
    }

    // Stop listening if active
    if (isListening) {
      await toggleListening();
    }

    setIsStreaming(true);
    setAnalysisStream("");
    setStreamError(null);
    setSyncSuccess(false);

    try {
      // Build FormData payload
      const formData = new FormData();
      formData.append(
        "transcript",
        transcript.trim() ||
          "বান্দরবানের পাহাড়ি জমিতে কফি চাষের পর্যবেক্ষণ ও রোগ নিরাময়ে সম্প্রসারণ কর্মকর্তার পরামর্শ প্রয়োজন।"
      );

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (audioBlob) {
        formData.append("audio", audioBlob, "farmer_recording.webm");
      }

      formData.append("farmer_name", "Noor (নূর)");
      formData.append("farmer_id", "farmer_noor_01");
      formData.append("crop_type", "Arabica Coffee (Bourbon)");

      const apiUrl = getApiUrl();
      const targetEndpoint = `${apiUrl}/api/sync/stream`;

      const response = await fetch(targetEndpoint, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`সার্ভার সংযোগে ত্রুটি: ${response.status} ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("স্ট্রিম রেসপন্স বডি পাওয়া যায়নি।");
      }

      // Handle async/await stream reader loops for text/event-stream chunks
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setAnalysisStream((prev) => prev + chunk);
      }

      // Mark sync success and refresh Command Center data in the background (without redirecting!)
      setSyncSuccess(true);
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err: unknown) {
      console.error("Streaming error in streamToClaude:", err);
      const errorMsg =
        err instanceof Error
          ? err.message
          : "পরামর্শ সংযোগে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।";
      setStreamError(errorMsg);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopyAdvice = () => {
    if (!analysisStream) return;
    navigator.clipboard.writeText(analysisStream);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Preset sample scenarios for Bandarban coffee farmers
  const loadScenario = (text: string) => {
    setTranscript(text);
    setStreamError(null);
  };

  return (
    <div className="space-y-6">
      {/* Visual Header Banner */}
      <div className="bg-gradient-to-r from-[#0F382A] via-[#0A281B] to-[#051A11] border border-emerald-500/30 rounded-2xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              বান্দরবান হিল ট্র্যাক্টস &bull; পাইলট
            </span>
            <span className="text-xs text-emerald-400/80 font-medium">
              কৃষক নূর (Farmer Noor)
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">
            ডিএই কফি রোগ নির্ণয় ও পরামর্শ টার্মিনাল
          </h2>
          <p className="text-xs text-emerald-200/70 mt-0.5">
            ক্লদ ওপাস ৫.৫ সমর্থিত রিয়েল-টাইম বাংলা কৃষি পরামর্শ ও স্বয়ংক্রিয় কমান্ড সেন্টার সিঙ্ক
          </p>
        </div>
      </div>

      {/* Input Card Container */}
      <div className="bg-white dark:bg-[#0A281B] border border-gray-200 dark:border-[#13422E] rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Step 1: Camera Photo Capture */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900 dark:text-emerald-100 flex items-center space-x-2">
              <Camera className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>১. কফি ফসলের ছবি তুলুন বা আপলোড করুন (ঐচ্ছিক)</span>
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={removeImage}
                className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 flex items-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>ছবি সরান</span>
              </button>
            )}
          </div>

          {/* Hidden environment camera capture input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageChange}
          />

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-emerald-300 dark:border-emerald-800/60 hover:border-emerald-500 dark:hover:border-emerald-600 rounded-xl p-6 text-center cursor-pointer bg-emerald-50/50 dark:bg-[#051A11]/60 transition-colors duration-200"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="text-sm font-medium text-gray-800 dark:text-emerald-200">
                  ক্যামেরা দিয়ে কফি পাতা বা চেরির ছবি তুলুন
                </div>
                <p className="text-xs text-gray-500 dark:text-emerald-400/60 max-w-sm">
                  মিলিবাগ, ডাইব্যাক বা পাতার হলুদ দাগের স্পষ্ট ছবি তুললে ক্লদ ওপাস ৫.৫ নিখুঁতভাবে রোগ নির্ণয় করতে পারবে।
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-sm">
                  ছবি তুলুন / আপলোড করুন
                </span>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-emerald-500/40 bg-black/40 flex items-center justify-center max-h-72">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imagePreview}
                alt="Captured Coffee Crop"
                className="w-full h-auto max-h-72 object-contain"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2 truncate">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{imageFile?.name || "ছবি গৃহীত হয়েছে"}</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-emerald-300 hover:text-emerald-200 underline text-xs shrink-0 ml-2"
                >
                  পুনরায় তুলুন
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Bangla Voice Input & Transcript */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-gray-900 dark:text-emerald-100 flex items-center space-x-2">
              <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>২. আপনার সমস্যা বা পর্যবেক্ষণ বাংলায় বলুন বা রেকর্ড করুন</span>
            </label>

            {/* Speak Bangla Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all shadow-sm ${
                isListening
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-3.5 h-3.5" />
                  <span>রেকর্ডিং বন্ধ করুন</span>
                </>
              ) : (
                <>
                  <Mic className="w-3.5 h-3.5" />
                  <span>ভয়েস রেকর্ড করুন / বাংলায় বলুন</span>
                </>
              )}
            </button>
          </div>

          {/* Listening / Hardware Recording Indicator with live timer */}
          {isListening && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-center justify-between text-xs text-red-700 dark:text-red-300">
              <div className="flex items-center space-x-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
                <div>
                  <span className="font-bold">ভয়েস রেকর্ড হচ্ছে...</span> স্বাভাবিক বাংলায় আপনার কফি গাছের সমস্যা বলুন।
                </div>
              </div>
              <span className="font-mono font-bold bg-red-600 text-white px-2 py-0.5 rounded text-[11px] shrink-0">
                {Math.floor(recordingSeconds / 60)
                  .toString()
                  .padStart(2, "0")}
                :{(recordingSeconds % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}

          {/* Recorded Audio Playback Card */}
          {audioUrl && !isListening && (
            <div className="p-3 bg-emerald-50 dark:bg-[#051A11] border border-emerald-300 dark:border-[#13422E] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="font-semibold text-gray-800 dark:text-emerald-200">
                  রেকর্ডকৃত ভয়েস নোট:
                </span>
                <audio controls src={audioUrl} className="h-8 max-w-[220px]" />
              </div>
              <button
                type="button"
                onClick={removeAudio}
                className="text-red-500 hover:text-red-600 text-xs flex items-center space-x-1 shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>অডিও সরান</span>
              </button>
            </div>
          )}

          {speechError && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-start justify-between space-x-2">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold block text-amber-900 dark:text-amber-100">
                    ভয়েস ইনপুট পরামর্শ:
                  </span>
                  <p className="leading-relaxed">{speechError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError(null)}
                className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200 shrink-0 p-0.5 rounded"
                title="বার্তাটি বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Transcribed Textarea */}
          <textarea
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="আপনার অডিও এখানে স্বয়ংক্রিয়ভাবে বাংলায় লেখা হবে, অথবা সরাসরি টাইপ করুন... যেমন: 'বান্দরবানের পাহাড়ি জমিতে অ্যারাবিকা কফির ডালে সাদা তুলার মতো পোকা দেখা যাচ্ছে এবং ডাল শুকিয়ে কালো হচ্ছে...'"
            className="w-full p-3 rounded-xl border border-gray-300 dark:border-[#13422E] bg-white dark:bg-[#051A11] text-gray-900 dark:text-emerald-100 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          {/* Quick Scenario Pills for Bandarban Constraints */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-gray-500 dark:text-emerald-400/70">
              বান্দরবানের স্থানীয় সমস্যা বাছাই করুন (এক ক্লিকে লিখুন):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() =>
                  loadScenario(
                    "বান্দরবানের পাহাড়ি জমিতে অ্যারাবিকা কফির ডালে সাদা তুলার মতো মিলিবাগের আক্রমণ দেখা যাচ্ছে এবং ডাল আগা থেকে শুকিয়ে ডাইব্যাক হয়ে কালো হয়ে যাচ্ছে।"
                  )
                }
                className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-[#0F382A] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors flex items-center space-x-1"
              >
                <ShieldAlert className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>মিলিবাগ ও ডাইব্যাক</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadScenario(
                    "গ্রীষ্মের তীব্র তাপদাহে কফির কচি চেরি ও ফুল শুকিয়ে ঝরে পড়ছে। ছায়া ও মাটির আর্দ্রতা ধরে রাখার কি ব্যবস্থা নিব?"
                  )
                }
                className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-[#0F382A] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors flex items-center space-x-1"
              >
                <Sun className="w-3 h-3 text-amber-500" />
                <span>গ্রীষ্মের তাপদাহ ও ছায়া</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadScenario(
                    "বান্দরবানে স্থানীয় পাল্পিং ও ড্রায়িং মেশিন না থাকায় ফড়িয়া মধ্যস্বত্বভোগীরা কাঁচা চেরি কম দামে কিনতে চাচ্ছে। চেরি শুকানো ও ন্যায্য দাম পাওয়ার কি উপায়?"
                  )
                }
                className="px-2.5 py-1 text-xs bg-emerald-50 dark:bg-[#0F382A] border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-800/50 transition-colors flex items-center space-x-1"
              >
                <Scale className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>পাল্পিং সংকট ও ফড়িয়া সুরক্ষা</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error message */}
        {streamError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{streamError}</span>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="button"
            disabled={isStreaming}
            onClick={streamToClaude}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 transition-all shadow-md ${
              isStreaming
                ? "bg-emerald-800 cursor-not-allowed opacity-80"
                : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]"
            }`}
          >
            {isStreaming ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ক্লদ ওপাস ৫.৫ বিশ্লেষণ করছে ও লাইভ স্ট্রিম হচ্ছে...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>ক্লদ ওপাস ৫.৫ থেকে লাইভ পরামর্শ পান (Stream Advice)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Success & Command Center Jump Banner */}
      {syncSuccess && (
        <div className="p-4 bg-[#0A281B] border border-emerald-500/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-200 shadow-xl">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white text-sm block">
                পরামর্শ সফলভাবে প্রাপ্ত ও সংরক্ষিত হয়েছে!
              </span>
              <span className="text-emerald-300/80">
                আপনার পর্যবেক্ষণটি জেলা এক্সটেনশন অফিসার কমান্ড সেন্টারে রেকর্ডভুক্ত হয়েছে।
              </span>
            </div>
          </div>
          {onNavigateToOfficer && (
            <button
              type="button"
              onClick={onNavigateToOfficer}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center space-x-2 transition-all self-start sm:self-auto shrink-0 shadow-md"
            >
              <span>কমান্ড সেন্টারে দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Real-time Streaming Advice Display */}
      {(isStreaming || analysisStream) && (
        <div className="bg-white dark:bg-[#0A281B] border border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-[#13422E] pb-3">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center space-x-1.5">
                <span>ডিএই সম্প্রসারণ কর্মকর্তার লাইভ পরামর্শ</span>
                <span className="text-[11px] font-normal text-emerald-600 dark:text-emerald-400">
                  (বান্দরবান কফি অঞ্চল)
                </span>
              </h2>
            </div>

            {analysisStream && (
              <button
                type="button"
                onClick={handleCopyAdvice}
                className="text-xs px-2.5 py-1 bg-gray-100 dark:bg-[#051A11] border border-gray-300 dark:border-[#13422E] rounded-lg text-gray-700 dark:text-emerald-300 hover:text-emerald-500 flex items-center space-x-1"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>পরামর্শ কপি করুন</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Streaming Text Output with Bengali Typography */}
          <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-emerald-50 leading-relaxed font-sans whitespace-pre-wrap">
            {analysisStream}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
            )}
          </div>

          {/* Footnote */}
          <div className="pt-3 border-t border-gray-100 dark:border-[#13422E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500 dark:text-emerald-400/60">
            <span>
              তথ্যসূত্র: কৃষি সম্প্রসারণ অধিদপ্তর (DAE) বান্দরবান ও বিশ্বব্যাংক স্মল এআই KrishiKotha AI।
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              অফলাইন-ফার্স্ট ক্যাশড রেজাল্ট
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
