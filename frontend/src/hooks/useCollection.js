import { useCallback, useEffect, useState } from "react";
import api from "../services/api";

export default function useCollection(path, params = {}) {
    const query = JSON.stringify(params);
    const [rows,setRows] = useState([]), [pagination,setPagination] = useState({}), [loading,setLoading] = useState(true), [error,setError] = useState("");
    const load = useCallback(async () => {
        setLoading(true); setError("");
        try { const res=await api.get(path,{params:JSON.parse(query)}); setRows(res.data.data || []); setPagination(res.data.pagination || {}); }
        catch(err) { setError(err.response?.data?.message || "Không tải được dữ liệu. Vui lòng thử lại."); }
        finally { setLoading(false); }
    },[path,query]);
    useEffect(() => { load(); },[load]);
    return {rows,pagination,loading,error,reload:load};
}
