const fmtDate = (d) => {
  if (!d) return "";
  try {
    return new Date(d).toISOString().split("T")[0];
  } catch {
    return String(d);
  }
};

const frequencyLabels = {
  daily: "Daily",
  alternateDay: "Alternate Day",
  every3Day: "Every 3 Days",
  weekly: "Weekly",
  monthly: "Monthly",
};

const formatDataForExport = (subscriptions = []) =>
  subscriptions.map((s) => ({
    SubscriptionID: s._id || s.id || "",
    Mobile: s.userId.mobileNo,
    UserName: s.userId?.name || "",
    ProductName: s.productId?.name || "",
    Quantity: s.quantity ?? "",
    StartDate: fmtDate(s.startDate),
    Frequency: frequencyLabels[s.frequency?.type] || s.frequency?.type || "",
    Status: s.status || "",
    CancelReason: s.cancelReason || "",
    PauseStartDate: fmtDate(s.pauseStartDate),
    PauseEndDate: fmtDate(s.pauseEndDate),
  }));

export default formatDataForExport;
