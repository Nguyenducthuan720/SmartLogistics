import { useState } from "react";
import useCollection from "../hooks/useCollection";
import api from "../services/api";
import PageHeader from "../components/common/PageHeader";
import StatCard from "../components/common/StatCard";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import Spinner from "../components/common/Spinner";
import Badge from "../components/common/Badge";

export default function Inventory(){
    const [page,setPage]=useState(1), [warehouseId,setWarehouse]=useState("");
    const {rows,pagination,loading,error,reload}=useCollection("/inventory",{page,limit:10,warehouseId:warehouseId || undefined});
    const {rows:warehouses}=useCollection("/warehouses",{limit:100});
    const [selected,setSelected]=useState(null),[quantity,setQuantity]=useState(""),[reserved,setReserved]=useState(""),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState("");
    const save=async e=>{
        e.preventDefault(); setSaveError("");
        if(!Number.isInteger(Number(quantity))||!Number.isInteger(Number(reserved))||Number(quantity)<0||Number(reserved)<0||Number(reserved)>Number(quantity)){setSaveError("Số lượng phải là số nguyên không âm; số đặt trước không vượt quá tồn kho.");return;}
        setSaving(true);
        try{await api.put(`/inventory/${selected.InventoryID}`,{quantity:Number(quantity),reservedQuantity:Number(reserved)});setSelected(null);await reload();}
        catch(err){setSaveError(err.response?.data?.message || "Không lưu được tồn kho.");}
        finally{setSaving(false);}
    };
    return <div className="space-y-6"><PageHeader title="Quản lý tồn kho" subtitle="Theo dõi số lượng thực tế và hàng đã đặt trước tại từng kho." />
        <div className="grid gap-4 sm:grid-cols-3"><StatCard label="Bản ghi tồn kho" value={pagination.total || 0}/><StatCard label="Kho đang lọc" value={warehouseId?warehouses.find(w=>String(w.WarehouseID)===warehouseId)?.WarehouseName:"Tất cả"}/><StatCard label="Khả dụng trong trang" value={rows.reduce((s,r)=>s+Math.max(0,(r.Quantity||0)-(r.ReservedQuantity||0)),0)}/></div>
        <select className="input max-w-sm" aria-label="Lọc theo kho" value={warehouseId} onChange={e=>{setWarehouse(e.target.value);setPage(1);}}><option value="">Tất cả kho</option>{warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseName}</option>)}</select>
        {error&&<div role="alert" className="notice error-notice">{error}<Button variant="outline" onClick={reload}>Thử lại</Button></div>}
        <div className="table-wrap"><table className="w-full"><thead><tr>{["Mã sản phẩm","Sản phẩm","Kho / Khu vực","Tồn kho","Đặt trước","Khả dụng","Thao tác"].map(t=><th className="th" key={t}>{t}</th>)}</tr></thead><tbody>{loading?<tr><td colSpan={7}><Spinner/></td></tr>:rows.map(r=><tr key={r.InventoryID} className="row-hover"><td className="td">{r.ProductCode}</td><td className="td">{r.ProductName}</td><td className="td">{r.WarehouseName}<small className="block text-slatex">{r.ZoneName}</small></td><td className="td">{r.Quantity}</td><td className="td">{r.ReservedQuantity||0}</td><td className="td"><Badge tone={r.Quantity-r.ReservedQuantity>0?"green":"rose"}>{Math.max(0,(r.Quantity||0)-(r.ReservedQuantity||0))}</Badge></td><td className="td"><Button size="sm" variant="outline" onClick={()=>{setSelected(r);setQuantity(r.Quantity);setReserved(r.ReservedQuantity||0);setSaveError("");}}>Điều chỉnh</Button></td></tr>)}{!loading&&!rows.length&&<tr><td className="td text-center" colSpan={7}>Chưa có dữ liệu tồn kho.</td></tr>}</tbody></table></div>
        <div className="flex gap-3 justify-end"><Button variant="outline" disabled={page<=1||loading} onClick={()=>setPage(page-1)}>Trước</Button><span className="py-3 text-sm">{page} / {pagination.totalPages||1}</span><Button variant="outline" disabled={page>=(pagination.totalPages||1)||loading} onClick={()=>setPage(page+1)}>Sau</Button></div>
        <Modal isOpen={Boolean(selected)} onClose={()=>setSelected(null)} title="Điều chỉnh tồn kho"><form onSubmit={save} className="space-y-4"><p>{selected?.ProductName}</p><InputField label="Số lượng tồn" type="number" value={quantity} onChange={e=>setQuantity(e.target.value)} required/><InputField label="Số lượng đặt trước" type="number" value={reserved} onChange={e=>setReserved(e.target.value)} required/>{saveError&&<p role="alert" className="text-rose-600 text-sm">{saveError}</p>}<Button type="submit" disabled={saving}>{saving?"Đang lưu...":"Lưu điều chỉnh"}</Button></form></Modal>
    </div>;
}
