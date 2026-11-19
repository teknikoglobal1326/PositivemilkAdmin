import { Modal, Tabs, message } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import UserTable from "./components/UserTable";
import WalletHistoryTable from "./components/WalletHistoryTable";
import WalletUpdateModal from "./components/WalletUpdateModal";
import WalletDeductModal from "./components/WalletDeductModal";
import GocoinHistoryModal from "./components/GocoinHistoryModal";
import {
  getAllUser,
  blockUser,
  getUserGocoinHistory,
  updateUserWallet,
  deductUserBalance,
} from "../../../services/admin/apiUser";

function User() {
  const tabLabelByKey = {
    new: "New",
    verified: "Verified",
    unverified: "Unverified",
    block: "Blocked",
    all: "All",
    "Wallet History": "Wallet History",
  };

  const [user, setUser] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("new");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [userCounts, setUserCounts] = useState({
    all: 0,
    new: 0,
    verified: 0,
    unverified: 0,
    block: 0,
  });

  // History modal state
  const [isHistoryModalVisible, setIsHistoryModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [gocoinHistory, setGocoinHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Wallet modal state
  const [isWalletModalVisible, setIsWalletModalVisible] = useState(false);
  const [selectedWalletUser, setSelectedWalletUser] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Deduct modal state
  const [isDeductModalVisible, setIsDeductModalVisible] = useState(false);
  const [selectedDeductUser, setSelectedDeductUser] = useState(null);
  const [deductLoading, setDeductLoading] = useState(false);

  const fetchUser = useCallback(async (type, params = {}) => {
    setLoading(true);
    try {
      const res = await getAllUser(type, params);
      setUser(res.data || []);
      setTotalUsers(res.total || 0);
      if (res.counts) {
        setUserCounts(res.counts);
      }
    } catch {
      message.error("Failed to load user.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setPage(1);
    setSearchText("");
  };

  const handleSearchChange = (val) => {
    setSearchText(val);
    setPage(1);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUser(activeTab, {
        page,
        limit: pageSize,
        search: searchText ? searchText.trim() : undefined,
        startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
        endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [activeTab, page, pageSize, searchText, startDate, endDate, fetchUser]);

  const handleApplyDateFilter = () => {
    setPage(1);
    fetchUser(activeTab, {
      page: 1,
      limit: pageSize,
      search: searchText ? searchText.trim() : undefined,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
    });
  };

  const handleClearDateFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setPage(1);
  };

  const refreshUserData = () => {
    fetchUser(activeTab, {
      page,
      limit: pageSize,
      search: searchText ? searchText.trim() : undefined,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : undefined,
      endDate: endDate ? endDate.format("YYYY-MM-DD") : undefined,
    });
  };

  const handleToggleBlock = async (
    userId,
    isBlocked = false,
    blockReason = "",
  ) => {
    try {
      const payload = {
        isBlocked,
        status: !isBlocked,
        blockReason: blockReason || "",
      };
      await blockUser(userId, payload);
      message.success("User status updated");
      refreshUserData();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update user status",
      );
    }
  };

  const handleShowHistory = async (user) => {
    setSelectedUser(user);
    setIsHistoryModalVisible(true);
    setHistoryLoading(true);

    try {
      const res = await getUserGocoinHistory(user._id);
      setGocoinHistory(res.data.history || []);
    } catch {
      message.error("Failed to load gocoin history.");
      setGocoinHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleCloseHistoryModal = () => {
    setIsHistoryModalVisible(false);
    setSelectedUser(null);
    setGocoinHistory([]);
  };

  const handleOpenWalletModal = (user) => {
    setSelectedWalletUser(user);
    setIsWalletModalVisible(true);
  };

  const handleCloseWalletModal = () => {
    setIsWalletModalVisible(false);
    setSelectedWalletUser(null);
  };

  const handleUpdateWallet = async (userId, data) => {
    setWalletLoading(true);
    try {
      await updateUserWallet(userId, data);
      message.success("Wallet updated successfully");
      handleCloseWalletModal();
      refreshUserData();
    } catch (error) {
      message.error(error.response?.data?.message || "Failed to update wallet");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleOpenDeductModal = (user) => {
    setSelectedDeductUser(user);
    setIsDeductModalVisible(true);
  };

  const handleCloseDeductModal = () => {
    setIsDeductModalVisible(false);
    setSelectedDeductUser(null);
  };

  const handleDeductBalance = async (userId, data) => {
    setDeductLoading(true);
    try {
      await deductUserBalance(userId, data);
      message.success("Balance deducted successfully");
      handleCloseDeductModal();
      refreshUserData();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to deduct balance",
      );
    } finally {
      setDeductLoading(false);
    }
  };

  const handleDelete = (user) => {
    Modal.confirm({
      title: "Delete User",
      content: `Are you sure you want to delete "${user.name}"?`,
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        // console.log('Deleting category:', user);
      },
    });
  };
  console.log("userCounts", userCounts);
  const tabItems = [
    {
      key: "new",
      label: `New (${userCounts.new})`,
    },
    {
      key: "verified",
      label: `Verified (${userCounts.verified})`,
    },
    {
      key: "unverified",
      label: `Unverified (${userCounts.unverified})`,
    },
    {
      key: "block",
      label: `Blocked (${userCounts.block})`,
    },
    {
      key: "all",
      label: `All (${userCounts.all})`,
    },
    {
      key: "Wallet History",
      label: `Wallet History (${userCounts.wallet || 0})`,
    },
  ];

  const paginationConfig = {
    current: page,
    pageSize: pageSize,
    total: totalUsers,
    showSizeChanger: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    onChange: (newPage, newPageSize) => {
      setPage(newPage);
      setPageSize(newPageSize);
    },
    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
  };

  return (
    <>
      <div className="lg:px-10 px-5 my-8">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          className="mb-6"
        />

        {activeTab === "Wallet History" ? (
          <WalletHistoryTable
            data={user}
            loading={loading}
            pagination={paginationConfig}
            searchText={searchText}
            onSearchChange={handleSearchChange}
          />
        ) : (
          <UserTable
            onDelete={handleDelete}
            data={user}
            pagination={paginationConfig}
            searchText={searchText}
            onSearchChange={handleSearchChange}
            onToggleBlock={handleToggleBlock}
            onShowHistory={handleShowHistory}
            onWalletClick={handleOpenWalletModal}
            onDeductClick={handleOpenDeductModal}
            loading={loading}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
            onApplyDateFilter={handleApplyDateFilter}
            onClearDateFilter={handleClearDateFilter}
            activeTabLabel={tabLabelByKey[activeTab] || "All"}
          />
        )}
      </div>

      {/* Wallet Update Modal */}
      <WalletUpdateModal
        visible={isWalletModalVisible}
        user={selectedWalletUser}
        onUpdate={handleUpdateWallet}
        onClose={handleCloseWalletModal}
        loading={walletLoading}
      />

      {/* Wallet Deduct Modal */}
      <WalletDeductModal
        visible={isDeductModalVisible}
        user={selectedDeductUser}
        onDeduct={handleDeductBalance}
        onClose={handleCloseDeductModal}
        loading={deductLoading}
      />

      {/* Gocoin History Modal */}
      <GocoinHistoryModal
        visible={isHistoryModalVisible}
        user={selectedUser}
        history={gocoinHistory}
        loading={historyLoading}
        onClose={handleCloseHistoryModal}
      />

      {/* modal */}
      {/* <AddSubCategoryModel
                isModalOpen={isModalOpen}
                handleOk={handleOk}
                handleCancel={handleCancel}
            /> */}

      {/* edit modal */}
      {/* <EditSubCategoryModel
                isModalOpen={isEditModalOpen}
                handleOk={handleEditOk}
                handleCancel={handleEditCancel}
                categoryData={selectedCategory}
            /> */}
    </>
  );
}

export default User;
