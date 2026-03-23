import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Ad {
    id: bigint;
    title: string;
    linkUrl: string;
    createdAt: bigint;
    isActive: boolean;
    imageUrl: string;
}
export interface PropertyListing {
    id: bigint;
    ownerEmail: string;
    title: string;
    propertyType: string;
    ownerId: Principal;
    createdAt: bigint;
    description: string;
    mediaIds: Array<string>;
    price: bigint;
    location: string;
}
export interface Inquiry {
    id: bigint;
    listingId: bigint;
    buyerPhone: string;
    message: string;
    timestamp: bigint;
    buyerName: string;
}
export interface UserProfile {
    name: string;
    email: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAd(title: string, imageUrl: string, linkUrl: string): Promise<bigint>;
    createListing(listing: PropertyListing): Promise<bigint>;
    deleteListing(id: bigint): Promise<void>;
    getActiveAds(): Promise<Array<Ad>>;
    getAllAds(): Promise<Array<Ad>>;
    getAllListings(): Promise<Array<PropertyListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getGlobalStats(): Promise<{
        totalListings: bigint;
        totalUsers: bigint;
    }>;
    getInquiriesForListing(listingId: bigint): Promise<Array<Inquiry>>;
    getListing(id: bigint): Promise<PropertyListing>;
    getMyListings(): Promise<Array<PropertyListing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitInquiry(listingId: bigint, buyerName: string, buyerPhone: string, message: string): Promise<bigint>;
    toggleAdActiveState(adId: bigint): Promise<void>;
    updateAd(adId: bigint, title: string, imageUrl: string, linkUrl: string): Promise<void>;
    updateListing(listingId: bigint, title: string, description: string, price: bigint, propertyType: string, location: string, mediaIds: Array<string>): Promise<void>;
}
