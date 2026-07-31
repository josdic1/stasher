/// <reference types="vite/client" />

interface Window {
  stasher?: {
    hideWindow: () => Promise<void>;
    copyText: (text: string) => Promise<void>;

    getPinned: () => Promise<boolean>;
    setPinned: (nextPinned: boolean) => Promise<boolean>;

    onFocusSearch: (callback: () => void) => void;
    onPinState: (callback: (isPinned: boolean) => void) => void;
  };
}
