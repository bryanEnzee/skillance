// lib/hooks/useContracts.ts

import { ethers } from "ethers";
import {
    CHAT_STORAGE_ABI,
    CHAT_STORAGE_ADDRESS,
    MENTOR_BOOKING_ESCROW_ABI,
    MENTOR_BOOKING_ESCROW_ADDRESS,
} from "@/lib/contract";

export const getProvider = () => {
    if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not found");
    }
    return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = () => getProvider().getSigner();

export const getBookingContract = () => {
    if (!MENTOR_BOOKING_ESCROW_ADDRESS) {
        throw new Error("MENTOR_BOOKING_ESCROW_ADDRESS is not defined");
    }
    return new ethers.Contract(MENTOR_BOOKING_ESCROW_ADDRESS, MENTOR_BOOKING_ESCROW_ABI, getSigner());
};


export const getChatContract = () => {
    if (!CHAT_STORAGE_ADDRESS) {
        throw new Error("CHAT_STORAGE_ADDRESS is not defined");
    }
    return new ethers.Contract(CHAT_STORAGE_ADDRESS, CHAT_STORAGE_ABI, getSigner());
};
