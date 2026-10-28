import { useEffect, useRef, useState } from "react";
import { geocodeAddress } from "../../services/map.service";
import { HiOutlineSearch, HiOutlineLocationMarker } from "react-icons/hi";

export default function AddressAutocomplete({ onSelect, placeholder = "Search an address...", className = "" }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const debounceRef = useRef(null);
    const boxRef = useRef(null);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setOpen(false);
            return;
        }
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const list = await geocodeAddress(query.trim());
                setResults(list);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 450);
        return () => clearTimeout(debounceRef.current);
    }, [query]);

    useEffect(() => {
        const handler = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const pick = (r) => {
        onSelect(r);
        setQuery(r.displayName || "");
        setOpen(false);
    };

    return (
        <div ref={boxRef} className={`relative ${className}`}>
            <div className="relative">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => { if (results.length) setOpen(true); }}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
            </div>

            {open && results.length > 0 && (
                <ul className="absolute z-[1000] mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto">
                    {results.map((r) => (
                        <li
                            key={r.placeId || r.displayName}
                            onMouseDown={() => pick(r)}
                            className="flex items-start gap-3 px-3 py-2.5 hover:bg-blue-50 cursor-pointer text-sm"
                        >
                            <HiOutlineLocationMarker className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                            <span className="text-gray-700 leading-snug">{r.displayName}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
