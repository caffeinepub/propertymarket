import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Inquiry, PropertyListing, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useGetAllListings() {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing[]>({
    queryKey: ["listings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetListing(id: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing>({
    queryKey: ["listing", id.toString()],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getListing(id);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyListings() {
  const { actor, isFetching } = useActor();
  return useQuery<PropertyListing[]>({
    queryKey: ["myListings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyListings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetGlobalStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{ totalUsers: bigint; totalListings: bigint }>({
    queryKey: ["globalStats"],
    queryFn: async () => {
      if (!actor) return { totalUsers: BigInt(0), totalListings: BigInt(0) };
      return actor.getGlobalStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useCreateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (listing: PropertyListing) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.createListing(listing);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["globalStats"] });
    },
  });
}

export function useUpdateListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listingId,
      title,
      description,
      price,
      propertyType,
      location,
      mediaIds,
    }: {
      listingId: bigint;
      title: string;
      description: string;
      price: bigint;
      propertyType: string;
      location: string;
      mediaIds: string[];
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.updateListing(
        listingId,
        title,
        description,
        price,
        propertyType,
        location,
        mediaIds,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
    },
  });
}

export function useDeleteListing() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.deleteListing(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["listings"] });
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      queryClient.invalidateQueries({ queryKey: ["globalStats"] });
    },
  });
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
      queryClient.invalidateQueries({ queryKey: ["globalStats"] });
    },
  });
}

export function useSubmitInquiry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      listingId,
      buyerName,
      buyerPhone,
      message,
    }: {
      listingId: bigint;
      buyerName: string;
      buyerPhone: string;
      message: string;
    }) => {
      if (!actor) throw new Error("Not authenticated");
      return actor.submitInquiry(listingId, buyerName, buyerPhone, message);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inquiries", variables.listingId.toString()],
      });
    },
  });
}

export function useGetInquiriesForListing(listingId: bigint) {
  const { actor, isFetching } = useActor();
  return useQuery<Inquiry[]>({
    queryKey: ["inquiries", listingId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getInquiriesForListing(listingId);
    },
    enabled: !!actor && !isFetching,
  });
}
