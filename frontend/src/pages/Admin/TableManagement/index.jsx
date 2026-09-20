import { useEffect, useMemo, useState } from "react";
import {
    Armchair,
    Building2,
    CalendarCheck,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Coffee,
    Eye,
    LayoutGrid,
    List,
    LoaderCircle,
    MapPin,
    Pencil,
    Plus,
    RefreshCw,
    Search,
    Trash2,
    Users,
    X,
} from "lucide-react";

import { tableService } from "../../../services/table.service";
import { showError, showSuccess } from "../../../utils/toast";
import { getApiErrorMessage } from "../../../utils/apiError";

const TABLE_STATUS = {
    AVAILABLE: {
        label: "Bàn trống",
        className: "bg-green-50 text-green-700",
    },
    OCCUPIED: {
        label: "Đang phục vụ",
        className: "bg-orange-50 text-orange-700",
    },
    RESERVED: {
        label: "Đã đặt trước",
        className: "bg-purple-50 text-purple-700",
    },
    INACTIVE: {
        label: "Tạm dừng",
        className: "bg-gray-100 text-gray-600",
    },
};

const AREA_STATUS = {
    ACTIVE: {
        label: "Đang hoạt động",
        className: "bg-green-50 text-green-700",
    },
    INACTIVE: {
        label: "Ngừng hoạt động",
        className: "bg-orange-50 text-orange-600",
    },
};

const getRows = (response) => {
    if (!response) return [];

    if (Array.isArray(response.data)) {
        return response.data;
    }

    if (Array.isArray(response.data?.data)) {
        return response.data.data;
    }

    return [];
};

const getPagination = (response) => {
    if (response?.data && !Array.isArray(response.data)) {
        return {
            currentPage: response.data.current_page ?? 1,
            lastPage: response.data.last_page ?? 1,
            total: response.data.total ?? 0,
            from: response.data.from ?? 0,
            to: response.data.to ?? 0,
        };
    }

    const rows = getRows(response);

    return {
        currentPage: 1,
        lastPage: 1,
        total: rows.length,
        from: rows.length ? 1 : 0,
        to: rows.length,
    };
};

const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("vi-VN").format(
        new Date(date)
    );
};

