import useCollection from "../hooks/useCollection";
import PageHeader from "../components/common/PageHeader";
import Spinner from "../components/common/Spinner";
import Card from "../components/common/Card";
export default function Addresses(){
    const {rows,loading,error}=useCollection("/orders",{limit:100});
    const addresses=[...new Set(rows.flatMap(o=>[o.PickupAddress,o.DeliveryAddress]).filter(Boolean))];
    return <div className="space-y-6"><PageHeader title="Sổ địa chỉ" subtitle="Địa chỉ gần đây từ các đơn hàng của bạn."/><p className="notice">Danh sách được lấy từ 100 đơn gần nhất. Tính năng thêm địa chỉ và đặt mặc định cần API sổ địa chỉ riêng.</p>{error&&<p role="alert" className="notice error-notice">{error}</p>}{loading?<Spinner/>:addresses.length?<div className="grid gap-4 md:grid-cols-2">{addresses.map(address=><Card key={address}><h2 className="font-semibold mb-2">Địa chỉ giao nhận</h2><p className="text-sm text-slatex">{address}</p></Card>)}</div>:<Card>Chưa có địa chỉ. Địa chỉ sẽ xuất hiện khi bạn tạo đơn hàng.</Card>}</div>;
}
