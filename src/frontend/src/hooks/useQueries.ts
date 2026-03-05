import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { T, T__1 } from "../backend.d";
import { useActor } from "./useActor";
import { useIsActorReady } from "./useInitialized";

// ─── Frames ─────────────────────────────────────────────────────────────────

export function useGetAllFrames() {
  const { actor, isFetching } = useActor();
  const { isReady } = useIsActorReady();
  return useQuery<T[]>({
    queryKey: ["frames"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllFrames();
      } catch (err) {
        console.warn("getAllFrames failed, returning empty array:", err);
        return [];
      }
    },
    enabled: isReady && !!actor && !isFetching,
    retry: 3,
    retryDelay: (attempt) => attempt * 1500,
  });
}

export function useAddFrame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (frame: T) => {
      if (!actor) throw new Error("No actor");
      return actor.addFrame(frame);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frames"] });
    },
  });
}

export function useUpdateFrame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      frameNumber,
      updatedFrame,
    }: {
      frameNumber: string;
      updatedFrame: T;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateFrame(frameNumber, updatedFrame);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frames"] });
    },
  });
}

export function useDeleteFrame() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (frameNumber: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteFrame(frameNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["frames"] });
    },
  });
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export function useGetAllInvoices() {
  const { actor, isFetching } = useActor();
  const { isReady } = useIsActorReady();
  return useQuery<T__1[]>({
    queryKey: ["invoices"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return await actor.getAllInvoices();
      } catch (err) {
        console.warn("getAllInvoices failed, returning empty array:", err);
        return [];
      }
    },
    enabled: isReady && !!actor && !isFetching,
    retry: 3,
    retryDelay: (attempt) => attempt * 1500,
  });
}

export function useCreateInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: T__1) => {
      if (!actor) throw new Error("No actor");
      return actor.createInvoice(invoice);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["salesSummary"] });
    },
  });
}

export function useDeleteInvoice() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteInvoice(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["salesSummary"] });
    },
  });
}

// ─── Sales ───────────────────────────────────────────────────────────────────

export function useGetSalesSummary() {
  const { actor, isFetching } = useActor();
  const { isReady } = useIsActorReady();
  return useQuery<{
    invoiceCount: bigint;
    todayProfit: number;
    monthProfit: number;
    todayTotal: number;
    monthTotal: number;
  }>({
    queryKey: ["salesSummary"],
    queryFn: async () => {
      if (!actor)
        return {
          invoiceCount: BigInt(0),
          todayProfit: 0,
          monthProfit: 0,
          todayTotal: 0,
          monthTotal: 0,
        };
      try {
        return await actor.getSalesSummary();
      } catch (err) {
        console.warn("getSalesSummary failed, returning defaults:", err);
        return {
          invoiceCount: BigInt(0),
          todayProfit: 0,
          monthProfit: 0,
          todayTotal: 0,
          monthTotal: 0,
        };
      }
    },
    enabled: isReady && !!actor && !isFetching,
    retry: 3,
    retryDelay: (attempt) => attempt * 1500,
    refetchInterval: 30_000,
  });
}
