import { create } from "zustand";

interface VideoState {
  currentVideoId: number | null;
  isPlaying: boolean;
  setCurrentVideo: (videoId: number) => void;
  setIsPlaying: (playing: boolean) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  currentVideoId: null,
  isPlaying: false,

  setCurrentVideo: (videoId) => set({ currentVideoId: videoId }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
}));
