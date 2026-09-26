import React, { useState, useRef } from "react";
import { Camera, Trash2, User, Loader2, Upload } from "lucide-react";

const AvatarUploader = ({
    avatarUrl,
    name,
    loading = false,
    onUpload,
    onRemove,
    size = "md", // sm, md, lg
}) => {
    const fileInputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const sizeClasses = {
        sm: "w-16 h-16 text-2xl",
        md: "w-24 h-24 text-4xl",
        lg: "w-32 h-32 text-5xl",
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Basic validation
        if (file.size > 5 * 1024 * 1024) {
            alert("Kích thước file không được vượt quá 5MB");
            return;
        }
        if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)) {
            alert("Chỉ chấp nhận định dạng JPG, PNG, WEBP");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        onUpload(file);
    };

    const handleRemove = () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa ảnh đại diện này?")) {
            setPreviewUrl(null);
            onRemove();
        }
    };

    const displayUrl = previewUrl || avatarUrl;

    const getInitials = (name) => {
        if (!name) return "";
        return name.charAt(0).toUpperCase();
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <div className="relative group">
                <div
                    className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg relative`}
                >
                    {loading ? (
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                    ) : displayUrl ? (
                        <img
                            src={displayUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = "none";
                            }}
                        />
                    ) : (
                        <span className="font-bold text-gray-500 dark:text-gray-400">
                            {getInitials(name) || <User className="w-1/2 h-1/2" />}
                        </span>
                    )}

                    {!loading && (
                        <div
                            className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Camera className="w-6 h-6 text-white mb-1" />
                            <span className="text-white text-xs">Thay đổi</span>
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    onChange={handleFileChange}
                />
            </div>

            {displayUrl && !loading && (
                <button
                    type="button"
                    onClick={handleRemove}
                    className="flex items-center space-x-1 text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa ảnh</span>
                </button>
            )}
        </div>
    );
};

export default AvatarUploader;
