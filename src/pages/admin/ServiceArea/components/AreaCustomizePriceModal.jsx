import React, { useEffect, useState } from "react";
import { Modal, Table, InputNumber, Switch, Button, message, Spin, Input, Tag } from "antd";
import { FaTags, FaSave, FaCheckCircle } from "react-icons/fa";
import { getAreaCustomizePrices, saveAreaCustomizePrices } from "@services/admin/apiServiceArea";
import { getAllProducts } from "@services/apiProduct";

const BASE_URL = import.meta.env.VITE_BASE_URL || "";

function AreaCustomizePriceModal({ isModalOpen, area, onClose }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [globalDuration, setGlobalDuration] = useState(15);

  useEffect(() => {
    if (isModalOpen && area?._id) {
      loadData();
    }
  }, [isModalOpen, area]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [foodList, groceryList, customRes] = await Promise.all([
        getAllProducts("food").catch(() => []),
        getAllProducts("grocery").catch(() => []),
        getAreaCustomizePrices(area._id).catch(() => ({ customizedPrices: [] })),
      ]);

      const combined = [...(Array.isArray(foodList) ? foodList : []), ...(Array.isArray(groceryList) ? groceryList : [])];
      const seen = new Set();
      const availableList = [];
      for (const p of combined) {
        if (p && p._id && !seen.has(String(p._id))) {
          seen.add(String(p._id));
          availableList.push(p);
        }
      }

      const customizedList = customRes?.customizedPrices || [];

      // Map customized prices by productId
      const customMap = new Map();
      customizedList.forEach((item) => {
        const pId = item.productId?._id || item.productId;
        customMap.set(String(pId), item);
      });

      // Merge available products with existing customization
      const merged = availableList.map((prod) => {
        const id = String(prod._id);
        const existing = customMap.get(id);

        const isCustomActive = existing ? existing.status === "active" : false;
        const regMrp = Number(prod.mrp) || 0;
        const regSelling = Number(prod.sellingPrice) || 0;

        return {
          _id: prod._id,
          name: prod.name,
          primary_image: prod.primary_image,
          sku: prod.sku,
          unitOfMeasurement: prod.unitOfMeasurement,
          sellingUnit: prod.sellingUnit,
          mrp: regMrp,
          sellingPrice: regSelling,
          enabled: isCustomActive,
          customizeMrp: existing?.customizeMrp !== undefined ? Number(existing.customizeMrp) : regMrp,
          customizeSellingPrice: existing?.customizeSellingPrice !== undefined ? Number(existing.customizeSellingPrice) : regSelling,
          durationDays: existing?.durationDays !== undefined ? Number(existing.durationDays) : 15,
        };
      });

      setProducts(merged);
    } catch (err) {
      console.error(err);
      message.error("Failed to load products and customized pricing.");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item._id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const applyGlobalDuration = () => {
    if (!globalDuration || globalDuration < 1) {
      message.warning("Please enter a valid duration (minimum 1 day).");
      return;
    }
    setProducts((prev) =>
      prev.map((item) => ({
        ...item,
        durationDays: globalDuration,
      }))
    );
    message.success(`Applied duration of ${globalDuration} days to all products.`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = products.map((item) => ({
        productId: item._id,
        customizeMrp: Number(item.customizeMrp) || Number(item.mrp),
        customizeSellingPrice: Number(item.customizeSellingPrice) || Number(item.sellingPrice),
        durationDays: Number(item.durationDays) || 15,
        status: item.enabled ? "active" : "inactive",
      }));

      await saveAreaCustomizePrices(area._id, payload);
      message.success("Regional customized prices and durations saved successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      message.error("Failed to save customized prices.");
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const search = searchText.toLowerCase().trim();
    if (!search) return true;
    return (
      p.name?.toLowerCase().includes(search) ||
      p.sku?.toLowerCase().includes(search) ||
      p.sellingUnit?.toLowerCase().includes(search)
    );
  });

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_, record) => {
        const imgSrc = record.primary_image
          ? record.primary_image.startsWith("http")
            ? record.primary_image
            : `${BASE_URL}/${record.primary_image}`
          : "";
        return (
          <div className="flex items-center gap-3">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={record.name}
                className="w-12 h-12 object-cover rounded border"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : null}
            <div>
              <div className="font-semibold text-gray-800">{record.name}</div>
              <div className="text-xs text-gray-500">
                {record.sellingUnit || record.unitOfMeasurement || ""} {record.sku ? `• SKU: ${record.sku}` : ""}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Regular MRP",
      dataIndex: "mrp",
      key: "mrp",
      width: 120,
      render: (val) => <span className="text-gray-500">₹{val}</span>,
    },
    {
      title: "Regular Selling Price",
      dataIndex: "sellingPrice",
      key: "sellingPrice",
      width: 150,
      render: (val) => <span className="font-medium text-gray-700">₹{val}</span>,
    },
    {
      title: "Enable Regional Offer",
      key: "enabled",
      width: 160,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={record.enabled}
            onChange={(checked) => handleFieldChange(record._id, "enabled", checked)}
          />
          {record.enabled ? (
            <Tag color="success">Active</Tag>
          ) : (
            <Tag color="default">Off</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Customize MRP (₹)",
      key: "customizeMrp",
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.customizeMrp}
          disabled={!record.enabled}
          onChange={(val) => handleFieldChange(record._id, "customizeMrp", val)}
          style={{ width: "100%" }}
          prefix="₹"
        />
      ),
    },
    {
      title: "Customize Selling Price (₹)",
      key: "customizeSellingPrice",
      width: 180,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.customizeSellingPrice}
          disabled={!record.enabled}
          onChange={(val) => handleFieldChange(record._id, "customizeSellingPrice", val)}
          style={{ width: "100%" }}
          prefix="₹"
        />
      ),
    },
    {
      title: "Duration (Days)",
      key: "durationDays",
      width: 130,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.durationDays}
          disabled={!record.enabled}
          onChange={(val) => handleFieldChange(record._id, "durationDays", val)}
          style={{ width: "100%" }}
        />
      ),
    },
  ];

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-lg">
          <FaTags className="text-emerald-600" />
          <span>
            Customize Regional Price & Duration - {area?.city} ({area?.pincode})
          </span>
        </div>
      }
      open={isModalOpen}
      onCancel={onClose}
      width={1100}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="save"
          type="primary"
          icon={<FaSave />}
          loading={saving}
          onClick={handleSave}
          style={{ backgroundColor: "#059669", borderColor: "#059669" }}
        >
          Save Customize Prices
        </Button>,
      ]}
    >
      <div className="py-2">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-emerald-900">
          <div>
            <strong>Region:</strong> {area?.city}, {area?.state} (Pincode: <strong>{area?.pincode}</strong>)
            <div className="text-xs text-emerald-700 mt-0.5">
              Admin sets customized MRP, customized Selling Price, and offer validity duration for users in this region.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-xs text-emerald-800">Set Duration for All:</span>
            <InputNumber
              min={1}
              value={globalDuration}
              onChange={(v) => setGlobalDuration(v)}
              size="small"
              style={{ width: 70 }}
            />
            <Button size="small" type="primary" onClick={applyGlobalDuration} style={{ backgroundColor: "#059669", borderColor: "#059669" }}>
              Apply to All
            </Button>
          </div>
        </div>

        <div className="mb-3 flex justify-between items-center">
          <Input.Search
            placeholder="Search products by name or SKU..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: 300 }}
            allowClear
          />
          <div className="text-xs text-gray-500">
            Total Products: <strong>{products.length}</strong> | Active Offers:{" "}
            <strong>{products.filter((p) => p.enabled).length}</strong>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin tip="Loading products & regional prices..." />
          </div>
        ) : (
          <Table
            dataSource={filteredProducts}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 8, showSizeChanger: false }}
            size="middle"
          />
        )}
      </div>
    </Modal>
  );
}

export default AreaCustomizePriceModal;
