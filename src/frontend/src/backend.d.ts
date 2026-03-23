import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    email: string;
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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createListing(listing: PropertyListing): Promise<bigint>;
    deleteListing(id: bigint): Promise<void>;
    getAllListings(): Promise<Array<PropertyListing>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getListing(id: bigint): Promise<PropertyListing>;
    getMyListings(): Promise<Array<PropertyListing>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
}