export default function TableManagement() {
    const [activeTab, setActiveTab] = useState("tables");

    const [tables, setTables] = useState([]);
    const [areas, setAreas] = useState([]);

    const [tableLoading, setTableLoading] = useState(true);
    const [areaLoading, setAreaLoading] = useState(true);

    const [tablePagination, setTablePagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        from: 0,
        to: 0,
    });

    const [areaPagination, setAreaPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        from: 0,
        to: 0,
    });

    const [tableSearch, setTableSearch] = useState("");
    const [tableArea, setTableArea] = useState("");
    const [tableStatus, setTableStatus] = useState("");
    const [tableSort, setTableSort] = useState("sort_order_asc");
    const [viewMode, setViewMode] = useState("grid");

    const [areaSearch, setAreaSearch] = useState("");
    const [areaStatus, setAreaStatus] = useState("");
    const [areaSort, setAreaSort] = useState("sort_order_asc");

    const [tableModal, setTableModal] = useState(null);
    const [areaModal, setAreaModal] = useState(null);

    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedArea, setSelectedArea] = useState(null);

    const fetchTables = async (page = 1) => {
        setTableLoading(true);

        try {
            const response = await tableService.getTables({
                page,
                search: tableSearch || undefined,
                area_id: tableArea || undefined,
                status: tableStatus || undefined,
                sort: tableSort,
            });

            setTables(getRows(response));
            setTablePagination(getPagination(response));
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setTableLoading(false);
        }
    };

    const fetchAreas = async (page = 1) => {
        setAreaLoading(true);

        try {
            const response = await tableService.getAreas({
                page,
                search: areaSearch || undefined,
                status: areaStatus || undefined,
                sort: areaSort,
            });

            setAreas(getRows(response));
            setAreaPagination(getPagination(response));
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setAreaLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTables(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [
        tableSearch,
        tableArea,
        tableStatus,
        tableSort,
    ]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchAreas(1);
        }, 300);

        return () => clearTimeout(timer);
    }, [areaSearch, areaStatus, areaSort]);

    const tableSummary = useMemo(() => {
        return {
            total: tablePagination.total || tables.length,

            available: tables.filter(
                (item) => item.status === "AVAILABLE"
            ).length,

            occupied: tables.filter(
                (item) => item.status === "OCCUPIED"
            ).length,

            reserved: tables.filter(
                (item) => item.status === "RESERVED"
            ).length,
        };
    }, [tables, tablePagination.total]);

    const areaSummary = useMemo(() => {
        return {
            total: areaPagination.total || areas.length,

            active: areas.filter(
                (item) => item.status === "ACTIVE"
            ).length,

            tableCount: areas.reduce(
                (sum, item) =>
                    sum + Number(item.tables_count ?? 0),
                0
            ),
        };
    }, [areas, areaPagination.total]);

    const openTableCreate = () => {
        setSelectedTable(null);
        setTableModal("form");
    };

    const openTableEdit = async (table) => {
        try {
            const response = await tableService.getTable(
                table.id
            );

            setSelectedTable(response.data ?? table);
            setTableModal("form");
        } catch (error) {
            showError(getApiErrorMessage(error));
            setSelectedTable(table);
            setTableModal("form");
        }
    };

    const openTableDetail = async (table) => {
        try {
            const response = await tableService.getTable(
                table.id
            );

            setSelectedTable(response.data ?? table);
        } catch (error) {
            showError(getApiErrorMessage(error));
            setSelectedTable(table);
        }

        setTableModal("detail");
    };

    const openTableDelete = (table) => {
        setSelectedTable(table);
        setTableModal("delete");
    };

    const openAreaCreate = () => {
        setSelectedArea(null);
        setAreaModal("form");
    };

    const openAreaEdit = async (area) => {
        try {
            const response = await tableService.getArea(
                area.id
            );

            setSelectedArea(response.data ?? area);
        } catch (error) {
            showError(getApiErrorMessage(error));
            setSelectedArea(area);
        }

        setAreaModal("form");
    };

    const openAreaDetail = async (area) => {
        try {
            const response = await tableService.getArea(
                area.id
            );

            setSelectedArea(response.data ?? area);
        } catch (error) {
            showError(getApiErrorMessage(error));
            setSelectedArea(area);
        }

        setAreaModal("detail");
    };

    const openAreaDelete = (area) => {
        setSelectedArea(area);
        setAreaModal("delete");
    };

    const handleTableStatus = async (table, status) => {
        try {
            const response = await tableService.updateTableStatus(
                table.id,
                status
            );
            
            showSuccess(response.message || "Cập nhật trạng thái thành công");

            await fetchTables(
                tablePagination.currentPage
            );
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    const handleAreaStatus = async (area) => {
        const status =
            area.status === "ACTIVE"
                ? "INACTIVE"
                : "ACTIVE";

        try {
            const response = await tableService.updateAreaStatus(
                area.id,
                status
            );
            
            showSuccess(response.message || "Cập nhật trạng thái thành công");

            await fetchAreas(
                areaPagination.currentPage
            );
        } catch (error) {
            showError(getApiErrorMessage(error));
        }
    };

    return (
        <div className="space-y-5">
            {/* HEADER */}
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                <div>
                    <h1 className="text-2xl font-bold text-[#302723]">
                        Quản lý bàn
                    </h1>

                    <p className="mt-1 text-xs text-[#958981]">
                        Quản lý sơ đồ vị trí, thông số sức chứa
                        và điều phối trạng thái bàn theo thời
                        gian thực.
                    </p>
                </div>

                <button
                    onClick={
                        activeTab === "tables"
                            ? openTableCreate
                            : openAreaCreate
                    }
                    className="flex h-10 items-center gap-2 self-start rounded-lg bg-[#604238] px-4 text-xs font-semibold text-white hover:bg-[#50362f]"
                >
                    <Plus size={16} />

                    {activeTab === "tables"
                        ? "Thêm bàn"
                        : "Thêm khu vực"}
                </button>
            </div>

            {/* TABS */}
            <div className="flex max-w-[460px] rounded-xl border border-[#eee6e1] bg-white p-1">
                <TabButton
                    active={activeTab === "tables"}
                    onClick={() =>
                        setActiveTab("tables")
                    }
                    icon={<Armchair size={15} />}
                    count={tablePagination.total}
                >
                    Bàn phục vụ
                </TabButton>

                <TabButton
                    active={activeTab === "areas"}
                    onClick={() =>
                        setActiveTab("areas")
                    }
                    icon={<Building2 size={15} />}
                    count={areaPagination.total}
                >
                    Khu vực
                </TabButton>
            </div>

            {activeTab === "tables" ? (
                <>
                    {/* SUMMARY */}
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <SummaryCard
                            title="TỔNG SỐ BÀN"
                            value={tableSummary.total}
                            subtitle={`Phân bố trong ${areaPagination.total} khu vực`}
                            icon={
                                <LayoutGrid size={19} />
                            }
                        />

                        <SummaryCard
                            title="BÀN TRỐNG"
                            value={tableSummary.available}
                            subtitle="Sẵn sàng đón khách"
                            icon={
                                <CheckCircle2
                                    size={19}
                                    className="text-green-600"
                                />
                            }
                        />

                        <SummaryCard
                            title="ĐANG SỬ DỤNG"
                            value={tableSummary.occupied}
                            subtitle="Đang phục vụ tại chỗ"
                            icon={
                                <Coffee
                                    size={19}
                                    className="text-orange-600"
                                />
                            }
                        />

                        <SummaryCard
                            title="ĐÃ ĐẶT TRƯỚC"
                            value={tableSummary.reserved}
                            subtitle="Giữ chỗ cho khách hẹn"
                            icon={
                                <CalendarCheck
                                    size={19}
                                    className="text-purple-600"
                                />
                            }
                        />
                    </div>

                    {/* TOOLBAR */}
                    <div className="flex flex-col gap-3 rounded-xl border border-[#eee5df] bg-white p-3 xl:flex-row">
                        <SearchBox
                            value={tableSearch}
                            onChange={setTableSearch}
                            placeholder="Tìm kiếm tên, mã bàn..."
                        />

                        <select
                            value={tableArea}
                            onChange={(e) =>
                                setTableArea(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs"
                        >
                            <option value="">
                                Tất cả khu vực
                            </option>

                            {areas.map((area) => (
                                <option
                                    key={area.id}
                                    value={area.id}
                                >
                                    {area.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={tableStatus}
                            onChange={(e) =>
                                setTableStatus(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs"
                        >
                            <option value="">
                                Tất cả trạng thái
                            </option>
                            <option value="AVAILABLE">
                                Bàn trống
                            </option>
                            <option value="OCCUPIED">
                                Đang sử dụng
                            </option>
                            <option value="RESERVED">
                                Đã đặt trước
                            </option>
                            <option value="INACTIVE">
                                Tạm dừng
                            </option>
                        </select>

                        <select
                            value={tableSort}
                            onChange={(e) =>
                                setTableSort(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs"
                        >
                            <option value="sort_order_asc">
                                POS: Thấp đến cao
                            </option>
                            <option value="sort_order_desc">
                                POS: Cao đến thấp
                            </option>
                            <option value="name_asc">
                                Tên A-Z
                            </option>
                            <option value="name_desc">
                                Tên Z-A
                            </option>
                            <option value="capacity_asc">
                                Sức chứa tăng dần
                            </option>
                            <option value="capacity_desc">
                                Sức chứa giảm dần
                            </option>
                        </select>

                        <div className="ml-auto flex gap-1 rounded-lg border border-[#e8dfd9] p-1">
                            <button
                                onClick={() =>
                                    setViewMode("grid")
                                }
                                className={`flex h-8 items-center gap-1 rounded-md px-2 text-xs ${
                                    viewMode === "grid"
                                        ? "bg-[#604238] text-white"
                                        : "text-[#756a64]"
                                }`}
                            >
                                <LayoutGrid size={14} />
                                Lưới
                            </button>

                            <button
                                onClick={() =>
                                    setViewMode("list")
                                }
                                className={`flex h-8 items-center gap-1 rounded-md px-2 text-xs ${
                                    viewMode === "list"
                                        ? "bg-[#604238] text-white"
                                        : "text-[#756a64]"
                                }`}
                            >
                                <List size={14} />
                                Bảng
                            </button>
                        </div>

                        <button
                            onClick={() =>
                                fetchTables(
                                    tablePagination.currentPage
                                )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8dfd9]"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>

                    {tableLoading ? (
                        <LoadingState />
                    ) : tables.length === 0 ? (
                        <EmptyState
                            title="Chưa có bàn nào"
                            text="Hãy thêm bàn đầu tiên để thiết lập không gian phục vụ."
                            onAdd={openTableCreate}
                            button="Thêm bàn"
                        />
                    ) : viewMode === "grid" ? (
                        <TableGrid
                            tables={tables}
                            onDetail={openTableDetail}
                            onEdit={openTableEdit}
                            onDelete={openTableDelete}
                            onStatus={
                                handleTableStatus
                            }
                        />
                    ) : (
                        <TableList
                            tables={tables}
                            onDetail={openTableDetail}
                            onEdit={openTableEdit}
                            onDelete={openTableDelete}
                        />
                    )}

                    <Pagination
                        pagination={tablePagination}
                        onPage={fetchTables}
                        label="bàn"
                    />
                </>
            ) : (
                <>
                    <div>
                        <h2 className="text-xl font-bold text-[#302723]">
                            Quản lý khu vực
                        </h2>

                        <p className="mt-1 text-xs text-[#958981]">
                            Phân chia không gian quán thành các
                            khu vực và tầng phục vụ.
                        </p>
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <SummaryCard
                            title="TỔNG SỐ KHU VỰC"
                            value={areaSummary.total}
                            subtitle="Không gian phục vụ"
                            icon={<Building2 size={19} />}
                        />

                        <SummaryCard
                            title="ĐANG HOẠT ĐỘNG"
                            value={areaSummary.active}
                            subtitle="Sẵn sàng phục vụ"
                            icon={
                                <CheckCircle2
                                    size={19}
                                    className="text-green-600"
                                />
                            }
                        />

                        <SummaryCard
                            title="TỔNG SỐ BÀN TRỰC THUỘC"
                            value={areaSummary.tableCount}
                            subtitle="Bố trí trong các khu vực"
                            icon={<Armchair size={19} />}
                        />
                    </div>

                    <div className="flex flex-col gap-3 rounded-xl border border-[#eee5df] bg-white p-3 lg:flex-row">
                        <SearchBox
                            value={areaSearch}
                            onChange={setAreaSearch}
                            placeholder="Tìm theo tên hoặc mã khu vực..."
                        />

                        <select
                            value={areaStatus}
                            onChange={(e) =>
                                setAreaStatus(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs"
                        >
                            <option value="">
                                Tất cả trạng thái
                            </option>
                            <option value="ACTIVE">
                                Hoạt động
                            </option>
                            <option value="INACTIVE">
                                Ngừng hoạt động
                            </option>
                        </select>

                        <select
                            value={areaSort}
                            onChange={(e) =>
                                setAreaSort(
                                    e.target.value
                                )
                            }
                            className="h-10 rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs"
                        >
                            <option value="sort_order_asc">
                                POS tăng dần
                            </option>
                            <option value="sort_order_desc">
                                POS giảm dần
                            </option>
                            <option value="name_asc">
                                Tên A-Z
                            </option>
                            <option value="name_desc">
                                Tên Z-A
                            </option>
                        </select>

                        <button
                            onClick={() =>
                                fetchAreas(
                                    areaPagination.currentPage
                                )
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#e8dfd9]"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>

                    {areaLoading ? (
                        <LoadingState />
                    ) : (
                        <AreaTable
                            areas={areas}
                            onDetail={openAreaDetail}
                            onEdit={openAreaEdit}
                            onDelete={openAreaDelete}
                            onToggle={handleAreaStatus}
                        />
                    )}

                    <Pagination
                        pagination={areaPagination}
                        onPage={fetchAreas}
                        label="khu vực"
                    />

                    <AreaQuickOverview
                        areas={areas}
                        tables={tables}
                    />
                </>
            )}

            {tableModal === "form" && (
                <TableFormModal
                    table={selectedTable}
                    areas={areas}
                    onClose={() =>
                        setTableModal(null)
                    }
                    onSuccess={() => {
                        setTableModal(null);
                        fetchTables(
                            tablePagination.currentPage
                        );
                        fetchAreas(
                            areaPagination.currentPage
                        );
                    }}
                />
            )}

            {tableModal === "detail" &&
                selectedTable && (
                    <TableDetailModal
                        table={selectedTable}
                        onClose={() =>
                            setTableModal(null)
                        }
                        onEdit={() => {
                            setTableModal("form");
                        }}
                    />
                )}

            {tableModal === "delete" &&
                selectedTable && (
                    <DeleteTableModal
                        table={selectedTable}
                        onClose={() =>
                            setTableModal(null)
                        }
                        onSuccess={() => {
                            setTableModal(null);
                            fetchTables(
                                tablePagination.currentPage
                            );
                            fetchAreas(
                                areaPagination.currentPage
                            );
                        }}
                    />
                )}

            {areaModal === "form" && (
                <AreaFormModal
                    area={selectedArea}
                    onClose={() => setAreaModal(null)}
                    onSuccess={() => {
                        setAreaModal(null);
                        fetchAreas(
                            areaPagination.currentPage
                        );
                    }}
                />
            )}

            {areaModal === "detail" &&
                selectedArea && (
                    <AreaDetailModal
                        area={selectedArea}
                        onClose={() =>
                            setAreaModal(null)
                        }
                        onEdit={() =>
                            setAreaModal("form")
                        }
                    />
                )}

            {areaModal === "delete" &&
                selectedArea && (
                    <DeleteAreaModal
                        area={selectedArea}
                        onClose={() =>
                            setAreaModal(null)
                        }
                        onSuccess={() => {
                            setAreaModal(null);
                            fetchAreas(
                                areaPagination.currentPage
                            );
                        }}
                    />
                )}
        </div>
    );
}

function TabButton({
    active,
    children,
    icon,
    count,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold ${
                active
                    ? "bg-[#fae5da] text-[#604238]"
                    : "text-[#81756e]"
            }`}
        >
            {icon}
            {children}

            <span className="rounded-full bg-white px-2 py-0.5 text-[10px]">
                {count ?? 0}
            </span>
        </button>
    );
}

function SummaryCard({
    title,
    value,
    subtitle,
    icon,
}) {
    return (
        <div className="rounded-xl border border-[#eee5df] bg-white p-4">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-[9px] font-bold tracking-wide text-[#80736c]">
                        {title}
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#302723]">
                        {value}
                    </p>

                    <p className="mt-1 text-[10px] text-[#958981]">
                        {subtitle}
                    </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f5efeb] text-[#604238]">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function SearchBox({
    value,
    onChange,
    placeholder,
}) {
    return (
        <div className="relative min-w-[240px] flex-1">
            <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#998d86]"
            />

            <input
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder={placeholder}
                className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-[#faf8f6] pl-9 pr-3 text-xs outline-none focus:border-[#604238]"
            />
        </div>
    );
}

function TableGrid({
    tables,
    onDetail,
    onEdit,
    onDelete,
    onStatus,
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {tables.map((table) => {
                const status =
                    TABLE_STATUS[table.status] ??
                    TABLE_STATUS.INACTIVE;

                return (
                    <div
                        key={table.id}
                        className="rounded-xl border border-[#eee5df] bg-white p-4 transition hover:shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-[#302723]">
                                    {table.name}
                                </h3>

                                <p className="mt-0.5 text-[10px] text-[#958981]">
                                    Mã:{" "}
                                    {table.table_code}
                                </p>

                                <p className="text-[10px] text-[#958981]">
                                    POS #
                                    {table.sort_order}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-2 py-1 text-[9px] font-semibold ${status.className}`}
                            >
                                {status.label}
                            </span>
                        </div>

                        <div className="my-4 flex justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5efeb] text-[#604238]">
                                <Armchair size={23} />
                            </div>
                        </div>

                        <div className="space-y-2 text-[10px] text-[#70645e]">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    Khu vực
                                </span>

                                <b>
                                    {table.area?.name ??
                                        "—"}
                                </b>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    Sức chứa
                                </span>

                                <b>
                                    {table.capacity} chỗ
                                </b>
                            </div>
                        </div>

                        <div className="mt-4">
                            <select
                                value={table.status}
                                onChange={(e) =>
                                    onStatus(
                                        table,
                                        e.target.value
                                    )
                                }
                                className="h-8 w-full rounded-lg border border-[#e7dfd9] bg-[#faf8f6] px-2 text-[10px]"
                            >
                                <option value="AVAILABLE">
                                    Bàn trống
                                </option>
                                <option value="OCCUPIED">
                                    Đang phục vụ
                                </option>
                                <option value="RESERVED">
                                    Đã đặt trước
                                </option>
                                <option value="INACTIVE">
                                    Tạm dừng
                                </option>
                            </select>
                        </div>

                        <div className="mt-4 flex justify-end gap-1 border-t border-[#f0e9e5] pt-3">
                            <ActionButton
                                icon={<Eye size={14} />}
                                onClick={() =>
                                    onDetail(table)
                                }
                            />

                            <ActionButton
                                icon={
                                    <Pencil size={14} />
                                }
                                onClick={() =>
                                    onEdit(table)
                                }
                            />

                            <ActionButton
                                danger
                                icon={
                                    <Trash2 size={14} />
                                }
                                onClick={() =>
                                    onDelete(table)
                                }
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function TableList({
    tables,
    onDetail,
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-[#eee5df] bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-[#faf8f6]">
                        <tr>
                            {[
                                "#",
                                "BÀN",
                                "MÃ BÀN",
                                "KHU VỰC",
                                "SỨC CHỨA",
                                "THỨ TỰ POS",
                                "TRẠNG THÁI",
                                "NGÀY TẠO",
                                "THAO TÁC",
                            ].map((item) => (
                                <th
                                    key={item}
                                    className="px-4 py-3 text-left text-[9px] font-bold text-[#776a63]"
                                >
                                    {item}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {tables.map(
                            (table, index) => {
                                const status =
                                    TABLE_STATUS[
                                        table.status
                                    ] ??
                                    TABLE_STATUS.INACTIVE;

                                return (
                                    <tr
                                        key={table.id}
                                        className="border-t border-[#f1ebe7]"
                                    >
                                        <td className="px-4 py-3 text-xs">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3 text-xs font-semibold">
                                            {table.name}
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {
                                                table.table_code
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {table.area
                                                ?.name ?? "—"}
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {
                                                table.capacity
                                            }{" "}
                                            người
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {
                                                table.sort_order
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <span
                                                className={`rounded-full px-2 py-1 text-[9px] font-semibold ${status.className}`}
                                            >
                                                {
                                                    status.label
                                                }
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {formatDate(
                                                table.created_at
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <ActionButton
                                                    icon={
                                                        <Eye
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        onDetail(
                                                            table
                                                        )
                                                    }
                                                />

                                                <ActionButton
                                                    icon={
                                                        <Pencil
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        onEdit(
                                                            table
                                                        )
                                                    }
                                                />

                                                <ActionButton
                                                    danger
                                                    icon={
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        onDelete(
                                                            table
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AreaTable({
    areas,
    onDetail,
    onEdit,
    onDelete,
    onToggle,
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-[#eee5df] bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                    <thead className="bg-[#faf8f6]">
                        <tr>
                            {[
                                "#",
                                "KHU VỰC & ĐẶC ĐIỂM",
                                "MÃ ĐỊNH DANH",
                                "SỐ BÀN",
                                "THỨ TỰ POS",
                                "TRẠNG THÁI",
                                "NGÀY TẠO",
                                "THAO TÁC",
                            ].map((item) => (
                                <th
                                    key={item}
                                    className="px-4 py-3 text-left text-[9px] font-bold text-[#776a63]"
                                >
                                    {item}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {areas.map(
                            (area, index) => {
                                const status =
                                    AREA_STATUS[
                                        area.status
                                    ] ??
                                    AREA_STATUS.INACTIVE;

                                return (
                                    <tr
                                        key={area.id}
                                        className="border-t border-[#f1ebe7]"
                                    >
                                        <td className="px-4 py-3 text-xs">
                                            {index + 1}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#fae3d6] text-[#604238]">
                                                    <Building2
                                                        size={
                                                            16
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <p className="text-xs font-semibold text-[#302723]">
                                                        {
                                                            area.name
                                                        }
                                                    </p>

                                                    <p className="max-w-[220px] truncate text-[9px] text-[#958981]">
                                                        {area.description ||
                                                            "Chưa có mô tả"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {
                                                area.area_code
                                            }
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {area.tables_count ??
                                                0}{" "}
                                            bàn
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {
                                                area.sort_order
                                            }
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2 py-1 text-[9px] font-semibold ${status.className}`}
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() => onToggle(area)}
                                                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
                                                        area.status === "ACTIVE"
                                                            ? "bg-emerald-500"
                                                            : "bg-gray-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                                                            area.status === "ACTIVE"
                                                                ? "translate-x-5"
                                                                : "translate-x-0.5"
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3 text-xs">
                                            {formatDate(
                                                area.created_at
                                            )}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <ActionButton
                                                    icon={
                                                        <Eye
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        onDetail(
                                                            area
                                                        )
                                                    }
                                                />

                                                <ActionButton
                                                    icon={
                                                        <Pencil
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        onEdit(
                                                            area
                                                        )
                                                    }
                                                />

                                                <ActionButton
                                                    danger
                                                    icon={
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                    }
                                                    onClick={() =>
                                                        onDelete(
                                                            area
                                                        )
                                                    }
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function AreaQuickOverview({ areas, tables }) {
    return (
        <div className="rounded-xl border border-[#eee5df] bg-white p-4">
            <h3 className="text-sm font-bold text-[#302723]">
                Xem nhanh phân bổ bàn theo khu vực
            </h3>

            <p className="mt-1 text-[10px] text-[#958981]">
                Trực quan tình trạng phục vụ tại từng khu vực.
            </p>

            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {areas.map((area) => {
                    const areaTables = tables.filter(
                        (table) =>
                            Number(table.area_id) ===
                            Number(area.id)
                    );

                    return (
                        <div
                            key={area.id}
                            className="rounded-lg border border-[#eee5df] p-3"
                        >
                            <div className="flex justify-between">
                                <b className="text-xs text-[#302723]">
                                    {area.name}
                                </b>

                                <span className="text-[9px] text-[#958981]">
                                    {area.tables_count ??
                                        areaTables.length}{" "}
                                    bàn
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2">
                                {areaTables.map(
                                    (table) => (
                                        <div
                                            key={
                                                table.id
                                            }
                                            className="relative rounded-md border border-[#e9dfd8] px-2 py-1 text-[9px]"
                                        >
                                            {
                                                table.table_code
                                            }

                                            <span
                                                className={`absolute -right-1 -top-1 h-2 w-2 rounded-full ${
                                                    table.status ===
                                                    "AVAILABLE"
                                                        ? "bg-green-500"
                                                        : table.status ===
                                                          "OCCUPIED"
                                                        ? "bg-orange-500"
                                                        : table.status ===
                                                          "RESERVED"
                                                        ? "bg-purple-500"
                                                        : "bg-gray-400"
                                                }`}
                                            />
                                        </div>
                                    )
                                )}

                                {areaTables.length ===
                                    0 && (
                                    <span className="text-[9px] text-[#958981]">
                                        Chưa có dữ liệu bàn
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function TableFormModal({
    table,
    areas,
    onClose,
    onSuccess,
}) {
    const editing = Boolean(table);

    const [form, setForm] = useState({
        table_code: table?.table_code ?? "",
        name: table?.name ?? "",
        area_id: table?.area_id ?? "",
        capacity: table?.capacity ?? 2,
        sort_order: table?.sort_order ?? 0,
        status: table?.status ?? "AVAILABLE",
    });

    const [loading, setLoading] = useState(false);

    const change = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const submit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            if (editing) {
                const response = await tableService.updateTable(
                    table.id,
                    form
                );
                showSuccess(response.message || "Cập nhật thành công");
            } else {
                const response = await tableService.createTable(form);
                showSuccess(response.message || "Thêm mới thành công");
            }

            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                editing
                    ? "Chỉnh sửa bàn"
                    : "Thêm bàn"
            }
            onClose={onClose}
        >
            <form
                onSubmit={submit}
                className="space-y-4"
            >
                <FormInput
                    label="Tên bàn *"
                    value={form.name}
                    onChange={(value) =>
                        change("name", value)
                    }
                    placeholder="Bàn 01"
                />

                <FormInput
                    label="Mã bàn *"
                    value={form.table_code}
                    onChange={(value) =>
                        change("table_code", value)
                    }
                    placeholder="T01"
                />

                <div>
                    <FormLabel>Khu vực *</FormLabel>

                    <select
                        required
                        value={form.area_id}
                        onChange={(e) =>
                            change(
                                "area_id",
                                e.target.value
                            )
                        }
                        className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                    >
                        <option value="">
                            Chọn khu vực
                        </option>

                        {areas.map((area) => (
                            <option
                                key={area.id}
                                value={area.id}
                            >
                                {area.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                        label="Sức chứa *"
                        type="number"
                        value={form.capacity}
                        onChange={(value) =>
                            change(
                                "capacity",
                                value
                            )
                        }
                    />

                    <FormInput
                        label="Thứ tự POS"
                        type="number"
                        value={form.sort_order}
                        onChange={(value) =>
                            change(
                                "sort_order",
                                value
                            )
                        }
                    />
                </div>

                <div>
                    <FormLabel>Trạng thái *</FormLabel>

                    <select
                        value={form.status}
                        onChange={(e) =>
                            change(
                                "status",
                                e.target.value
                            )
                        }
                        className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                    >
                        <option value="AVAILABLE">
                            Bàn trống
                        </option>
                        <option value="OCCUPIED">
                            Đang phục vụ
                        </option>
                        <option value="RESERVED">
                            Đã đặt trước
                        </option>
                        <option value="INACTIVE">
                            Tạm dừng
                        </option>
                    </select>
                </div>

                <ModalFooter
                    onClose={onClose}
                    loading={loading}
                    submitText={
                        editing
                            ? "Lưu thay đổi"
                            : "Thêm bàn"
                    }
                />
            </form>
        </Modal>
    );
}

function AreaFormModal({
    area,
    onClose,
    onSuccess,
}) {
    const editing = Boolean(area);

    const [form, setForm] = useState({
        area_code: area?.area_code ?? "",
        name: area?.name ?? "",
        description: area?.description ?? "",
        sort_order: area?.sort_order ?? 0,
        status: area?.status ?? "ACTIVE",
    });

    const [loading, setLoading] = useState(false);

    const change = (name, value) => {
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const submit = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            if (editing) {
                const response = await tableService.updateArea(
                    area.id,
                    form
                );
                showSuccess(response.message || "Cập nhật thành công");
            } else {
                const response = await tableService.createArea(form);
                showSuccess(response.message || "Thêm mới thành công");
            }

            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                editing
                    ? "Chỉnh sửa khu vực"
                    : "Thêm khu vực"
            }
            onClose={onClose}
        >
            <form
                onSubmit={submit}
                className="space-y-4"
            >
                <FormInput
                    label="Tên khu vực *"
                    value={form.name}
                    onChange={(value) =>
                        change("name", value)
                    }
                    placeholder="Tầng 1"
                />

                <FormInput
                    label="Mã định danh *"
                    value={form.area_code}
                    onChange={(value) =>
                        change("area_code", value)
                    }
                    placeholder="AREA01"
                />

                <div>
                    <FormLabel>Mô tả</FormLabel>

                    <textarea
                        value={form.description}
                        onChange={(e) =>
                            change(
                                "description",
                                e.target.value
                            )
                        }
                        rows={4}
                        className="w-full resize-none rounded-lg border border-[#e8dfd9] bg-white px-3 py-2 text-xs outline-none focus:border-[#604238]"
                    />
                </div>

                <FormInput
                    label="Thứ tự POS"
                    type="number"
                    value={form.sort_order}
                    onChange={(value) =>
                        change("sort_order", value)
                    }
                />

                <div>
                    <FormLabel>Trạng thái</FormLabel>

                    <select
                        value={form.status}
                        onChange={(e) =>
                            change(
                                "status",
                                e.target.value
                            )
                        }
                        className="h-10 w-full rounded-lg border border-[#e8dfd9] bg-white px-3 text-xs outline-none focus:border-[#604238]"
                    >
                        <option value="ACTIVE">
                            Hoạt động
                        </option>
                        <option value="INACTIVE">
                            Ngừng hoạt động
                        </option>
                    </select>
                </div>

                <ModalFooter
                    onClose={onClose}
                    loading={loading}
                    submitText={
                        editing
                            ? "Lưu thay đổi"
                            : "Thêm khu vực"
                    }
                />
            </form>
        </Modal>
    );
}

function TableDetailModal({
    table,
    onClose,
    onEdit,
}) {
    return (
        <Modal
            title="Chi tiết bàn"
            onClose={onClose}
        >
            <DetailGrid
                rows={[
                    ["Tên bàn", table.name],
                    [
                        "Mã bàn",
                        table.table_code,
                    ],
                    [
                        "Khu vực",
                        table.area?.name ?? "—",
                    ],
                    [
                        "Sức chứa",
                        `${table.capacity} người`,
                    ],
                    [
                        "Thứ tự POS",
                        table.sort_order,
                    ],
                    [
                        "Trạng thái",
                        TABLE_STATUS[table.status]
                            ?.label ?? table.status,
                    ],
                    [
                        "Ngày tạo",
                        formatDate(table.created_at),
                    ],
                    [
                        "Cập nhật",
                        formatDate(table.updated_at),
                    ],
                ]}
            />

            <div className="mt-5 flex justify-end gap-2">
                <SecondaryButton onClick={onClose}>
                    Đóng
                </SecondaryButton>

                <PrimaryButton onClick={onEdit}>
                    Chỉnh sửa
                </PrimaryButton>
            </div>
        </Modal>
    );
}

function AreaDetailModal({
    area,
    onClose,
    onEdit,
}) {
    return (
        <Modal
            title="Chi tiết khu vực"
            onClose={onClose}
        >
            <DetailGrid
                rows={[
                    ["Tên khu vực", area.name],
                    [
                        "Mã khu vực",
                        area.area_code,
                    ],
                    [
                        "Mô tả",
                        area.description || "—",
                    ],
                    [
                        "Số bàn",
                        area.tables_count ?? 0,
                    ],
                    [
                        "Thứ tự POS",
                        area.sort_order,
                    ],
                    [
                        "Trạng thái",
                        AREA_STATUS[area.status]
                            ?.label ?? area.status,
                    ],
                    [
                        "Ngày tạo",
                        formatDate(area.created_at),
                    ],
                    [
                        "Cập nhật",
                        formatDate(area.updated_at),
                    ],
                ]}
            />

            <div className="mt-5 flex justify-end gap-2">
                <SecondaryButton onClick={onClose}>
                    Đóng
                </SecondaryButton>

                <PrimaryButton onClick={onEdit}>
                    Chỉnh sửa
                </PrimaryButton>
            </div>
        </Modal>
    );
}

function DeleteTableModal({
    table,
    onClose,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);

    const remove = async () => {
        setLoading(true);

        try {
            const response = await tableService.deleteTable(table.id);
            showSuccess(response.message || "Xóa thành công");
            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfirmModal
            title="Xóa bàn?"
            text={`Bạn có chắc chắn muốn xóa "${table.name}"?`}
            onClose={onClose}
            onConfirm={remove}
            loading={loading}
        />
    );
}

function DeleteAreaModal({
    area,
    onClose,
    onSuccess,
}) {
    const [loading, setLoading] = useState(false);

    const hasTables =
        Number(area.tables_count ?? 0) > 0;

    const remove = async () => {
        if (hasTables) return;

        setLoading(true);

        try {
            const response = await tableService.deleteArea(area.id);
            showSuccess(response.message || "Xóa thành công");
            onSuccess();
        } catch (error) {
            showError(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ConfirmModal
            title={
                hasTables
                    ? "Không thể xóa khu vực"
                    : "Xóa khu vực?"
            }
            text={
                hasTables
                    ? `Khu vực "${area.name}" hiện có ${area.tables_count} bàn. Hãy chuyển hoặc xóa các bàn trước.`
                    : `Bạn có chắc chắn muốn xóa khu vực "${area.name}"?`
            }
            onClose={onClose}
            onConfirm={remove}
            loading={loading}
            disabled={hasTables}
        />
    );
}

function ConfirmModal({
    title,
    text,
    onClose,
    onConfirm,
    loading,
    disabled,
}) {
    return (
        <Modal title={title} onClose={onClose}>
            <p className="text-sm text-[#746862]">
                {text}
            </p>

            <div className="mt-6 flex justify-end gap-2">
                <SecondaryButton onClick={onClose}>
                    Hủy
                </SecondaryButton>

                <button
                    disabled={disabled || loading}
                    onClick={onConfirm}
                    className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Đang xóa..."
                        : "Xóa"}
                </button>
            </div>
        </Modal>
    );
}

function Modal({ title, children, onClose }) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4">
            <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-[#eee5df] px-5 py-4">
                    <h2 className="text-base font-bold text-[#302723]">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 hover:bg-[#f5efeb]"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function FormLabel({ children }) {
    return (
        <label className="mb-1.5 block text-xs font-semibold text-[#564b45]">
            {children}
        </label>
    );
}

function FormInput({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
}) {
    return (
        <div>
            <FormLabel>{label}</FormLabel>

            <input
                required={label.includes("*")}
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(e.target.value)
                }
                placeholder={placeholder}
                min={type === "number" ? 0 : undefined}
                className="h-10 w-full rounded-lg border border-[#e8dfd9] px-3 text-xs outline-none focus:border-[#604238]"
            />
        </div>
    );
}

function ModalFooter({
    onClose,
    loading,
    submitText,
}) {
    return (
        <div className="flex justify-end gap-2 border-t border-[#eee5df] pt-4">
            <SecondaryButton
                type="button"
                onClick={onClose}
            >
                Hủy
            </SecondaryButton>

            <button
                disabled={loading}
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60"
            >
                {loading && (
                    <LoaderCircle
                        size={14}
                        className="animate-spin"
                    />
                )}

                {loading
                    ? "Đang xử lý..."
                    : submitText}
            </button>
        </div>
    );
}

function DetailGrid({ rows }) {
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {rows.map(([label, value]) => (
                <div
                    key={label}
                    className="rounded-lg bg-[#faf8f6] p-3"
                >
                    <p className="text-[9px] font-semibold uppercase text-[#958981]">
                        {label}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#302723]">
                        {value ?? "—"}
                    </p>
                </div>
            ))}
        </div>
    );
}

function ActionButton({
    icon,
    onClick,
    danger,
}) {
    return (
        <button
            onClick={onClick}
            className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                danger
                    ? "text-red-500 hover:bg-red-50"
                    : "text-[#604238] hover:bg-[#f5efeb]"
            }`}
        >
            {icon}
        </button>
    );
}

function PrimaryButton({
    children,
    onClick,
}) {
    return (
        <button
            onClick={onClick}
            className="rounded-lg bg-[#604238] px-4 py-2 text-xs font-semibold text-white"
        >
            {children}
        </button>
    );
}

function SecondaryButton({
    children,
    onClick,
    type = "button",
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="rounded-lg border border-[#e8dfd9] px-4 py-2 text-xs font-semibold text-[#62564f]"
        >
            {children}
        </button>
    );
}

function LoadingState() {
    return (
        <div className="flex min-h-[250px] items-center justify-center rounded-xl border border-[#eee5df] bg-white">
            <LoaderCircle
                size={25}
                className="animate-spin text-[#604238]"
            />
        </div>
    );
}

function EmptyState({
    title,
    text,
    button,
    onAdd,
}) {
    return (
        <div className="rounded-xl border border-[#eee5df] bg-white py-14 text-center">
            <Armchair
                size={32}
                className="mx-auto text-[#b7aaa3]"
            />

            <h3 className="mt-3 text-sm font-bold text-[#302723]">
                {title}
            </h3>

            <p className="mt-1 text-xs text-[#958981]">
                {text}
            </p>

            <button
                onClick={onAdd}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#604238] px-4 py-2 text-xs font-semibold text-white"
            >
                <Plus size={14} />
                {button}
            </button>
        </div>
    );
}

function Pagination({
    pagination,
    onPage,
    label,
}) {
    if (!pagination.total) return null;

    return (
        <div className="flex items-center justify-between rounded-xl border border-[#eee5df] bg-white px-4 py-3">
            <p className="text-[10px] text-[#80736c]">
                Hiển thị {pagination.from}–
                {pagination.to} trên tổng số{" "}
                {pagination.total} {label}
            </p>

            <div className="flex gap-1">
                <button
                    disabled={
                        pagination.currentPage <= 1
                    }
                    onClick={() =>
                        onPage(
                            pagination.currentPage - 1
                        )
                    }
                    className="flex h-8 items-center gap-1 rounded-lg border border-[#e8dfd9] px-2 text-[10px] disabled:opacity-40"
                >
                    <ChevronLeft size={12} />
                    Trước
                </button>

                <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#604238] px-2 text-[10px] font-semibold text-white">
                    {pagination.currentPage}
                </span>

                <button
                    disabled={
                        pagination.currentPage >=
                        pagination.lastPage
                    }
                    onClick={() =>
                        onPage(
                            pagination.currentPage + 1
                        )
                    }
                    className="flex h-8 items-center gap-1 rounded-lg border border-[#e8dfd9] px-2 text-[10px] disabled:opacity-40"
                >
                    Sau
                    <ChevronRight size={12} />
                </button>
            </div>
        </div>
    );
}
