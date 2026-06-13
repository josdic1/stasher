/// <reference types="vite/client" />

interface Window {
  stasher: {
    hideWindow: () => Promise<void>;
    copyText: (text: string) => Promise<void>;
    onFocusSearch: (callback: () => void) => void;
  };
}
