import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  ListChecks,
  PenLine,
  Pin,
  PinOff,
  Search,
  TerminalSquare,
} from "lucide-react";
import { stasherConfig, type StashItem } from "./data/stasher.config";

type AppMode = "search" | "manage";

function App() {
  const [mode, setMode] = useState<AppMode>("search");
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

  const manageRows = useMemo(() => {
    return items.map((item) => {
      const category =
        stasherConfig.categories.find(
          (category) => category.id === item.categoryId
        )?.name ?? item.categoryId;

      return {
        ...item,
        categoryName: category,
      };
    });
  }, [items]);

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

  function openManageMode() {
    setMode("manage");
  }

  function closeManageMode() {
    setMode("search");
    setTimeout(() => searchRef.current?.focus(), 0);
  }

  function fakeEdit(item: StashItem) {
    showToast(`Edit coming next: ${item.title}`);
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
        setMode("search");
        setQuery("");
        setTimeout(() => searchRef.current?.focus(), 0);
      });
    }
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (mode === "manage") {
          closeManageMode();
          return;
        }

        hideApp();
      }

      if (event.key === "Enter" && mode === "search" && filteredItems[0]) {
        copyItem(filteredItems[0]);
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();

        if (mode === "search") {
          setMode("manage");
        } else {
          closeManageMode();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [filteredItems, mode]);

  return (
    <main className="app-shell">
      {toast ? <div className="toast">{toast}</div> : null}

      {mode === "search" ? (
        <>
          <section className="topbar">
            <div>
              <p className="eyebrow">Stasher</p>
              <h1>Find it. Copy it. Move.</h1>
            </div>

            <div className="topbar-actions">
              <button
                className="icon-button"
                type="button"
                title="Manage snippets"
                onClick={openManageMode}
              >
                <ListChecks size={20} />
              </button>

              <button
                className={`icon-button pin-button ${isPinned ? "active" : ""}`}
                type="button"
                title={
                  isPinned ? "Pinned: click to unpin" : "Unpinned: click to pin"
                }
                onClick={togglePinned}
                aria-pressed={isPinned}
              >
                {isPinned ? <Pin size={20} /> : <PinOff size={20} />}
              </button>
            </div>
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
        </>
      ) : (
        <>
          <section className="topbar">
            <div>
              <p className="eyebrow">Manage</p>
              <h1>Manage snippets.</h1>
            </div>

            <button
              className="icon-button"
              type="button"
              title="Back to search"
              onClick={closeManageMode}
            >
              <ArrowLeft size={20} />
            </button>
          </section>

          <section className="manage-panel">
            <div className="manage-toolbar">
              <div>
                <strong>{items.length} snippets</strong>
                <span>Editing gets wired next. This is the management view.</span>
              </div>

              <button className="text-button" type="button">
                Add later
              </button>
            </div>

            <div className="manage-table">
              <div className="manage-row manage-head">
                <span>Title</span>
                <span>Category</span>
                <span>Tags</span>
                <span>Action</span>
              </div>

              {manageRows.map((item) => (
                <div className="manage-row" key={item.id}>
                  <div className="manage-title">
                    <strong>{item.title}</strong>
                    <code>{item.body}</code>
                  </div>

                  <span className="manage-category">{item.categoryName}</span>

                  <span className="manage-tags">{item.tags.join(", ")}</span>

                  <button
                    className="text-button"
                    type="button"
                    onClick={() => fakeEdit(item)}
                  >
                    <PenLine size={15} />
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default App;