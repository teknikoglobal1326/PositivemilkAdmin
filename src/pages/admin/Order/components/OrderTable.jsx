import {
  Button,
  Space,
  Table,
  Tag,
  Modal,
  Select,
  message,
  DatePicker,
} from "antd";
import { FaTrash } from "react-icons/fa";
import { IoMdEye } from "react-icons/io";
import { useNavigate } from "react-router";
import {
  getAllOrder,
  AssignDriver,
  getAllDrivers,
} from "../../../../services/admin/apiOrder";
import { useCallback, useEffect, useState } from "react";
import { convertDate } from "../../../../utils/formatDate";
import RefundModal from "./RefundModal";
import Export from "../../../../components/common/Export";

const { Option } = Select;

const OrderTable = ({ searchText, type, service, onCountsUpdate }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const fetchOrderList = useCallback(
    async (type, filters = {}) => {
      setLoading(true);
      try {
        const res = await getAllOrder(service, type, filters);
        console.log(res.orders[0], "ressssssssssssssss");
        setOrders(res.orders || []);
        if (res.counts && onCountsUpdate) {
          onCountsUpdate(res.counts);
        }
      } catch {
        message.error("Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [service, onCountsUpdate],
  );

  useEffect(() => {
    fetchOrderList(type);
  }, [fetchOrderList, type]);

  const fetchDrivers = async () => {
    try {
      const res = await getAllDrivers();
      setDrivers(res.driverList || []);
    } catch {
      message.error("Error fetching driver list");
    }
  };

  const handleViewDetails = (record) => {
    navigate(`/admin/order/${service}/${record._id}`);
  };

  const handleRefund = (record) => {
    setSelectedOrder(record);
    setRefundModalVisible(true);
  };

  const handleRefundSuccess = () => {
    fetchOrderList(type);
  };

  const handleRefundCancel = () => {
    setRefundModalVisible(false);
    setSelectedOrder(null);
  };

  const handleAssignModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning("Please select at least one order");
      return;
    }
    fetchDrivers();
    setAssignModalVisible(true);
  };

  const handleAssignDriver = async () => {
    if (!selectedDriver) {
      message.warning("Please select a driver");
      return;
    }

    const payload = {
      orderIds: selectedRowKeys,
      driverId: selectedDriver,
    };
    console.log(payload, "fjjjjjjjjjjjjjjjjjj");
    try {
      await AssignDriver(payload);

      message.success("Orders assigned successfully");
      setAssignModalVisible(false);
      setSelectedRowKeys([]);
      setSelectedDriver(null);
      fetchOrderList(type);
    } catch {
      message.error("Error assigning orders");
    }
  };

  const handleApplyDateFilter = () => {
    const filters = {
      startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
      isSubscription: subscription || undefined,
    };
    fetchOrderList(type, filters);
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setSubscription(null);
    fetchOrderList(type);
  };

  const filteredOrders = orders.filter((item) => {
    const q = searchText.toLowerCase();
    const bookingId = String(item.booking_id || "").toLowerCase();
    const customerName = String(item.userId?.name || "").toLowerCase();
    const mobileNo = String(item.userId?.mobileNo || "").toLowerCase();
    const orderName = String(item.orderName || "").toLowerCase();

    return (
      bookingId.includes(q) ||
      customerName.includes(q) ||
      mobileNo.includes(q) ||
      orderName.includes(q)
    );
  });

  const exportData = filteredOrders.map((order) => ({
    BookingID: order.booking_id || "",
    CustomerName: order.userId?.name || "",
    MobileNo: order.userId?.mobileNo || "",
    SelectedStartDate: startDate ? startDate.format("YYYY-MM-DD") : "",
    SelectedEndDate: endDate ? endDate.format("YYYY-MM-DD") : "",
    DeliveryDate: order.deliveryDate ? convertDate(order.deliveryDate) : "",
    DeliveryTime: order.deliveryTime || "",
    Pincode: order.pincode || "",
    Address: order.address || "N/A",
    TotalAmount: order.finalTotalPrice ?? "",
    OrderStatus: order.orderStatus || "",
    PaymentStatus: order.paymentStatus || "",
    PaymentMode: order.paymentMode || "",
    AssignedTo: order.assignedDriver || "Not Assigned",
    OrderType: order.isSubscription === "yes" ? "Subscription" : "Normal order",
  }));

  const exportFileName = `${service || "orders"}-${type || "all"}${
    startDate || endDate
      ? `-${startDate ? startDate.format("YYYY-MM-DD") : "start"}-${
          endDate ? endDate.format("YYYY-MM-DD") : "end"
        }`
      : ""
  }.xlsx`;

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys) => {
      setSelectedRowKeys(selectedRowKeys);
    },
  };

  const columns = [
    {
      title: "Booking ID",
      dataIndex: "booking_id",
      key: "booking_id",
      align: "center",
    },
    {
      title: "Customer Name",
      key: "customerName",
      align: "center",
      render: (record) => record.userId?.name || "N/A",
    },
    {
      title: "Order Name",
      dataIndex: "orderName",
      key: "orderName",
      align: "center",
      render: (orderName, record) => {
        const name =
          orderName ||
          (record.productData || [])
            .map((p) =>
              p.productId?.name
                ? `${p.productId.name}${p.quantity ? ` × ${p.quantity}` : ""}`
                : "",
            )
            .filter(Boolean)
            .join(", ");
        return name ? (
          <span className="font-medium text-gray-800">{name}</span>
        ) : (
          "N/A"
        );
      },
    },
    {
      title: "Phone Number",
      key: "mobileNo",
      align: "center",
      render: (record) => record.userId?.mobileNo,
    },
    {
      title: "Delivery Date",
      dataIndex: "deliveryDate",
      key: "deliveryDate",
      align: "center",
      render: (deliveryDate) => `${convertDate(deliveryDate)}`,
    },
    {
      title: "Delivery Time",
      dataIndex: "deliveryTime",
      key: "deliveryTime",
      align: "center",
    },
    {
      title: "Pincode",
      dataIndex: "pincode",
      key: "pincode",
      align: "center",
      render: (pincode) => `${pincode}`,
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      align: "center",
      render: (address) => `${address || "N/A"}`,
    },
    {
      title: "Total Amount",
      dataIndex: "finalTotalPrice",
      key: "finalTotalPrice",
      align: "center",
      render: (amount) => `₹${amount}`,
    },
    {
      title: "Order Status",
      dataIndex: "orderStatus",
      key: "orderStatus",
      align: "center",
      render: (status) => (
        <Tag
          color={
            status === "delivered"
              ? "green"
              : status === "accepted"
                ? "blue"
                : "orange"
          }
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Payment Status",
      dataIndex: "paymentStatus",
      key: "paymentStatus",
      align: "center",
      render: (status) => (
        <Tag
          color={
            status == "paid" ? "green" : status == "pending" ? "orange" : "red"
          }
        >
          {status?.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Payment Mode",
      dataIndex: "paymentMode",
      key: "paymentMode",
      align: "center",
    },
    {
      title: "Assigned To",
      dataIndex: "assignedDriver",
      key: "assignedDriver",
      align: "center",
      render: (assignedDriver) =>
        assignedDriver ? (
          <Tag color="green">{assignedDriver}</Tag>
        ) : (
          <Tag color="red">Not Assigned</Tag>
        ),
    },
    {
      title: "Order Type",
      dataIndex: "isSubscription",
      key: "isSubscription",
      align: "center",
      render: (isSubscription) =>
        isSubscription === "yes" ? (
          <Tag color="green">{isSubscription}</Tag>
        ) : (
          <Tag color="blue">Normal order</Tag>
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
            onClick={() => handleViewDetails(record)}
          />
          {type === "cancelled" &&
            (record.isRefunded ? (
              <Tag color="green">Refunded Done</Tag>
            ) : (
              <Button
                type="primary"
                style={{ backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" }}
                onClick={() => handleRefund(record)}
              >
                Refund
              </Button>
            ))}
        </Space>
      ),
    },
  ];

  return (
    <>
      <div
        style={{
          marginBottom: 12,
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <DatePicker
          value={startDate}
          onChange={setStartDate}
          placeholder="Start Date"
        />
        <DatePicker
          value={endDate}
          onChange={setEndDate}
          placeholder="End Date"
        />

        {/* <label htmlFor="subscription">Subscription</label> */}
        <Select
          id="subscription"
          style={{ width: 120 }}
          placeholder="Subscription"
          allowClear
          onChange={setSubscription}
          value={subscription}
        >
          <Option value="yes">Yes</Option>
          <Option value="no">No</Option>
        </Select>
        <Button type="primary" onClick={handleApplyDateFilter}>
          Apply
        </Button>
        <Button onClick={handleClearDateFilter}>Clear</Button>
        <Export
          data={exportData}
          fileName={exportFileName}
          buttonText="Export"
        />
      </div>
      <Table
        rowSelection={type === "pending" ? rowSelection : null}
        dataSource={filteredOrders}
        columns={columns}
        rowKey="_id"
        scroll={{ x: true }}
        bordered
        size="small"
        loading={loading}
      />

      {type === "pending" && (
        <Button
          type="primary"
          onClick={handleAssignModal}
          style={{ marginTop: 16 }}
          disabled={selectedRowKeys.length === 0}
        >
          Assign Order
        </Button>
      )}

      <RefundModal
        visible={refundModalVisible}
        onCancel={handleRefundCancel}
        orderData={selectedOrder}
        onSuccess={handleRefundSuccess}
      />

      <Modal
        title="Assign Driver"
        visible={assignModalVisible}
        onOk={handleAssignDriver}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedDriver(null);
        }}
        okText="Assign"
        cancelText="Cancel"
      >
        <Select
          style={{ width: "100%" }}
          placeholder="Select a driver"
          onChange={(value) => setSelectedDriver(value)}
          value={selectedDriver}
        >
          {drivers.map((driver) => (
            <Option key={driver._id} value={driver._id}>
              {driver.name || driver._id}
            </Option>
          ))}
        </Select>
      </Modal>
    </>
  );
};

export default OrderTable;
