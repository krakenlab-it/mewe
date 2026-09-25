import { beforeEach, describe, expect, it, vi } from "vitest";

const mockGetSession = vi.fn(async () => ({ data: { session: null } }));
const mockSignInAnonymously = vi.fn(async () => ({ error: null }));
const mockRpc = vi.fn(async () => ({ data: true, error: null }));

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
import { StorageBootstrapError, createStorageAdapter, resolveConfiguredAdminPassword } from "./storageAdapter";

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

  it("keeps facilitadora passwords empty unless one is configured", () => {
    expect(resolveConfiguredAdminPassword(undefined)).toBe("");
    expect(resolveConfiguredAdminPassword("  ")).toBe("");
    expect(resolveConfiguredAdminPassword("mewe2026")).toBe("mewe2026");
  });

  it("turns a claim_pair_access failure string into an error", async () => {
    mockRpc.mockResolvedValue({ data: null, error: null });
    createSupabaseBrowserClient.mockReturnValue({
      auth: {
        getSession: mockGetSession,
        signInAnonymously: mockSignInAnonymously,
        signOut: vi.fn(async () => ({ error: null })),
        signInWithPassword: vi.fn(async () => ({ error: null })),
      },
      rpc: (...args) => mockRpc(...args),
    });

    const { storage } = await createStorageAdapter();
    mockRpc.mockResolvedValueOnce({ data: "Pair code not found", error: null });
    await expect(storage.claimPairAccess("ABCDEF", "hija")).rejects.toThrow("Pair code not found");
    expect(mockRpc).toHaveBeenCalledWith("claim_pair_access", {
      p_pair_code: "ABCDEF",
      p_role: "daughter",
    });

    mockRpc.mockResolvedValueOnce({ data: null, error: null });
    await expect(storage.claimPairAccess("ABCDEF", "madre")).resolves.toBeUndefined();
  });
});
