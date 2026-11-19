import {
  Avatar,
  Button,
  DatePicker,
  Space,
  Switch,
  Table,
  Tag,
  Input,
  Modal,
} from "antd";
import { FaTrash, FaUser, FaHistory } from "react-icons/fa";
import { IoMdEye, IoMdWallet } from "react-icons/io";
import { MdRemoveCircle } from "react-icons/md";
import { useNavigate } from "react-router";
import { useState, useMemo } from "react";
import Export from "../../../../components/common/Export";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const UserTable = ({
  data,
  pagination,
  searchText = "",
  onSearchChange = () => {},
  onToggleBlock,
  loading,
  onShowHistory = () => {},
  onWalletClick = () => {},
  onDeductClick = () => {},
  startDate,
  endDate,
  onStartDateChange = () => {},
  onEndDateChange = () => {},
  onApplyDateFilter = () => {},
  onClearDateFilter = () => {},
  activeTabLabel = "All",
}) => {
  const navigate = useNavigate();
  const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);
  const [blockReason, setBlockReason] = useState("");
  const [pendingUserId, setPendingUserId] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  const handleBlockToggle = (checked, record) => {
    if (checked) {
      // Open modal to collect reason before blocking
      setPendingUserId(record._id);
      setPendingUser(record);
      setBlockReason("");
      setIsBlockModalVisible(true);
    } else {
      // Unblocking - no reason required
      onToggleBlock(record._id, false, "");
    }
  };

  const getStatusTag = (user) => {
    if (user.status === false) {
      return <Tag color="red">Blocked</Tag>;
    }

    if (user.isNewUser) {
      return <Tag color="blue">New</Tag>;
    }

    if (user.isVerified) {
      return <Tag color="green">Verified</Tag>;
    }

    return <Tag color="orange">Unverified</Tag>;
  };

  const getStatusLabel = (user) => {
    if (user.status === false) return "Blocked";
    if (user.isNewUser) return "New";
    if (user.isVerified) return "Verified";
    return "Unverified";
  };

  const displayData = data || [];

  const exportData = useMemo(
    () =>
      displayData.map((user) => ({
        Name: user.name || "",
        Email: user.email || "",
        MobileNo: user.mobileNo || "",
        Wallet: user.wallet ?? 0,
        TotalBottles: user.totalBottleQuantity || 0,
        ReceivedBottles: user.totalReceivedBottles || 0,
        RemainingBottles: user.remainingBottles || 0,
        Status: getStatusLabel(user),
      })),
    [displayData],
  );

  const exportFileName = `${activeTabLabel.replace(/\s+/g, "-").toLowerCase()}-users${
    startDate || endDate
      ? `-${startDate ? startDate.format("YYYY-MM-DD") : "start"}-${endDate ? endDate.format("YYYY-MM-DD") : "end"}`
      : ""
  }.xlsx`;

  const columns = [
    {
      title: "Avatar",
      key: "avatar",
      align: "center",
      render: (_, { profileImage }) => {
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
      dataIndex: "name",
      key: "name",
      align: "center",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "center",
    },
    {
      title: "Mobile no",
      dataIndex: "mobileNo",
      key: "mobileNo",
      align: "center",
    },
    {
      title: "Wallet",
      dataIndex: "wallet",
      key: "wallet",
      align: "center",
    },
    // {
    //   title: "Go Coin",
    //   key: "wallet",
    //   align: "center",
    //   render: (_, record) => <Tag color="default">{record.wallet}</Tag>,
    // },
    {
      title: "Total Bottles",
      key: "totalBottleQuantity",
      align: "center",
      render: (_, record) => (
        <Tag color="blue">{record.totalBottleQuantity || 0}</Tag>
      ),
    },
    {
      title: "Received Bottles",
      key: "totalReceivedBottles",
      align: "center",
      render: (_, record) => (
        <Tag color="green">{record.totalReceivedBottles || 0}</Tag>
      ),
    },
    {
      title: "Remaining Bottles",
      key: "remainingBottles",
      align: "center",
      render: (_, record) => (
        <Tag color="orange">{record.remainingBottles || 0}</Tag>
      ),
    },
    // {
    //   title: "Driver Cash Collection",
    //   key: "DriverCashCollectionStatus",
    //   align: "center",
    //   render: (_, record) => {
    //     const status = record.DriverCashCollectionStatus || "none";
    //     const color = status === "received" ? "green" : status === "pending" ? "orange" : status === "cancelled" ? "red" : "default";
    //     return (
    //       <Tag color={color}>
    //         {status === "none" ? "No Collection" : status.toUpperCase()}
    //       </Tag>
    //     );
    //   },
    // },
    {
      title: "Status",
      key: "status",
      align: "center",
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Block/Unblock",
      key: "block",
      align: "center",
      render: (_, record) => (
        <Switch
          checked={!record.status}
          onChange={(checked) => handleBlockToggle(checked, record)}
          checkedChildren="Blocked"
          unCheckedChildren="Active"
        />
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<IoMdEye />}
            onClick={() => navigate(`${record._id}`)}
          ></Button>
          <Button
            type="default"
            icon={<IoMdWallet className="text-blue-500" />}
            onClick={() => onWalletClick(record)}
            title="Update Wallet"
          ></Button>
          <Button
            type="default"
            danger
            icon={<MdRemoveCircle className="text-red-500" />}
            onClick={() => onDeductClick(record)}
            title="Deduct Balance"
          ></Button>
          <Button
            type="default"
            icon={<FaHistory className="text-gray-600" />}
            onClick={() => onShowHistory && onShowHistory(record)}
            title="Wallet History"
          ></Button>
          {/* <Button type="primary" danger icon={<FaTrash />} onClick={() => onDelete(record)}></Button> */}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        title={
          pendingUser ? `Block ${pendingUser.name || "User"}` : "Block User"
        }
        open={isBlockModalVisible}
        onOk={() => {
          const reason = blockReason || "";
          onToggleBlock(pendingUserId, true, reason);
          setIsBlockModalVisible(false);
          setPendingUserId(null);
          setPendingUser(null);
          setBlockReason("");
        }}
        onCancel={() => {
          setIsBlockModalVisible(false);
          setPendingUserId(null);
          setPendingUser(null);
          setBlockReason("");
        }}
        okText="Block"
      >
        <p>Please provide a reason for blocking this user.</p>
        <Input.TextArea
          rows={4}
          value={blockReason}
          onChange={(e) => setBlockReason(e.target.value)}
          placeholder="Enter block reason"
        />
      </Modal>
      <div className="mb-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1">
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
          <DatePicker
            value={startDate}
            onChange={onStartDateChange}
            placeholder="Start Date"
          />
          <DatePicker
            value={endDate}
            onChange={onEndDateChange}
            placeholder="End Date"
          />
          <Button type="primary" onClick={onApplyDateFilter}>
            Apply
          </Button>
          <Button onClick={onClearDateFilter}>Clear</Button>
        </div>
        <Export
          data={exportData}
          fileName={exportFileName}
          buttonText="Export"
        />
      </div>
      <Table
        dataSource={displayData}
        columns={columns}
        rowKey={(record) => record._id || record.id || record.mobileNo}
        scroll={{ x: true }}
        bordered={false}
        size="small"
        loading={loading}
        pagination={pagination}
      />
    </>
  );
};

export default UserTable;
