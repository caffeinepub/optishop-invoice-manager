import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface T {
    name: string;
    createdAt: bigint;
    sellingPrice: number;
    frameNumber: string;
    quantity: bigint;
    brand: string;
    costPrice: number;
}
export interface T__2 {
    axis: bigint;
    addition: number;
    cylinder: number;
    sphere: number;
}
export interface UserProfile {
    name: string;
}
export interface T__1 {
    id: string;
    gst: number;
    customerName: string;
    createdAt: bigint;
    mobileNumber: string;
    grandTotal: number;
    frameNumber: string;
    framePrice: number;
    profit: number;
    lensPrice: number;
    rightEye: T__2;
    leftEye: T__2;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFrame(frame: T): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createInvoice(invoice: T__1): Promise<T__1>;
    deleteFrame(frameNumber: string): Promise<void>;
    deleteInvoice(id: string): Promise<void>;
    getAllFrames(): Promise<Array<T>>;
    getAllInvoices(): Promise<Array<T__1>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailySales(date: string): Promise<{
        totalProfit: number;
        totalSales: number;
    }>;
    getFrame(frameNumber: string): Promise<T>;
    getInvoice(id: string): Promise<T__1>;
    getMonthlySales(year: bigint, month: bigint): Promise<{
        totalProfit: number;
        totalSales: number;
    }>;
    getSalesSummary(): Promise<{
        invoiceCount: bigint;
        todayProfit: number;
        monthProfit: number;
        todayTotal: number;
        monthTotal: number;
    }>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateFrame(frameNumber: string, updatedFrame: T): Promise<void>;
}
