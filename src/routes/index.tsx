// oxlint-disable typescript/no-explicit-any
import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@nanostores/react";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { db } from "../db/client";
import { useQuery } from "../db/context";
import { $syncState, sync, lock, hasRemoteKey, createKey, loadRemoteKey } from "../stores/sync-client";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const syncState = useStore($syncState);
  const isSignedIn = syncState.status !== "unauthed";
  const isUnlocked = syncState.status === "unlocked";
  const isVaultLoading = syncState.status === "loading-key";
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renamingName, setRenamingName] = useState("");
  const [newTodoContent, setNewTodoContent] = useState("");
  const renamingInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId) renamingInputRef.current?.focus();
  }, [renamingId]);

  const allTodos = useQuery(
    db
      .selectFrom("todos")
      .selectAll()
      .where("is_deleted", "=", 0)
      .orderBy("completed", "asc")
      .orderBy("created_at", "desc"),
  );

  const categories = useQuery(
    db
      .selectFrom("categories")
      .selectAll()
      .where("is_deleted", "=", 0)
      .orderBy("created_at", "asc"),
  );

  const todos = useMemo(
    () =>
      selectedCategoryId ? allTodos?.filter((t) => t.category_id === selectedCategoryId) : allTodos,
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
    await db
      .updateTable("todos")
      .set({ completed: completed ? 0 : 1 })
      .where("id", "=", id)
      .execute();
  }

  async function moveTodo(id: string, categoryId: string | null) {
    await db.updateTable("todos").set({ category_id: categoryId }).where("id", "=", id).execute();
  }

  async function addCategory() {
    const name = window.prompt("Category name:");
    if (!name?.trim()) return;
    await db
      .insertInto("categories")
      .values({
        id: crypto.randomUUID(),
        name: name.trim(),
        created_at: new Date().toISOString(),
        is_deleted: 0,
      })
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

  async function handleSync() {
    await sync();
  }

  async function handleUnlockVault() {
    const check = await hasRemoteKey();
    if (check.result !== "success") return;
    const passphrase = window.prompt(check.hasKey ? "Enter vault password:" : "Create vault password:");
    if (!passphrase) return;
    const res = check.hasKey ? await loadRemoteKey(passphrase) : await createKey(passphrase);
    if (res.result === "error") window.alert(`Vault error: ${res.error.message}`);
  }

  function handleLockVault() {
    lock();
  }

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
                onClick={handleSync}
                disabled={!isUnlocked}
                title={!isUnlocked ? "Unlock vault to sync" : undefined}
                className="border px-3 py-1 text-xs disabled:opacity-40 hover:bg-neutral-100 disabled:cursor-not-allowed"
              >
                Sync
              </button>
              {!isUnlocked ? (
                <button
                  disabled={isVaultLoading}
                  className="border px-3 py-1 text-xs hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  onClick={handleUnlockVault}
                >
                  {isVaultLoading ? "…" : "Unlock Vault"}
                </button>
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
                <span
                  className={`flex-1 text-sm ${todo.completed === 1 ? "line-through text-neutral-400" : ""}`}
                >
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
