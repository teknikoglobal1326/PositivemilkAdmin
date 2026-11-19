import { Avatar, Table, Tag, Input } from "antd";
import { FaUser } from "react-icons/fa";
import { useState, useMemo } from "react";
import moment from "moment";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const WalletHistoryTable = ({
    data,
    loading,
    pagination,
    searchText = "",
    onSearchChange = () => {},
}) => {
    const columns = [
        {
            title: "Avatar",
            key: "avatar",
            align: "center",
            render: (_, record) => {
                const user = record.userId || record.user || record;
                const profileImage = user.profileImage;
                const src = profileImage ? `${BASE_URL}/${profileImage}` : undefined;
                return (
                    <Avatar
                        size={40}
                        src={src}
                        icon={!src && <FaUser />}
                        style={{ backgroundColor: "#f56a00" }}
                    />
                );
            },
        },
        {
            title: "Name",
            key: "name",
            align: "center",
            render: (_, record) => {
                const user = record.userId || record.user || record;
                return user.name || "N/A";
            },
        },
        {
            title: "Email",
            key: "email",
            align: "center",
            render: (_, record) => {
                const user = record.userId || record.user || record;
                return user.email || "N/A";
            },
        },
        {
            title: "Mobile no",
            key: "mobileNo",
            align: "center",
            render: (_, record) => {
                const user = record.userId || record.user || record;
                return user.mobileNo || "N/A";
            },
        },
        {
            title: "Opening Balance",
            key: "openingBalance",
            align: "center",
            render: (_, record) => (
                <Tag color="blue">
                    ₹{(record.balance_after_action || 0) - (record.amount || 0)}
                </Tag>
            ),
        },
        {
            title: "Closing Balance",
            key: "closingBalance",
            align: "center",
            render: (_, record) => (
                <Tag color="green">₹{record.balance_after_action || 0}</Tag>
            ),
        },
        {
            title: "Add Amount",
            key: "amount",
            align: "center",
            render: (_, record) => <Tag color="orange">₹{record.amount || 0}</Tag>,
        },
        {
            title: "DateTime",
            dataIndex: "createdAt",
            key: "createdAt",
            align: "center",
            render: (date) => (date ? moment(date).format("DD-MM-YYYY hh:mm A") : "N/A"),
        },
    ];

    return (
        <>
            <div className="mb-4">
                <Input.Search
                    placeholder="Search by name or mobile number..."
                    allowClear
                    enterButton
                    size="large"
                    value={searchText}
                    onChange={(e) => onSearchChange(e.target.value)}
                    onSearch={(val) => onSearchChange(val)}
                    style={{ maxWidth: 400 }}
                />
            </div>
            <Table
                dataSource={data || []}
                columns={columns}
                rowKey={(record) => record._id}
                scroll={{ x: true }}
                bordered={false}
                size="small"
                loading={loading}
                pagination={pagination}
            />
        </>
    );
};

export default WalletHistoryTable;
