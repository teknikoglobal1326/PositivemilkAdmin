import { Button, DatePicker, Input, Select, Space } from "antd";

const statusOptions = [
  { label: "Active", value: "active" },
  //   { label: "Paused", value: "paused" },
  //   { label: "Pending", value: "pending" },
  { label: "Inactive", value: "inactive" },
  { label: "Cancelled", value: "cancle" },
];

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Alternate Day", value: "alternateDay" },
  { label: "Every 3 Days", value: "every3Day" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
];

function SubscriptionFilter({
  searchText,
  onSearchChange,
  status,
  onStatusChange,
  frequency,
  onFrequencyChange,
  startDate,
  onStartDateChange,
  pauseDate,
  onPauseDateChange,
  pauseEndDate,
  onPauseEndDateChange,
  onApply,
  onClear,
}) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end gap-4 justify-between">
      <Input.Search
        placeholder="Search by user or product"
        value={searchText}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ maxWidth: 300, borderRadius: "6px" }}
        size="large"
        allowClear
      />

      <Space wrap className="justify-end">
        <Select
          value={status}
          onChange={onStatusChange}
          placeholder="Status"
          style={{ width: 150 }}
          allowClear
          options={statusOptions}
        />
        <Select
          value={frequency}
          onChange={onFrequencyChange}
          placeholder="Schedule"
          style={{ width: 170 }}
          allowClear
          options={frequencyOptions}
        />
        <DatePicker
          value={startDate}
          onChange={onStartDateChange}
          placeholder="Start Date"
        />
        <DatePicker
          value={pauseDate}
          onChange={onPauseDateChange}
          placeholder="Pause Date"
        />
        <DatePicker
          value={pauseEndDate}
          onChange={onPauseEndDateChange}
          placeholder="Pause End Date"
        />
        <Button type="primary" onClick={onApply}>
          Apply Filters
        </Button>
        <Button onClick={onClear}>Clear</Button>
      </Space>
    </div>
  );
}

export default SubscriptionFilter;
