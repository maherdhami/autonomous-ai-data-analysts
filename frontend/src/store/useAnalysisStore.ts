import { create } from 'zustand';
import { AnalysisData, FileMetadata, ChartConfig, ChatMessage } from '@/types';

interface AnalysisState {
  activeFile: FileMetadata | null;
  activeAnalysis: AnalysisData | null;
  history: AnalysisData[];
  apiKey: string;
  
  // 4 Distinct Outputs
  output1: string | null;
  output2: string | null;
  output3: ChartConfig[] | null;
  output4: string | null;
  qualityScore: number | null;
  
  // Chat Memory
  messages: ChatMessage[];
  sessionId: string;

  // Actions
  setActiveFile: (file: FileMetadata | null) => void;
  setActiveAnalysis: (analysis: AnalysisData | null) => void;
  setHistory: (history: AnalysisData[]) => void;
  setApiKey: (key: string) => void;
  
  setOutput1: (content: string | null, score?: number) => void;
  setOutput2: (content: string | null) => void;
  setOutput3: (charts: ChartConfig[] | null) => void;
  setOutput4: (content: string | null) => void;
  
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  resetOutputs: () => void;
  clearDataset: () => void;
}

// In-Memory Zustand Store: No stale localStorage persistence across page reloads
export const useAnalysisStore = create<AnalysisState>((set) => ({
  activeFile: null,
  activeAnalysis: null,
  history: [],
  apiKey: '',
  
  output1: null,
  output2: null,
  output3: null,
  output4: null,
  qualityScore: null,
  
  messages: [
    {
      role: 'assistant',
      content: 'Hello! I am your Autonomous AI Data Analyst. Upload a dataset to begin asking strategic questions or running Python calculations.',
      timestamp: Date.now(),
    },
  ],
  sessionId: `ses_${Math.random().toString(36).substring(2, 11)}`,

  setActiveFile: (file) => set({
    activeFile: file,
    // Replacing or changing a dataset invalidates previous analysis results
    output1: null,
    output2: null,
    output3: null,
    output4: null,
    qualityScore: null,
    activeAnalysis: null,
  }),
  setActiveAnalysis: (analysis) => {
    if (analysis) {
      set({
        activeAnalysis: analysis,
        activeFile: analysis.file_metadata,
        output1: analysis.quality_assessment,
        output2: analysis.business_analysis,
        output3: analysis.charts,
        output4: analysis.executive_strategy,
        qualityScore: analysis.quality_score,
      });
    } else {
      set({ activeAnalysis: null });
    }
  },
  setHistory: (history) => set({ history }),
  setApiKey: (key) => set({ apiKey: key }),

  setOutput1: (content, score) => set((state) => ({ 
    output1: content, 
    qualityScore: score !== undefined ? score : (state.qualityScore || 98) 
  })),
  setOutput2: (content) => set({ output2: content }),
  setOutput3: (charts) => set({ output3: charts }),
  setOutput4: (content) => set({ output4: content }),

  setMessages: (updater) => set((state) => ({
    messages: typeof updater === 'function' ? updater(state.messages) : updater
  })),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  clearMessages: () => set({
    messages: [
      {
        role: 'assistant',
        content: 'Hello! I am your Autonomous AI Data Analyst. Upload a dataset to begin asking strategic questions or running Python calculations.',
        timestamp: Date.now(),
      },
    ],
    sessionId: `ses_${Math.random().toString(36).substring(2, 11)}`
  }),
  resetOutputs: () => set({
    output1: null,
    output2: null,
    output3: null,
    output4: null,
    qualityScore: null,
  }),
  clearDataset: () => set({
    activeFile: null,
    activeAnalysis: null,
    output1: null,
    output2: null,
    output3: null,
    output4: null,
    qualityScore: null,
    messages: [
      {
        role: 'assistant',
        content: 'Hello! I am your Autonomous AI Data Analyst. Upload a dataset to begin asking strategic questions or running Python calculations.',
        timestamp: Date.now(),
      },
    ],
  })
}));
