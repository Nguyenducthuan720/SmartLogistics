import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { API_BASE } from "../services/api";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const s = io(import.meta.env.VITE_SOCKET_URL || API_BASE.replace(/\/api$/, ""), {
            transports: ["websocket", "polling"]
        });

        s.on("connect", () => console.log("[Socket] Connected:", s.id));

        setSocket(s);

        return () => {
            s.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
