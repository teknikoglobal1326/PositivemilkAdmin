import { message } from "antd";
import axiosInstance from "@utils/axiosInstance";

export const getReportsList = async (type, page = 1, limit = 10, search = "") => {
  try {
    const params = new URLSearchParams();
    if (type) params.append("type", type);
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (search) params.append("search", search);

    const response = await axiosInstance.get(
      `/api/admin/report?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    message.error("Error fetching report list");
  }
};

export const downloadReportsViaType = async (type) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/reportDownload?type=${type}`,
      {
        responseType: "blob", // Important for Excel file downloads
      }
    );
    return response.data;
  } catch (error) {
    console.error("Download error:", error);
    message.error("Error while downloading report");
    throw error;
  }
};
