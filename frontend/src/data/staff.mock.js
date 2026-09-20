export const mockStaff = {
    id: 1,
    staff_code: "STF102",
    full_name: "Nguyễn Minh Anh",
    email: "minhanh@cafeflow.vn",
    phone: "0901234567",
    position: "MANAGER",
    status: "ACTIVE",
    hire_date: "2023-01-15",
    avatar_url: null,
};

export const mockTables = [
    { id: 1, table_name: "Bàn 01", area_name: "Tầng 1", capacity: 4, status: "AVAILABLE" },
    { id: 2, table_name: "Bàn 02", area_name: "Tầng 1", capacity: 2, status: "OCCUPIED" },
    { id: 3, table_name: "Bàn 03", area_name: "Tầng 1", capacity: 4, status: "OCCUPIED" },
    { id: 4, table_name: "Bàn 04", area_name: "Sân vườn", capacity: 6, status: "RESERVED" },
    { id: 5, table_name: "Bàn 05", area_name: "Tầng 2", capacity: 2, status: "AVAILABLE" },
    { id: 6, table_name: "Bàn 06", area_name: "Tầng 2", capacity: 4, status: "INACTIVE" },
];

export const mockOrders = [
    { id: "CF1024", table_name: "Bàn 03", items_count: 3, total_amount: 185000, status: "PREPARING" },
    { id: "CF1025", table_name: "Bàn 07", items_count: 2, total_amount: 95000, status: "PENDING" },
    { id: "CF1026", table_name: "Mang đi", items_count: 4, total_amount: 220000, status: "PREPARING" },
    { id: "CF1027", table_name: "Bàn 05", items_count: 1, total_amount: 45000, status: "READY" },
];

export const mockMenu = [
    { id: 1, name: "Cà phê Sữa đá", category: "Cà phê", price: 35000, status: "AVAILABLE", image_url: null },
    { id: 2, name: "Bạc xỉu", category: "Cà phê", price: 35000, status: "AVAILABLE", image_url: null },
    { id: 3, name: "Trà Đào Cam Sả", category: "Trà", price: 45000, status: "AVAILABLE", image_url: null },
    { id: 4, name: "Trà Vải Nhiệt Đới", category: "Trà", price: 45000, status: "OUT_OF_STOCK", image_url: null },
    { id: 5, name: "Trà Sữa Trân Châu", category: "Trà sữa", price: 40000, status: "AVAILABLE", image_url: null },
    { id: 6, name: "Matcha Đá Xay", category: "Đá xay", price: 55000, status: "AVAILABLE", image_url: null },
    { id: 7, name: "Nước Ép Cam", category: "Nước ép", price: 40000, status: "AVAILABLE", image_url: null },
    { id: 8, name: "Cà phê Đen đá", category: "Cà phê", price: 30000, status: "AVAILABLE", image_url: null },
];
