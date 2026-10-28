import Brand from "./Brand";
import { useEffect, useRef, useState } from "react";
import routeIllustration from "../../assets/figma/auth-route.svg";

export default function AuthLayout({ title, description, children }) {
    const illustrationRef = useRef(null);
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const observer = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / 524));
        if (illustrationRef.current) observer.observe(illustrationRef.current);
        return () => observer.disconnect();
    }, []);
    return <div className="auth-layout">
        <section className="auth-story">
            <Brand light />
            <div className="auth-story-content">
                <h1>Kết nối mọi<br />chặng đường.</h1>
                <p>Một nền tảng cho điều phối, giao nhận<br />và trải nghiệm khách hàng.</p>
                <div className="auth-route-viewport" ref={illustrationRef}>
                    <img src={routeIllustration} width="524" height="300" style={{ transform: `scale(${scale})` }} alt="Minh họa tuyến đường kết nối các điểm giao hàng" />
                    <span>TP. HỒ CHÍ MINH · MẠNG LƯỚI GIAO NHẬN</span>
                </div>
            </div>
            <p className="auth-footnote">QUẢN LÝ / TÀI XẾ / KHÁCH HÀNG</p>
        </section>
        <main className="auth-form-side"><div className="auth-mobile-brand"><Brand /></div>
            <div className="auth-form-content"><h2>{title}</h2><p className="auth-description">{description}</p>{children}</div>
        </main>
    </div>;
}
