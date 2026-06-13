import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Pin, PinOff, Copy, TerminalSquare } from "lucide-react";
import { stasherConfig, type StashItem } from "./data/stasher.config";

function App() {
  const [query, setQuery] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [items] = useState<StashItem[]>(stasherConfig.items);
  const searchRef = useRef<HTMLInputElement | null>(null);

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

  async function copyItem(item: StashItem) {
    if (window.stasher?.copyText) {
      await window.stasher.copyText(item.body);
      return;
    }

    await navigator.clipboard.writeText(item.body);
  }

  async function hideApp() {
    if (window.stasher?.hideWindow) {
      await window.stasher.hideWindow();
    }
  }

  async function togglePinned() {
    if (!window.stasher?.setPinned) return;

    const nextPinned = await window.stasher.setPinned(!isPinned);
    setIsPinned(nextPinned);
  }

  useEffect(() => {
    searchRef.current?.focus();

    if (window.stasher?.getPinned) {
      window.stasher.getPinned().then(setIsPinned);
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
      <section className="topbar">
        <div>
          <p className="eyebrow">Stasher</p>
          <h1>Find it. Copy it. Move.</h1>
        </div>

        <button
          className={`icon-button ${isPinned ? "active" : ""}`}
          type="button"
          title={isPinned ? "Unpin Stasher" : "Pin Stasher"}
          onClick={togglePinned}
        >
          {isPinned ? <PinOff size={20} /> : <Pin size={20} />}
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
                  >
                    <strong>{item.title}</strong>
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
