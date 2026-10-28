import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import Layout from "../components/common/Layout";
import Loading from "../components/common/Loading";
import { lazy, Suspense } from "react";

const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Orders = lazy(() => import("../pages/Orders"));
const Shipments = lazy(() => import("../pages/Shipments"));
const Drivers = lazy(() => import("../pages/Drivers"));
const Vehicles = lazy(() => import("../pages/Vehicles"));
const Warehouses = lazy(() => import("../pages/Warehouses"));
const Products = lazy(() => import("../pages/Products"));
const Users = lazy(() => import("../pages/Users"));
const Roles = lazy(() => import("../pages/Roles"));
const Tracking = lazy(() => import("../pages/Tracking"));
const AiRoutes = lazy(() => import("../pages/AiRoutes"));
const Reports = lazy(() => import("../pages/Reports"));
const Notifications = lazy(() => import("../pages/Notifications"));
const DriverDashboard = lazy(() => import("../pages/DriverDashboard"));
const CustomerDashboard = lazy(() => import("../pages/CustomerDashboard"));
const AvailableJobs = lazy(() => import("../pages/AvailableJobs"));
const Map = lazy(() => import("../pages/Map"));
const DriverWallet = lazy(() => import("../pages/DriverWallet"));
const Inventory = lazy(() => import("../pages/Inventory"));
const Customers = lazy(() => import("../pages/Customers"));
const Settings = lazy(() => import("../pages/Settings"));
const Account = lazy(() => import("../pages/Account"));
const Addresses = lazy(() => import("../pages/Addresses"));
const TrackingHub = lazy(() => import("../pages/TrackingHub"));
const AccessDenied = lazy(() => import("../pages/AccessDenied"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));

function RolePage({roles, children}) {
    return <ProtectedRoute roles={roles}><LazyLoad>{children}</LazyLoad></ProtectedRoute>;
}

function LazyLoad({ children }) {
    return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export default function AppRoutes() {
    const { user } = useAuth();
    const userRole = user?.roleName || user?.Role || user?.role || "";
    const isDriver = userRole === "DRIVER";
    const isCustomer = userRole === "CUSTOMER";
    const defaultRoute = isDriver ? "/driver-dashboard" : isCustomer ? "/customer-dashboard" : "/dashboard";

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LazyLoad><Login /></LazyLoad>} />
                <Route path="/register" element={<LazyLoad><Register /></LazyLoad>} />
                <Route path="/forgot-password" element={<LazyLoad><ForgotPassword /></LazyLoad>} />

                <Route path="/" element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Navigate to={defaultRoute} replace />} />
                    <Route path="dashboard" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Dashboard /></RolePage>} />
                    <Route path="driver-dashboard" element={<RolePage roles={["DRIVER"]}><DriverDashboard /></RolePage>} />
                    <Route path="available-jobs" element={<RolePage roles={["DRIVER"]}><AvailableJobs /></RolePage>} />
                    <Route path="customer-dashboard" element={<RolePage roles={["CUSTOMER"]}><CustomerDashboard /></RolePage>} />
                    <Route path="orders" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER","CUSTOMER"]}><Orders /></RolePage>} />
                    <Route path="orders/:orderId" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER","CUSTOMER"]}><Orders /></RolePage>} />
                    <Route path="shipments" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER","DRIVER"]}><Shipments /></RolePage>} />
                    <Route path="inventory" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Inventory /></RolePage>} />
                    <Route path="customers" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Customers /></RolePage>} />
                    <Route path="settings" element={<RolePage roles={["ADMIN"]}><Settings /></RolePage>} />
                    <Route path="account" element={<LazyLoad><Account /></LazyLoad>} />
                    <Route path="addresses" element={<RolePage roles={["CUSTOMER"]}><Addresses /></RolePage>} />
                    <Route path="tracking" element={<LazyLoad><TrackingHub /></LazyLoad>} />
                    <Route path="access-denied" element={<LazyLoad><AccessDenied /></LazyLoad>} />
                    <Route path="tracking/:shipmentId" element={<LazyLoad><Tracking /></LazyLoad>} />
                    <Route path="map" element={<LazyLoad><Map /></LazyLoad>} />
                    <Route path="wallet" element={<RolePage roles={["DRIVER"]}><DriverWallet /></RolePage>} />
                    <Route path="ai-routes" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER","DRIVER"]}><AiRoutes /></RolePage>} />
                    <Route path="reports" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Reports /></RolePage>} />
                    <Route path="notifications" element={<LazyLoad><Notifications /></LazyLoad>} />
                    <Route path="drivers" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Drivers /></RolePage>} />
                    <Route path="vehicles" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Vehicles /></RolePage>} />
                    <Route path="warehouses" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER"]}><Warehouses /></RolePage>} />
                    <Route path="products" element={<RolePage roles={["ADMIN","WAREHOUSE_MANAGER","CUSTOMER"]}><Products /></RolePage>} />
                    <Route path="users" element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <LazyLoad><Users /></LazyLoad>
                        </ProtectedRoute>
                    } />
                    <Route path="roles" element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <LazyLoad><Roles /></LazyLoad>
                        </ProtectedRoute>
                    } />
                </Route>

                <Route path="*" element={<Navigate to={defaultRoute} replace />} />
            </Routes>
        </BrowserRouter>
    );
}
