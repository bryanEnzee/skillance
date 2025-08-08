"use client"

import { useParams } from "next/navigation"
import ChatPage from "@/app/chat/page" // adjust path if needed

export default function ChatSessionPage() {
    const params = useParams();
    const bookingId = Number(params?.bookingId);

    if (!bookingId || isNaN(bookingId)) {
        return <div className="text-white p-4">❌ Invalid booking ID</div>;
    }

    return <ChatPage bookingId={bookingId} />;
}
