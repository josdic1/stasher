import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Pin, PinOff, Copy, TerminalSquare } from "lucide-react";
import { stasherConfig, type StashItem } from "./data/stasher.config";

function App() {
  const [query, setQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [toast, setToast] = useState("");
  const [items] = useState<StashItem[]>(stasherConfig.items);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const searchableText = [
        item.title,
        item.body,
        item.categoryId,
        ...item.tags,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(q);
    });
  }, [items, query]);

  const groupedItems = useMemo(() => {
    return stasherConfig.categories
      .map((category) => ({
        category,
        items: filteredItems.filter((item) => item.categoryId === category.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredItems]);

  function showToast(message: string) {
    setToast(message);

    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast("");
    }, 1200);
  }

  async function copyItem(item: StashItem) {
    if (window.stasher?.copyText) {
      await window.stasher.copyText(item.body);
      showToast(`Copied: ${item.title}`);
      return;
    }

    await navigator.clipboard.writeText(item.body);
    showToast(`Copied: ${item.title}`);
  }

  async function hideApp() {
    if (window.stasher?.hideWindow) {
      await window.stasher.hideWindow();
    }
  }

  async function togglePinned() {
    const nextPinned = !isPinned;

    setIsPinned(nextPinned);

    if (window.stasher?.setPinned) {
      const confirmedPinned = await window.stasher.setPinned(nextPinned);
      setIsPinned(confirmedPinned);
    }
  }

  useEffect(() => {
    searchRef.current?.focus();

    setIsPinned(false);

    if (window.stasher?.setPinned) {
      window.stasher.setPinned(false).then(setIsPinned);
    }

    if (window.stasher?.onPinState) {
      window.stasher.onPinState(setIsPinned);
    }

    if (window.stasher?.onFocusSearch) {
      window.stasher.onFocusSearch(() => {
        setQuery("");
        setTimeout(() => searchRef.current?.focus(), 0);
      });
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        hideApp();
      }

      if (event.key === "Enter" && filteredItems[0]) {
        copyItem(filteredItems[0]);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredItems]);

  return (
    <main className="app-shell">
      {toast ? <div className="toast">{toast}</div> : null}

      <section className="topbar">
        <div className="topbar-brand">
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5000 5000" className="brand-logo">
  <path d="M2215 4780 c-205 -22 -389 -107 -538 -249 -96 -92 -155 -172 -207 -283 -73 -156 -82 -206 -87 -453 -6 -247 3 -323 49 -455 55 -156 126 -257 347 -495 l121 -130 -189 -3 c-188 -2 -190 -3 -193 -25 -2 -12 -1 -232 2 -488 l5 -467 285 -288 285 -289 965 0 c1023 0 1002 -1 1145 47 308 105 552 369 632 685 14 55 17 115 18 313 0 277 -6 313 -75 459 -54 113 -73 135 -304 369 l-201 202 143 0 142 0 0 483 -1 482 -292 298 -292 297 -845 -1 c-465 -1 -876 -5 -915 -9z" fill="#195057" />
  <path d="M3883 3454 c26 -20 47 -39 47 -43 0 -7 -2408 -7 -2414 0 -2 2 -6 21 -10 42 l-7 37 1169 0 1169 0 46 -36z" fill="#D8A651" />
  <path d="M4036 3303 c12 -16 26 -38 33 -50 l11 -22 -1242 2 -1242 2 -23 40 c-12 22 -23 43 -23 48 0 4 555 7 1233 7 l1233 0 20 -27z" fill="#8F4632" />
  <path d="M4140 3113 c40 -106 50 -179 50 -373 0 -233 -18 -330 -85 -460 -107 -206 -298 -360 -524 -423 -74 -20 -99 -21 -1013 -24 -515 -1 -939 1 -942 6 -5 8 -9 339 -7 629 l1 132 804 0 c675 0 805 2 815 14 8 9 11 52 9 127 l-3 114 -555 6 c-625 6 -616 5 -775 84 -99 49 -189 116 -243 183 l-35 42 1241 0 1241 0 21 -57z" fill="#F1ECD8" />
</svg>
          <div>
            <p className="eyebrow">Stasher</p>
            <h1>Find it. Copy it. Move.</h1>
          </div>
        </div>

        <button
          className={`icon-button pin-button ${isPinned ? "active" : ""}`}
          type="button"
          title={isPinned ? "Pinned: click to unpin" : "Unpinned: click to pin"}
          onClick={togglePinned}
          aria-pressed={isPinned}
        >
          {isPinned ? <Pin size={20} /> : <PinOff size={20} />}
        </button>
      </section>

      <section className="search-wrap">
        <Search size={20} />
        <input
          ref={searchRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search commands, snippets, URLs..."
        />
      </section>

      <section className="results">
        {groupedItems.length === 0 ? (
          <div className="empty-state">
            <TerminalSquare size={36} />
            <p>No matches.</p>
          </div>
        ) : (
          groupedItems.map((group) => (
            <div className="category-group" key={group.category.id}>
              <div className="category-label">{group.category.name}</div>

              <div className="card-list">
                {group.items.map((item) => (
                  <button
                    className="stash-card"
                    key={item.id}
                    type="button"
                    onClick={() => copyItem(item)}
                    title={item.body}
                  >
                    <div>
                      <strong>{item.title}</strong>
                      <code>{item.body}</code>
                    </div>

                    <Copy size={18} />
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

export default App;
