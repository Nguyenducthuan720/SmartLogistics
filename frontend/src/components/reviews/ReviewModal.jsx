import { useState } from "react";
import { createReview } from "../../services/reviews.service";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useToast } from "../../contexts/ToastContext";
import { HiStar } from "react-icons/hi";

export default function ReviewModal({ isOpen, onClose, shipmentId, driverName, onSubmitted }) {
    const toast = useToast();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [comment, setComment] = useState("");
    const [saving, setSaving] = useState(false);

    const submit = async () => {
        if (!rating) return toast("Please choose a star rating", "warning");
        setSaving(true);
        try {
            await createReview({ shipmentId, rating, comment });
            toast("Thank you for your review!", "success");
            onClose();
            onSubmitted?.();
        } catch (err) {
            toast(err.response?.data?.message || "Could not submit review", "error");
        } finally { setSaving(false); }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Rate your delivery"
            footer={<><Button variant="ghost" onClick={onClose}>Hủy</Button><Button onClick={submit} disabled={saving}>{saving ? "Sending..." : "Submit review"}</Button></>}>
            <div className="space-y-4">
                {driverName && <p className="text-sm text-slate-500">Tài xế: <b className="text-slate-800">{driverName}</b></p>}
                <div>
                    <p className="label">Your rating</p>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <button key={n} type="button"
                                onMouseEnter={() => setHover(n)} onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(n)}
                                className="text-3xl transition">
                                <HiStar className={n <= (hover || rating) ? "text-amber-400" : "text-slate-300"} />
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="label">Comment (optional)</label>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                        placeholder="Share details about your delivery experience..."
                        className="input" />
                </div>
            </div>
        </Modal>
    );
}
