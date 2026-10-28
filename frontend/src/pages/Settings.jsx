import { useState } from "react";
import useCollection from "../hooks/useCollection";
import api from "../services/api";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";

export default function Settings(){
    const {rows,loading,error,reload}=useCollection("/settings");
    const [drafts,setDrafts]=useState({}),[saving,setSaving]=useState(false),[message,setMessage]=useState(""),[saveError,setSaveError]=useState("");
    const save=async e=>{e.preventDefault();setSaving(true);setMessage("");setSaveError("");try{for(const r of rows){if(drafts[r.SettingKey]!==undefined&&drafts[r.SettingKey]!==r.SettingValue)await api.put("/settings",{key:r.SettingKey,value:drafts[r.SettingKey],description:r.Description});}setDrafts({});await reload();setMessage("Đã lưu cấu hình.");}catch(err){setSaveError(err.response?.data?.message||"Chưa lưu được tất cả thay đổi. Vui lòng kiểm tra và thử lại.");}finally{setSaving(false);}};
    return <form className="space-y-6" onSubmit={save}><PageHeader title="Cài đặt hệ thống" subtitle="Cấu hình vận hành được lưu trong hệ thống hiện tại." actions={<Button type="submit" disabled={saving||loading||!Object.keys(drafts).length}>{saving?"Đang lưu...":"Lưu thay đổi"}</Button>}/>
        {(error||saveError)&&<p role="alert" className="notice error-notice">{error||saveError}</p>}{message&&<p role="status" className="notice">{message}</p>}
        <div className="card space-y-6">{loading?<Spinner/>:rows.length?rows.map(r=><div key={r.SettingKey}><label className="label" htmlFor={"setting-"+r.SettingID}>{r.Description||r.SettingKey}</label><input id={"setting-"+r.SettingID} className="input" value={drafts[r.SettingKey]??r.SettingValue??""} onChange={e=>setDrafts({...drafts,[r.SettingKey]:e.target.value})}/><p className="text-xs text-slatex mt-2">{r.SettingKey}</p></div>):<p className="text-slatex">Chưa có cấu hình trong hệ thống.</p>}</div>
    </form>;
}
