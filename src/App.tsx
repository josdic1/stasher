import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Copy, TerminalSquare } from "lucide-react";
import { stasherConfig, type StashItem } from "./data/stasher.config";

function App() {
  const [query, setQuery] = useState("");
  const [items] = useState<StashItem[]>(stasherConfig.items);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return items;

    return items.filter((item) => {
      const haystack = [item.title, item.body, item.categoryId, ...item.tags]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
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

  useEffect(() => {
    searchRef.current?.focus();

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

        <button className="icon-button" type="button" title="Add later">
          <Plus size={20} />
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
