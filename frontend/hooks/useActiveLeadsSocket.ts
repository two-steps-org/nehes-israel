import { BACKEND_URL } from "@/lib/utils";
import { Lead } from "@/types/activeLeads.type";
import { io, Socket } from "socket.io-client";

type ActiveLeadsSocketProps = {
    socketRef: React.RefObject<Socket | null>
    setActiveLeads: (leads: Lead[]) => void
}

export function useActiveLeadsSocket({ socketRef, setActiveLeads }: ActiveLeadsSocketProps) {
    // Helper to connect socket and set up listener
    const connectSocket = () => {
        if (!socketRef.current) {
            socketRef.current = io(BACKEND_URL, {
                extraHeaders: {
                    "ngrok-skip-browser-warning": "true",
                    "Content-Type": "application/json"
                }
            });
            socketRef.current?.on("call_status_update", (data) => {
                // @ts-ignore
                setActiveLeads((prevLeads) => {
                    const normalize = (num: string = "") => {
                        const digits = num.replace(/\D/g, "");
                        return digits.slice(-9);
                    };
                    const toNorm = normalize(data.to);
                    const fromNorm = normalize(data.from);
                    // @ts-ignore
                    return prevLeads.map((lead) => {
                        const leadNorm = normalize(lead.phone_number);
                        if (leadNorm === toNorm || leadNorm === fromNorm) {
                            return { ...lead, status: data.status, duration: data.duration };
                        }
                        return lead;
                    });
                });
            });
        }
    };

    // Helper to disconnect socket
    const disconnectSocket = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
        }
    };

    return { connectSocket, disconnectSocket }
}
