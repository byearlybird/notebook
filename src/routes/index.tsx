// oxlint-disable typescript/no-explicit-any
import { createFileRoute } from "@tanstack/react-router";
import { useReactiveQuery } from "sqlocal/react";
import { useAuth } from "@clerk/react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { db, sqlocal } from "../db/client";
import { fullSync } from "../sync";
import { isVaultUnlocked, lockVault, tryRestoreFromCache } from "../vault";
import { VaultPrompt } from "../components/VaultPrompt";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const { isSignedIn } = useAuth();
  const [vaultUnlocked, setVaultUnlocked] = useState(isVaultUnlocked());
  const [showVaultPrompt, setShowVaultPrompt] = useState(false);
  const vaultButtonRef = useRef<HTMLButtonElement>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
  const [newTodoContent, setNewTodoContent] = useState("");
  const renamingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isSignedIn) return;
    if (vaultUnlocked) return;
    tryRestoreFromCache().then((restored) => {
      if (restored) setVaultUnlocked(true);
    });
  }, [isSignedIn, vaultUnlocked]);

  useEffect(() => {
    if (renamingId) renamingInputRef.current?.focus();
  }, [renamingId]);

  const { data: allTodos } = useReactiveQuery(
    sqlocal,
    db
      .selectFrom("todos")
      .selectAll()
      .where("is_deleted", "=", 0)
      .orderBy("completed", "asc")
      .orderBy("created_at", "desc")
      .compile(),
  );

  const { data: categories } = useReactiveQuery(
    sqlocal,
    db
      .selectFrom("categories")
      .selectAll()
      .where("is_deleted", "=", 0)
      .orderBy("created_at", "asc")
      .compile(),
  );

  const todos = useMemo(
    () =>
      selectedCategoryId
        ? allTodos?.filter((t) => t.category_id === selectedCategoryId)
        : allTodos,
    [allTodos, selectedCategoryId],
  );

  async function addTodo(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = newTodoContent.trim();
    if (!content) return;
    await db
      .insertInto("todos")
      .values({
        id: crypto.randomUUID(),
        content,
        completed: 0,
        category_id: selectedCategoryId ?? null,
        created_at: new Date().toISOString(),
      } as any)
      .execute();
    setNewTodoContent("");
  }

  async function toggleTodo(id: string, completed: number) {
    await db.updateTable("todos").set({ completed: completed ? 0 : 1 }).where("id", "=", id).execute();
  }

  async function moveTodo(id: string, categoryId: string | null) {
    await db.updateTable("todos").set({ category_id: categoryId }).where("id", "=", id).execute();
  }

  async function addCategory() {
    const name = window.prompt("Category name:");
    if (!name?.trim()) return;
    await db
      .insertInto("categories")
      .values({ id: crypto.randomUUID(), name: name.trim(), created_at: new Date().toISOString() } as any)
      .execute();
  }

  async function renameCategory(id: string, name: string) {
    const trimmed = name.trim();
    if (trimmed) {
      await db.updateTable("categories").set({ name: trimmed }).where("id", "=", id).execute();
    }
    setRenamingId(null);
    setRenamingName("");
  }

  async function handleLockVault() {
    await lockVault();
    setVaultUnlocked(false);
    setShowVaultPrompt(false);
  }

  const syncEnabled = isSignedIn && vaultUnlocked;
  const selectedCategory = categories?.find((c) => c.id === selectedCategoryId);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center border-b px-4 py-2 gap-2">
        <span className="text-sm font-semibold">{selectedCategory?.name ?? "All"}</span>
        <div className="ml-auto flex items-center gap-2">
          {isSignedIn && (
            <>
              <button
                onClick={fullSync}
                disabled={!syncEnabled}
                title={!syncEnabled ? "Unlock vault to sync" : undefined}
                className="border px-3 py-1 text-xs disabled:opacity-40 hover:bg-neutral-100 disabled:cursor-not-allowed"
              >
                Sync
              </button>
              {!vaultUnlocked ? (
                <div className="relative">
                  <button
                    ref={vaultButtonRef}
                    className="border px-3 py-1 text-xs hover:bg-neutral-100"
                    onClick={() => setShowVaultPrompt((v) => !v)}
                  >
                    Unlock Vault
                  </button>
                  {showVaultPrompt && (
                    <div className="absolute right-0 top-full z-10 mt-1">
                      <VaultPrompt
                        onUnlocked={() => {
                          setVaultUnlocked(true);
                          setShowVaultPrompt(false);
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <button
                  className="border px-3 py-1 text-xs hover:bg-neutral-100"
                  onClick={handleLockVault}
                >
                  Lock Vault
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-44 border-r flex flex-col overflow-y-auto shrink-0">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2.5 text-left text-sm border-b ${!selectedCategoryId ? "bg-black text-white" : "hover:bg-neutral-100"}`}
          >
            All
          </button>
          {categories?.map((cat) => (
            <div key={cat.id} className="border-b">
              {renamingId === cat.id ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    renameCategory(cat.id, renamingName);
                  }}
                >
                  <input
                    ref={renamingInputRef}
                    className="w-full px-4 py-2.5 text-sm outline-none bg-neutral-50"
                    value={renamingName}
                    onChange={(e) => setRenamingName(e.target.value)}
                    onBlur={() => renameCategory(cat.id, renamingName)}
                    onKeyDown={(e) => e.key === "Escape" && setRenamingId(null)}
                  />
                </form>
              ) : (
                <div
                  className={`flex items-center group ${selectedCategoryId === cat.id ? "bg-black text-white" : "hover:bg-neutral-100"}`}
                >
                  <button
                    className="flex-1 text-left px-4 py-2.5 text-sm"
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    {cat.name}
                  </button>
                  <button
                    className={`px-2 py-2.5 text-xs opacity-0 group-hover:opacity-60 ${selectedCategoryId === cat.id ? "text-white" : ""}`}
                    onClick={() => {
                      setRenamingId(cat.id);
                      setRenamingName(cat.name);
                    }}
                  >
                    ···
                  </button>
                </div>
              )}
            </div>
          ))}
          <button
            className="px-4 py-2.5 text-left text-sm text-neutral-400 hover:text-black"
            onClick={addCategory}
          >
            + Category
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            {(!todos || todos.length === 0) && (
              <p className="px-5 py-8 text-sm text-neutral-400">No todos.</p>
            )}
            {todos?.map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 border-b px-5 py-3">
                <input
                  type="checkbox"
                  checked={todo.completed === 1}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="w-4 h-4 accent-black shrink-0"
                />
                <span className={`flex-1 text-sm ${todo.completed === 1 ? "line-through text-neutral-400" : ""}`}>
                  {todo.content}
                </span>
                <select
                  value={todo.category_id ?? ""}
                  onChange={(e) => moveTodo(todo.id, e.target.value || null)}
                  className="text-xs text-neutral-400 outline-none bg-transparent cursor-pointer"
                >
                  <option value="">—</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <form onSubmit={addTodo} className="border-t flex">
            <input
              value={newTodoContent}
              onChange={(e) => setNewTodoContent(e.target.value)}
              placeholder={selectedCategory ? `Add to ${selectedCategory.name}…` : "New todo…"}
              className="flex-1 px-5 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!newTodoContent.trim()}
              className="px-4 py-3 text-sm border-l disabled:opacity-40 hover:bg-neutral-100 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
