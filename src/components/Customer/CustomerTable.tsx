import React from "react";
import { Table } from "antd";
import type { Customer } from "@/types/customer";
import moment from "moment";

interface CustomerTableProps {
  customers: Customer[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({
  customers,
  loading,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
}) => {
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (_: any, record: Customer) =>
        record.username || `${record.firstName} ${record.lastName}` || "-",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email: string) => email || "-",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      render: (phone: string) => phone || "-",
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      render: (gender: string) => gender || "-",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
      render: (age: number) => age ?? "-",
      width: 80,
      align: "center" as const,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      render: (isActive: boolean) => (isActive ? "Yes" : "No"),
      width: 80,
      align: "center" as const,
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      key: "createdDate",
      render: (date: string) => moment(date).format("YYYY-MM-DD"),
      width: 120,
      align: "center" as const,
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={customers}
      loading={loading}
      rowKey="id"
      pagination={{
        current: currentPage,
        pageSize,
        total: totalItems,
        onChange: onPageChange,
        position: ["bottomCenter"],
      }}
    />
  );
};

export default CustomerTable;