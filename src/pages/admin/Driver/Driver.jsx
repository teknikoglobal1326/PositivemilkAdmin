import React, { useEffect, useState, useMemo } from 'react';
import { Input, Tabs, Select, message, DatePicker, Button } from 'antd';
import DriverTable from './components/DriverTable';
import { getAllDrivers } from '../../../services/admin/apiDrivers';
import Export from '../../../components/common/Export';

const { Option } = Select;

function DriverManagement() {
    const [drivers, setDrivers] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [cashFilter, setCashFilter] = useState('all');
    const [bottleFilter, setBottleFilter] = useState('all');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const fetchDrivers = async (type = 'all', dateParams = {}) => {
        setLoading(true);
        try {
            const params = {
                startDate: dateParams.startDate !== undefined ? dateParams.startDate : (startDate ? startDate.format('YYYY-MM-DD') : undefined),
                endDate: dateParams.endDate !== undefined ? dateParams.endDate : (endDate ? endDate.format('YYYY-MM-DD') : undefined),
            };
            const response = await getAllDrivers(type, params);
            if (response?.status && Array.isArray(response.data)) {
                setDrivers(response.data);
                setCounts(response.counts || {});
            } else {
                setDrivers([]);
                message.warning("No drivers found.");
            }
        } catch (err) {
            console.error("Error fetching drivers:", err);
            message.error("Failed to load drivers.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrivers(activeTab === 'cash-settlement' ? 'all' : activeTab);
    }, [activeTab]);

    const onSettleSuccess = () => {
        fetchDrivers(activeTab === 'cash-settlement' ? 'all' : activeTab);
    };

    const handleTabChange = (key) => {
        setActiveTab(key);
        setSearchText('');
        setCashFilter('all');
        setBottleFilter('all');
    };

    const handleApplyDateFilter = () => {
        fetchDrivers(activeTab === 'cash-settlement' ? 'all' : activeTab);
    };

    const handleClearDateFilter = () => {
        setStartDate(null);
        setEndDate(null);
        fetchDrivers(activeTab === 'cash-settlement' ? 'all' : activeTab, { startDate: undefined, endDate: undefined });
    };

    const hasDateFilter = Boolean(startDate || endDate);

    // Filter drivers based on search, cash, and bottle filters
    const filteredDrivers = useMemo(() => {
        let list = drivers;

        if (searchText) {
            list = list.filter((item) =>
                item?.name?.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        // Apply cash filter
        if (activeTab === 'cash-settlement' && cashFilter === 'cash-more-than-0') {
            list = list.filter(driver => (driver.cashCollection || 0) > 0);
        }

        // Apply bottle count filter
        if (bottleFilter === 'today-delivered') {
            list = list.filter(driver => (driver.todayBottleCount || 0) > 0);
        } else if (bottleFilter === 'total-delivered') {
            list = list.filter(driver => (driver.totalBottleCount || 0) > 0);
        } else if (bottleFilter === 'no-deliveries') {
            list = list.filter(driver => (driver.totalBottleCount || 0) === 0);
        }

        return list;
    }, [drivers, searchText, activeTab, cashFilter, bottleFilter]);

    // Summary bottle counts
    const todayTotalBottles = useMemo(() => {
        return drivers.reduce((sum, d) => sum + (d.todayBottleCount || 0), 0);
    }, [drivers]);

    const overallTotalBottles = useMemo(() => {
        return drivers.reduce((sum, d) => sum + (d.totalBottleCount || 0), 0);
    }, [drivers]);

    const periodTotalBottles = useMemo(() => {
        return drivers.reduce((sum, d) => sum + (d.filteredBottleCount || 0), 0);
    }, [drivers]);

    // Data for Excel Report Export
    const exportData = useMemo(() => {
        return filteredDrivers.map(d => ({
            "Driver Name": d.name || "",
            "Phone Number": d.mobileNo || d.phone || "",
            "Vehicle Type": d?.vehicle?.type || "-",
            "Vehicle Model": d?.vehicle?.model || "-",
            "Registration No": d?.vehicle?.registrationNumber || "-",
            "License No": d?.licenseNumber || "-",
            "Today Delivered Bottles": d.todayBottleCount || 0,
            "Total Delivered Bottles": d.totalBottleCount || 0,
            ...(hasDateFilter ? { "Period Filtered Bottles": d.filteredBottleCount || 0 } : {}),
            "Status": d.status?.toUpperCase() || "",
            "Verified": d.isVerified ? "Verified" : "Unverified",
            "Blocked": d.isBlocked ? "Blocked" : "Active",
            "Cash Collection": d.cashCollection || 0,
        }));
    }, [filteredDrivers, hasDateFilter]);

    const exportFileName = `driver-bottle-report-${startDate ? startDate.format('YYYY-MM-DD') : 'all'}${endDate ? `_to_${endDate.format('YYYY-MM-DD')}` : ''}.xlsx`;

    const tabItems = [
        {
            key: 'new',
            label: `New Drivers (${counts.new || 0})`,
            children: null
        },
        {
            key: 'verified',
            label: `Verified Drivers (${counts.verified || 0})`,
            children: null
        },
        {
            key: 'unverified',
            label: `Unverified Drivers (${counts.unverified || 0})`,
            children: null
        },
        {
            key: 'block',
            label: `Blocked Drivers (${counts.block || 0})`,
            children: null
        },
        {
            key: 'all',
            label: `All Drivers (${counts.all || 0})`,
            children: null
        },
        {
            key: 'cash-settlement',
            label: `Cash Settlement (${counts.all || 0})`,
            children: null
        },
    ];

    return (
        <>
            <div className='lg:px-10 px-5 my-8'>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={tabItems}
                    size="large"
                />
            </div>

            {/* Bottle Delivery Summary Stats */}
            <div className='lg:px-10 px-5 mb-4 flex gap-4 flex-wrap items-center'>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm shadow-xs">
                    <span className="text-gray-600 font-medium">Today Delivered Bottles: </span>
                    <span className="font-bold text-blue-600 text-base">{todayTotalBottles}</span>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 text-sm shadow-xs">
                    <span className="text-gray-600 font-medium">Total Delivered Bottles: </span>
                    <span className="font-bold text-purple-600 text-base">{overallTotalBottles}</span>
                </div>
                {hasDateFilter && (
                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg px-4 py-2 text-sm shadow-xs">
                        <span className="text-gray-600 font-medium">Filtered Period Bottles: </span>
                        <span className="font-bold text-cyan-600 text-base">{periodTotalBottles}</span>
                    </div>
                )}
            </div>

            <div className='lg:px-10 px-5 mb-6 flex flex-wrap items-center gap-4 justify-between'>
                <div className='flex items-center gap-3 flex-wrap'>
                    <Input.Search
                        placeholder="Search by driver name"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 220, borderRadius: '6px' }}
                        allowClear
                    />

                    {/* Bottle count filter */}
                    {/* <Select
                        value={bottleFilter}
                        onChange={setBottleFilter}
                        style={{ width: 190 }}
                        placeholder="Filter by Bottle Count"
                    >
                        <Option value="all">All Bottle Counts</Option>
                        <Option value="today-delivered">Delivered Today (&gt; 0)</Option>
                        <Option value="total-delivered">Delivered Total (&gt; 0)</Option>
                        <Option value="no-deliveries">Zero Deliveries (0)</Option>
                    </Select> */}

                    {/* Date filter */}
                    <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        placeholder="Start Date"
                        style={{ width: 130 }}
                    />
                    <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        placeholder="End Date"
                        style={{ width: 130 }}
                    />
                    <Button type="primary" onClick={handleApplyDateFilter}>
                        Apply
                    </Button>
                    <Button onClick={handleClearDateFilter}>
                        Clear
                    </Button>

                    {activeTab === 'cash-settlement' && (
                        <Select
                            value={cashFilter}
                            onChange={setCashFilter}
                            style={{ width: 160 }}
                        >
                            <Option value="all">All Drivers</Option>
                            <Option value="cash-more-than-0">Cash &gt; 0</Option>
                        </Select>
                    )}
                </div>

                <div>
                    <Export
                        data={exportData}
                        fileName={exportFileName}
                        buttonText="Export Report"
                    />
                </div>
            </div>

            <DriverTable
                loading={loading}
                searchText={searchText}
                data={filteredDrivers}
                onSettleSuccess={onSettleSuccess}
                activeTab={activeTab}
                hasDateFilter={hasDateFilter}
            />
        </>
    );
}

export default DriverManagement;
