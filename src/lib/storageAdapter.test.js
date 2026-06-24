import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.fn(async () => ({ data: { session: null } }));
const mockSignInAnonymously = vi.fn(async () => ({ error: null }));

vi.mock("./supabaseClient", () => ({
  backendMode: "supabase",
  requiresSupabaseBackend: () => true,
  createSupabaseBrowserClient: vi.fn(() => ({
    auth: {
      getSession: (...args) => mockGetSession(...args),
      signInAnonymously: (...args) => mockSignInAnonymously(...args),
      signOut: vi.fn(async () => ({ error: null })),
      signInWithPassword: vi.fn(async () => ({ error: null })),
    },
    rpc: vi.fn(async () => ({ data: true, error: null })),
  })),
}));

import { createSupabaseBrowserClient } from "./supabaseClient";
import { StorageBootstrapError, createStorageAdapter } from "./storageAdapter";

describe("createStorageAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockSignInAnonymously.mockResolvedValue({ error: null });
    createSupabaseBrowserClient.mockReturnValue(null);
  });

  it("throws StorageBootstrapError when supabase client cannot be created", async () => {
    await expect(createStorageAdapter()).rejects.toBeInstanceOf(StorageBootstrapError);
  });

  it("throws StorageBootstrapError when anonymous auth fails", async () => {
    createSupabaseBrowserClient.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        signInAnonymously: mockSignInAnonymously,
      },
    });
    mockSignInAnonymously.mockResolvedValueOnce({ error: { message: "Auth failed" } });

    await expect(createStorageAdapter()).rejects.toThrow("Auth failed");
  });

  it("returns supabase adapter when auth bootstrap succeeds", async () => {
    createSupabaseBrowserClient.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        signInAnonymously: mockSignInAnonymously,
        signOut: vi.fn(async () => ({ error: null })),
        signInWithPassword: vi.fn(async () => ({ error: null })),
      },
      rpc: vi.fn(async () => ({ data: true, error: null })),
    });

    const { storage } = await createStorageAdapter();
    expect(storage.mode).toBe("supabase");
  });
});
