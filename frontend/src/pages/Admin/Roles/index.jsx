import React, { useState } from 'react';
import { Shield, Clock, CalendarDays, ClipboardCheck } from 'lucide-react';
import PageHeader from '../../../components/common/PageHeader';
import RolesTab from './components/RolesTab';
import ShiftsTab from './components/ShiftsTab';
import AssignmentsTab from './components/AssignmentsTab';
import AttendanceTab from './components/AttendanceTab';

const RolesAndAttendance = () => {
    const [activeTab, setActiveTab] = useState('roles');

    const tabs = [
        { id: 'roles', label: 'Vai trò & Quyền', icon: Shield },
        { id: 'shifts', label: 'Ca làm việc', icon: Clock },
        { id: 'assignments', label: 'Phân ca', icon: CalendarDays },
        { id: 'attendance', label: 'Chấm công', icon: ClipboardCheck },
    ];

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Phân quyền & Chấm công" 
                subtitle="Quản lý vai trò, ca làm việc và theo dõi chấm công nhân viên"
            />
            
            {/* Tabs */}
            <div className="flex border-b border-[#ebe3dd]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                isActive 
                                    ? 'border-b-2 border-[#9c513d] text-[#9c513d]' 
                                    : 'text-[#8b7e76] hover:text-[#49332b]'
                            }`}
                        >
                            <Icon size={18} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-[#ebe3dd] p-6 min-h-[500px]">
                {activeTab === 'roles' && <RolesTab />}
                {activeTab === 'shifts' && <ShiftsTab />}
                {activeTab === 'assignments' && <AssignmentsTab />}
                {activeTab === 'attendance' && <AttendanceTab />}
            </div>
        </div>
    );
};

export default RolesAndAttendance;
