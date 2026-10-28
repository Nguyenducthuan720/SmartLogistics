import { useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import Swal from "sweetalert2";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineCube } from "react-icons/hi";
import Modal from "../components/common/Modal";
import { InputField } from "../components/common/FormField";
import PageHeader from "../components/common/PageHeader";
import Button from "../components/common/Button";
import Spinner from "../components/common/Spinner";
import EmptyState from "../components/common/EmptyState";

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ categoryId: "", productCode: "", productName: "", weight: "", price: "", unit: "Piece", description: "" });
    const [categories, setCategories] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const { user } = useAuth();
    const role = user?.roleName || user?.Role;
    const canManage = ["ADMIN", "WAREHOUSE_MANAGER"].includes(role);
    const canCreate = canManage || role === "CUSTOMER";

    const fetchProducts = () => {
        setLoading(true);
        api.get("/products")
            .then(({ data }) => setProducts(data.data || []))
            .catch((err) => Swal.fire({ icon: "error", title: "Cannot load products", text: err.response?.data?.message || "Please try again" }))
            .finally(() => setLoading(false));
    };
    useEffect(() => { fetchProducts(); }, []);

    const openCreate = async () => {
        try {
            const { data } = await api.get("/products/categories");
            setCategories(data.data || []);
        } catch (err) {
            Swal.fire({ icon: "error", title: "Cannot load categories", text: err.response?.data?.message || "Please try again" });
            return;
        }
        setEditing(null); setForm({ categoryId: "1", productCode: "", productName: "", weight: "", price: "", unit: "Piece", description: "" }); setShowForm(true);
    };

    const openEdit = (p) => { setEditing(p); setForm({ categoryId: p.CategoryID, productCode: p.ProductCode || "", productName: p.ProductName, weight: p.Weight || "", price: p.Price || "", unit: p.Unit || "Piece", description: p.Description || "" }); setShowForm(true); };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = { categoryId: parseInt(form.categoryId), productCode: form.productCode, productName: form.productName, weight: parseFloat(form.weight) || null, price: parseFloat(form.price) || null, unit: form.unit, description: form.description };
            if (editing) { await api.put(`/products/${editing.ProductID}`, payload); Swal.fire({ icon: "success", title: "Updated", timer: 1500, showConfirmButton: false }); }
            else { await api.post("/products", payload); Swal.fire({ icon: "success", title: "Product created", timer: 1500, showConfirmButton: false }); }
            setShowForm(false); fetchProducts();
        } catch (err) { Swal.fire({ icon: "error", title: "Có lỗi xảy ra", text: err.response?.data?.message || "Thất bại" }); }
        finally { setSubmitting(false); }
    };

    return (
        <div>
            <PageHeader
                title="Danh mục sản phẩm"
                subtitle="Manage product catalog, pricing and categories"
                icon={HiOutlineCube}
                actions={
                    canCreate && (
                        <Button variant="primary" onClick={openCreate}>
                            <HiOutlinePlus className="w-5 h-5" /> Thêm sản phẩm
                        </Button>
                    )
                }
            />
            <div className="table-wrap">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="th">Mã sản phẩm</th>
                            <th className="th">Sản phẩm</th>
                            <th className="th">Danh mục</th>
                            <th className="th">Khối lượng</th>
                            <th className="th">Đơn vị</th>
                            <th className="th">Đơn giá</th>
                            <th className="th text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} className="td text-center"><Spinner /></td></tr>
                        ) : products.length === 0 ? (
                            <tr><td colSpan={7}><EmptyState icon={HiOutlineCube} title="No products" description="Add a product to your catalog to get started." /></td></tr>
                        ) : (
                            products.map((p) => (
                                <tr key={p.ProductID} className="row-hover">
                                    <td className="td font-medium">{p.ProductCode}</td>
                                    <td className="td text-ink">{p.ProductName}</td>
                                    <td className="td">{p.CategoryName}</td>
                                    <td className="td">{p.Weight} kg</td>
                                    <td className="td">{p.Unit}</td>
                                    <td className="td">{(p.Price || 0).toLocaleString()} VND</td>
                                    <td className="td text-right">{canManage && <button onClick={() => openEdit(p)} className="btn btn-link p-0"><HiOutlinePencil className="w-5 h-5" /></button>}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <InputField label="Danh mục" type="select" name="categoryId" value={form.categoryId} onChange={handleChange} required
                        options={categories.map(category => ({ value: category.CategoryID, label: category.CategoryName }))} />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Mã sản phẩm" name="productCode" value={form.productCode} onChange={handleChange} />
                        <InputField label="Tên sản phẩm" name="productName" value={form.productName} onChange={handleChange} required />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <InputField label="Khối lượng (kg)" type="number" name="weight" value={form.weight} onChange={handleChange} />
                        <InputField label="Đơn vị" name="unit" value={form.unit} onChange={handleChange} />
                        <InputField label="Price (VND)" type="number" name="price" value={form.price} onChange={handleChange} />
                    </div>
                    <InputField label="Mô tả" type="textarea" name="description" value={form.description} onChange={handleChange} />
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline">Hủy</button>
                        <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">{submitting ? "Đang lưu..." : editing ? "Update" : "Create"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
