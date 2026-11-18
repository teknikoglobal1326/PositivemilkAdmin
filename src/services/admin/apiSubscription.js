import { message } from "antd";
import axiosInstance from "@utils/axiosInstance";

export const getAllSubscription = async (params = {}) => {
  try {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.append(key, value);
      }
    });

    const queryString = query.toString();
    const response = await axiosInstance.get(
      `/api/admin/subscriptionList${queryString ? `?${queryString}` : ""}`,
    );
    // console.log(response.data.data)
    return response.data;
  } catch (error) {
    // console.log(error)
    message.error("Error fetching subscription list");
  }
};

export const getSubscriptionsDetails = async (id) => {
  try {
    const response = await axiosInstance.get(
      `/api/admin/subscriptionDataById/${id}`,
    );
    // console.log(response.data.data)
    return response.data;
  } catch (error) {
    // console.log(error)
    message.error("Error fetching subscription list");
  }
};
