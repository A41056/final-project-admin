import React, { useState } from "react";
import { useQueryClient } from "react-query";
import { userApi } from "@/config/api";
import FilterPanel from "@/components/Customer/FilterPanel";
import CustomerTable from "@/components/Customer/CustomerTable";
import type { Customer } from "@/types/customer";

const Customers: React.FC = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    gender: undefined as string | undefined,
    isActive: undefined as boolean | undefined,
    pageNumber: 1,
    pageSize: 10,
  });

  const { data, isLoading, isError } = userApi.useGet("/users") as {
    data: Customer[];
    isLoading: boolean;
    isError: boolean;
  };

  const filteredCustomers = React.useMemo(() => {
    if (!data) return [];
    return data.filter((user) => {
      const matchSearch =
        filters.search === "" ||
        user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.phone?.toLowerCase().includes(filters.search.toLowerCase());
      const matchGender =
        !filters.gender || user.gender?.toLowerCase() === filters.gender;
      const matchActive =
        filters.isActive === undefined || user.isActive === filters.isActive;
      return matchSearch && matchGender && matchActive;
    });
  }, [data, filters]);

  const totalItems = filteredCustomers.length;
  const paginatedCustomers = React.useMemo(() => {
    const start = (filters.pageNumber - 1) * filters.pageSize;
    return filteredCustomers.slice(start, start + filters.pageSize);
  }, [filteredCustomers, filters.pageNumber, filters.pageSize]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      pageNumber: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, pageNumber: page }));
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontWeight: "bold", fontSize: 24, marginBottom: 16 }}>
        Customers
      </h2>
      <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
      <CustomerTable
        customers={paginatedCustomers}
        loading={isLoading}
        currentPage={filters.pageNumber}
        pageSize={filters.pageSize}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
      {isError && <p style={{ color: "red" }}>Failed to load customers</p>}
    </div>
  );
};

export default Customers;