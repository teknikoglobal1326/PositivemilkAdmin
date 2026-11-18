import React, { useEffect, useState } from "react";
import { Table, Button, message } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import { getAllSubscription } from "../../../services/admin/apiSubscription";
import SubscriptionFilter from "./components/SubscriptionFilter";
import Export from "../../../components/common/Export";
import formatDataForExport from "./utils/formatDataForExport";

const frequencyLabels = {
  daily: "Daily",
  alternateDay: "Alternate Day",
  every3Day: "Every 3 Days",
  weekly: "Weekly",
  monthly: "Monthly",
};

function SubscriptionList() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [status, setStatus] = useState(undefined);
  const [frequency, setFrequency] = useState(undefined);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [pauseDate, setPauseDate] = useState(null);
  const [pauseEndDate, setPauseEndDate] = useState(null);
  const navigate = useNavigate();

  console.log("subscription", subscriptions);

  const fetchSubscriptions = async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getAllSubscription(filters);
      console.log("data", data);
      setSubscriptions(data.subscriptionList);
    } catch {
      message.error("Failed to load subscriptions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleApplyFilters = () => {
    fetchSubscriptions({
      status,
      frequency,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
      pauseStartDate: pauseDate ? pauseDate.format("YYYY-MM-DD") : undefined,
      pauseEndDate: pauseEndDate
        ? pauseEndDate.format("YYYY-MM-DD")
        : undefined,
    });
  };

  const handleClearFilters = () => {
    setStatus(undefined);
    setFrequency(undefined);
    setStartDate(null);
    setEndDate(null);
    setPauseDate(null);
    setPauseEndDate(null);
    fetchSubscriptions();
  };

  const filteredData = subscriptions.filter(
    (sub) =>
      sub.userId?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      sub.productId?.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  const exportFileName = `${status ? `${status}-` : ""}subscription${
    startDate || endDate
      ? `-${startDate ? startDate.format("YYYY-MM-DD") : "start"}-${
          endDate ? endDate.format("YYYY-MM-DD") : "end"
        }`
      : ""
  }${frequency ? `-${frequencyLabels[frequency] || frequency}` : ""}${
    pauseDate || pauseEndDate
      ? `-pause-${pauseDate ? pauseDate.format("YYYY-MM-DD") : "start"}-${
          pauseEndDate ? pauseEndDate.format("YYYY-MM-DD") : "end"
        }`
      : ""
  }.xlsx`;

  const columns = [
    {
      title: "User",
      dataIndex: ["userId", "name"],
      key: "user",
      render: (_, record) => record.userId?.name || "-",
    },
    {
      title: "MobileNo",
      dataIndex: ["userId", "mobileNo"],
      key: "mobileNo",
      render: (_, record) => record.userId?.mobileNo || "-",
    },
    {
      title: "Product",
      dataIndex: ["productId", "name"],
      key: "product",
      render: (_, record) => record.productId?.name || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) => (date ? new Date(date).toLocaleDateString() : "-"),
    },
    {
      title: "Schedule",
      dataIndex: ["frequency", "type"],
      key: "frequency",
      render: (_, record) => frequencyLabels[record.frequency?.type] || "-",
    },
    {
      title: "Pause Period",
      key: "pausePeriod",
      render: (_, record) => {
        const { pauseStartDate, pauseEndDate } = record;
        if (pauseStartDate && pauseEndDate) {
          return `${new Date(pauseStartDate).toLocaleDateString()} - ${new Date(pauseEndDate).toLocaleDateString()}`;
        }
        return "--";
      },
    },
    {
      title: "Modification Details",
      key: "modificationDetails",
      render: (_, record) => {
        const { modifyStartDate, modifyEndDate, modifyQuantity } = record;
        if (modifyStartDate || modifyEndDate || modifyQuantity) {
          const startDate = modifyStartDate
            ? new Date(modifyStartDate).toLocaleDateString()
            : "--";
          const endDate = modifyEndDate
            ? new Date(modifyEndDate).toLocaleDateString()
            : "--";
          const quantity = modifyQuantity ?? "--";
          return `Start: ${startDate}, End: ${endDate}, Quantity: ${quantity}`;
        }
        return "--";
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => status?.charAt(0).toUpperCase() + status?.slice(1),
    },
    {
      title: "Cancel Reason",
      dataIndex: "cancelReason",
      key: "cancelReason",
      render: (_, record) => record.cancelReason || "N/A",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => navigate(`/admin/subscription/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="lg:px-10 px-5 my-8 flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <SubscriptionFilter
              searchText={searchText}
              onSearchChange={setSearchText}
              status={status}
              onStatusChange={setStatus}
              frequency={frequency}
              onFrequencyChange={setFrequency}
              startDate={startDate}
              onStartDateChange={setStartDate}
              pauseDate={pauseDate}
              onPauseDateChange={setPauseDate}
              pauseEndDate={pauseEndDate}
              onPauseEndDateChange={setPauseEndDate}
              onApply={handleApplyFilters}
              onClear={handleClearFilters}
            />
          </div>

          <div className="flex justify-end lg:pt-2">
            <Export
              data={formatDataForExport(filteredData)}
              fileName={exportFileName}
              buttonText="Export"
            />
          </div>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={loading}
        rowKey="_id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        className="bg-white rounded-lg shadow"
      />
    </>
  );
}

export default SubscriptionList;
