import React, { useState, useEffect } from 'react';
import { Pencil, LoaderCircle } from 'lucide-react';
import ProfileSummary from '../../../components/admin/profile/ProfileSummary';
import PersonalInformation from '../../../components/admin/profile/PersonalInformation';
import SecurityCard from '../../../components/admin/profile/SecurityCard';
import AccountStatusCard from '../../../components/admin/profile/AccountStatusCard';
import ActivityLogCard from '../../../components/admin/profile/ActivityLogCard';
import EditProfileModal from '../../../components/admin/profile/EditProfileModal';
import { getAdminProfile } from '../../../services/admin/profile.service';
import { getApiErrorMessage } from '../../../utils/apiError';
import { showError } from '../../../utils/toast';

const Profile = () => {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await getAdminProfile();
            setProfile(data);
            localStorage.setItem("admin_data", JSON.stringify(data));
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleProfileUpdate = (updatedProfile) => {
        setProfile(updatedProfile);
        localStorage.setItem("admin_data", JSON.stringify(updatedProfile));
        window.dispatchEvent(new Event("admin-profile-updated"));
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoaderCircle className="animate-spin text-[#604238]" size={32} />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex min-h-[400px] items-center justify-center text-[#958981]">
                Không thể tải thông tin hồ sơ
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* PAGE HEADER */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                    <h1 className="text-2xl font-bold text-[#302723]">
                        Hồ sơ quản trị viên
                    </h1>
                    <p className="mt-1 text-xs text-[#958981]">
                        Quản lý thông tin cá nhân và bảo mật tài khoản của bạn.
                    </p>
                </div>

                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex h-10 items-center gap-2 rounded-lg bg-[#604238] px-4 text-xs font-semibold text-white hover:bg-[#50362f]"
                >
                    <Pencil size={15} />
                    Chỉnh sửa hồ sơ
                </button>
            </div>

            {/* PROFILE SUMMARY */}
            <ProfileSummary admin={profile} onUpdate={handleProfileUpdate} />

            {/* MAIN LAYOUT */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* LEFT COLUMN: 68% */}
                <div className="w-full lg:w-[68%] space-y-6">
                    <PersonalInformation 
                        admin={profile} 
                        onEdit={() => setIsEditModalOpen(true)} 
                    />
                    <ActivityLogCard />
                </div>

                {/* RIGHT COLUMN: 32% */}
                <div className="w-full lg:w-[32%] space-y-6">
                    <SecurityCard />
                    <AccountStatusCard admin={profile} />
                </div>
            </div>

            {/* MODALS */}
            <EditProfileModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                admin={profile} 
                onSuccess={handleProfileUpdate}
            />
        </div>
    );
};

export default Profile;
