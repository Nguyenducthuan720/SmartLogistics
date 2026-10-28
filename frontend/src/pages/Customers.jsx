import { useState } from "react";
import useCollection from "../hooks/useCollection";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import Spinner from "../components/common/Spinner";

export default function Customers(){
    const {user}=useAuth(),admin=(user?.roleName||user?.Role||user?.role)==="ADMIN";
    const [search,setSearch]=useState(""),[page,setPage]=useState(1);
    const {rows,loading,error,pagination,reload}=useCollection("/customers",{search,page,limit:10});
    const [edit,setEdit]=useState(null),[form,setForm]=useState({}),[saving,setSaving]=useState(false),[saveError,setSaveError]=useState("");
    const open=c=>{setEdit(c||{});setForm(c?{companyName:c.CompanyName||"",taxCode:c.TaxCode||"",contactPerson:c.ContactPerson||"",customerType:c.CustomerType||"INDIVIDUAL"}:{userId:"",companyName:"",taxCode:"",contactPerson:"",customerType:"INDIVIDUAL"});setSaveError("");};
    const save=async e=>{e.preventDefault();setSaving(true);setSaveError("");try{if(edit.CustomerID)await api.put(`/customers/${edit.CustomerID}`,form);else await api.post("/customers",{...form,userId:Number(form.userId)});setEdit(null);await reload();}catch(err){setSaveError(err.response?.data?.message||"Không lưu được khách hàng.");}finally{setSaving(false);}};
    return <div className="space-y-6"><PageHeader title="Quản lý khách hàng" subtitle="Thông tin khách hàng và liên hệ trong mạng lưới." actions={admin&&<Button onClick={()=>open(null)}>+ Thêm khách hàng</Button>}/>
        <input className="input max-w-lg" placeholder="Tìm công ty, người liên hệ..." aria-label="Tìm khách hàng" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        {error&&<p role="alert" className="notice error-notice">{error}</p>}
        <div className="table-wrap"><table className="w-full"><thead><tr>{["Mã KH","Khách hàng","Email","Điện thoại","Loại","Thao tác"].map(t=><th className="th" key={t}>{t}</th>)}</tr></thead><tbody>{loading?<tr><td colSpan={6}><Spinner/></td></tr>:rows.map(c=><tr key={c.CustomerID} className="row-hover"><td className="td">KH-{c.CustomerID}</td><td className="td">{c.CompanyName||c.FullName}<small className="block text-slatex">{c.ContactPerson}</small></td><td className="td">{c.Email}</td><td className="td">{c.UserPhone||"—"}</td><td className="td">{c.CustomerType==="INDIVIDUAL"?"Cá nhân":"Doanh nghiệp"}</td><td className="td">{admin?<Button variant="outline" size="sm" onClick={()=>open(c)}>Chỉnh sửa</Button>:"Chỉ xem"}</td></tr>)}{!loading&&!rows.length&&<tr><td className="td text-center" colSpan={6}>Không tìm thấy khách hàng.</td></tr>}</tbody></table></div>
        <div className="flex gap-3 justify-end"><Button variant="outline" disabled={page<=1} onClick={()=>setPage(page-1)}>Trước</Button><span className="py-3 text-sm">{page} / {pagination.totalPages||1}</span><Button variant="outline" disabled={page>=(pagination.totalPages||1)} onClick={()=>setPage(page+1)}>Sau</Button></div>
        <Modal isOpen={edit!==null} onClose={()=>setEdit(null)} title={edit?.CustomerID?"Chỉnh sửa khách hàng":"Thêm khách hàng"}><form className="space-y-4" onSubmit={save}>{!edit?.CustomerID&&<InputField label="ID người dùng đã đăng ký" type="number" value={form.userId} onChange={e=>setForm({...form,userId:e.target.value})} required/>}{[["companyName","Tên công ty"],["contactPerson","Người liên hệ"],["taxCode","Mã số thuế"]].map(([key,label])=><InputField key={key} label={label} value={form[key]||""} onChange={e=>setForm({...form,[key]:e.target.value})}/>)}<InputField label="Loại khách hàng" type="select" value={form.customerType} onChange={e=>setForm({...form,customerType:e.target.value})} options={[{value:"INDIVIDUAL",label:"Cá nhân"},{value:"BUSINESS",label:"Doanh nghiệp"}]}/>{saveError&&<p className="text-rose-600 text-sm" role="alert">{saveError}</p>}<Button type="submit" disabled={saving}>{saving?"Đang lưu...":"Lưu khách hàng"}</Button></form></Modal>
    </div>;
}
