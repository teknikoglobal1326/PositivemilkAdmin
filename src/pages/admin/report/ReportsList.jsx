import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  message,
  Tabs,
  Card,
  Typography,
  Select,
  DatePicker,
  Spin,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import {
  getReportsList,
  downloadReportsViaType,
} from "../../../services/admin/apiReports";

const { Title } = Typography;
const { RangePicker } = DatePicker;

function ReportsList() {
  const [reports, setReports] = useState({
    monthly: [],
    quarterly: [],
    yearly: [],
  });
  const [loading, setLoading] = useState({
    monthly: false,
    quarterly: false,
    yearly: false,
  });
  const [pagination, setPagination] = useState({
    monthly: { current: 1, pageSize: 10, total: 0 },
    quarterly: { current: 1, pageSize: 10, total: 0 },
    yearly: { current: 1, pageSize: 10, total: 0 },
  });
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("monthly");

  // Fetch reports for a specific type with server-side pagination & search
  const fetchReports = async (
    type,
    page = 1,
    limit = 10,
    search = searchText
  ) => {
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const data = await getReportsList(type, page, limit, search);
      setReports((prev) => ({
        ...prev,
        [type]: data?.data || [],
      }));
      setPagination((prev) => ({
        ...prev,
        [type]: {
          current: page,
          pageSize: limit,
          total: data?.total || 0,
        },
      }));
    } catch {
      message.error(`Failed to load ${type} reports`);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  // Load initial data
  useEffect(() => {
    fetchReports("monthly", 1, 10, "");
  }, []);

  // Handle tab change
  const handleTabChange = (key) => {
    setActiveTab(key);
    if (reports[key].length === 0) {
      fetchReports(key, 1, pagination[key]?.pageSize || 10, searchText);
    }
  };

  // Handle table pagination change
  const handleTableChange = (type, page, pageSize) => {
    fetchReports(type, page, pageSize, searchText);
  };

  // Handle search submit / clear
  const handleSearch = (value) => {
    const val = value ? value.trim() : "";
    setSearchText(val);
    fetchReports(activeTab, 1, pagination[activeTab]?.pageSize || 10, val);
  };

  // Handle download Excel report
  const handleDownloadExcel = async (type) => {
    try {
      message.loading({
        content: `Downloading ${type} report...`,
        key: "download",
      });
      const blobData = await downloadReportsViaType(type);

      if (blobData && blobData.size > 0) {
        // Create download link for the blob data
        const url = window.URL.createObjectURL(blobData);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${type}-report-${
          new Date().toISOString().split("T")[0]
        }.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        message.success({
          content: `${
            type.charAt(0).toUpperCase() + type.slice(1)
          } report downloaded successfully!`,
          key: "download",
        });
      } else {
        message.warning({
          content: `No data available for ${type} report`,
          key: "download",
        });
      }
    } catch (error) {
      console.error("Download error:", error);
      message.error({
        content: `Failed to download ${type} report`,
        key: "download",
      });
    }
  };

  // Table columns configuration
  const columns = [
    {
      title: "Invoice Date",
      dataIndex: "invoiceDate",
      key: "invoiceDate",
      width: 120,
      render: (date) => <span className="font-medium">{date || "-"}</span>,
    },
    {
      title: "Recipient Name",
      dataIndex: "recipientName",
      key: "recipientName",
      width: 150,
      render: (name) => <span className="font-medium">{name || "-"}</span>,
    },
    {
      title: "Recipient Address",
      dataIndex: "recipientAddress",
      key: "recipientAddress",
      width: 150,
      render: (address) => <span className="text-sm">{address || "-"}</span>,
    },
    {
      title: "Recipient GSTIN",
      dataIndex: "recipientGSTIN",
      key: "recipientGSTIN",
      width: 150,
      render: (gstin) => (
        <span className="text-sm font-mono">{gstin || "N/A"}</span>
      ),
    },
    {
      title: "Place of Supply",
      dataIndex: "placeOfSupply",
      key: "placeOfSupply",
      width: 130,
      render: (place) => place || "-",
    },
    {
      title: "Shipping Address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      width: 150,
      render: (address) => <span className="text-sm">{address || "-"}</span>,
    },
    {
      title: "Product Description",
      dataIndex: "description",
      key: "description",
      width: 180,
      render: (description) => (
        <span className="font-medium">{description || "-"}</span>
      ),
    },
    {
      title: "HSN Code",
      dataIndex: "hsnCode",
      key: "hsnCode",
      width: 100,
      render: (code) => (
        <span className="text-sm font-mono">{code || "N/A"}</span>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      width: 100,
      align: "center",
      render: (quantity, record) => (
        <div className="text-center">
          <div className="font-medium">{quantity || 0}</div>
          <div className="text-xs text-gray-500">{record.unit}</div>
        </div>
      ),
    },
    {
      title: "Taxable Value",
      dataIndex: "taxableValue",
      key: "taxableValue",
      width: 120,
      align: "right",
      render: (value) => (
        <span className="font-mono">₹{value?.toFixed(2) || "0.00"}</span>
      ),
    },
    {
      title: "GST",
      key: "gst",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div>
          <div className="text-sm font-medium">{record.gstRate || "0%"}</div>
          <div className="text-xs text-gray-500">
            ₹{record.taxAmount?.toFixed(2) || "0.00"}
          </div>
        </div>
      ),
    },
    {
      title: "Total Value",
      dataIndex: "totalInvoiceValue",
      key: "totalInvoiceValue",
      width: 120,
      align: "right",
      render: (value) => (
        <span className="font-mono font-semibold text-green-600">
          ₹{value?.toFixed(2) || "0.00"}
        </span>
      ),
    },
    {
      title: "Reverse Charge",
      dataIndex: "reverseCharge",
      key: "reverseCharge",
      width: 100,
      align: "center",
      render: (charge) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            charge === "Y"
              ? "bg-orange-100 text-orange-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {charge === "Y" ? "Yes" : "No"}
        </span>
      ),
    },
  ];

  // Tab items configuration
  const tabItems = [
    {
      key: "monthly",
      label: "Monthly Reports",
      children: (
        <div>
          <div className="mb-2 flex justify-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadExcel("monthly")}
              size="middle"
            >
              Download Monthly Report
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={reports.monthly}
            loading={loading.monthly}
            rowKey={(record, index) =>
              record._id || `monthly-${pagination.monthly.current}-${index}`
            }
            pagination={{
              current: pagination.monthly.current,
              pageSize: pagination.monthly.pageSize,
              total: pagination.monthly.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} invoices`,
              onChange: (page, pageSize) =>
                handleTableChange("monthly", page, pageSize),
            }}
            className="bg-white rounded-lg shadow-sm"
            size="middle"
            scroll={{ x: 1600 }}
          />
        </div>
      ),
    },
    {
      key: "quarterly",
      label: "Quarterly Reports",
      children: (
        <div>
          <div className="mb-2 flex justify-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadExcel("quarterly")}
              size="middle"
            >
              Download Quarterly Report
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={reports.quarterly}
            loading={loading.quarterly}
            rowKey={(record, index) =>
              record._id || `quarterly-${pagination.quarterly.current}-${index}`
            }
            pagination={{
              current: pagination.quarterly.current,
              pageSize: pagination.quarterly.pageSize,
              total: pagination.quarterly.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} invoices`,
              onChange: (page, pageSize) =>
                handleTableChange("quarterly", page, pageSize),
            }}
            className="bg-white rounded-lg shadow-sm"
            size="middle"
            scroll={{ x: 1600 }}
          />
        </div>
      ),
    },
    {
      key: "yearly",
      label: "Yearly Reports",
      children: (
        <div>
          <div className="mb-2 flex justify-end">
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadExcel("yearly")}
              size="middle"
            >
              Download Yearly Report
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={reports.yearly}
            loading={loading.yearly}
            rowKey={(record, index) =>
              record._id || `yearly-${pagination.yearly.current}-${index}`
            }
            pagination={{
              current: pagination.yearly.current,
              pageSize: pagination.yearly.pageSize,
              total: pagination.yearly.total,
              showSizeChanger: true,
              showQuickJumper: true,
              pageSizeOptions: ["10", "20", "50", "100"],
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} invoices`,
              onChange: (page, pageSize) =>
                handleTableChange("yearly", page, pageSize),
            }}
            className="bg-white rounded-lg shadow-sm"
            size="middle"
            scroll={{ x: 1600 }}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gray-50">
      <div className="p-4">
        {/* Header */}
        <div className="mb-3">
          <Title level={3} className="!mb-1">
            Reports Management
          </Title>
        </div>

        {/* Search Controls */}
        <div className="mb-3">
          <Input.Search
            placeholder={`Search ${activeTab} reports...`}
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              if (!e.target.value) {
                fetchReports(
                  activeTab,
                  1,
                  pagination[activeTab]?.pageSize || 10,
                  ""
                );
              }
            }}
            onSearch={handleSearch}
            style={{ maxWidth: 400 }}
            size="middle"
            allowClear
          />
        </div>

        {/* Reports Tabs */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          size="middle"
          className="reports-tabs"
        />
      </div>
    </div>
  );
}

export default ReportsList;
