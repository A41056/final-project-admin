import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';

interface ChartDataItem {
  date: string;
  sales: number;
  orderCount: number;
}

const OrderChart: React.FC<{ data: ChartDataItem[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          formatter={(value: number, name: string) => {
            if (name === 'sales') {
              return [`₫${value.toLocaleString()}`, 'Doanh thu'];
            }
            if (name === 'orderCount') {
              return [value, 'Đơn hàng'];
            }
            return [value, name];
          }}
        />
        <Legend />
        <Line type="monotone" dataKey="sales" name="Doanh thu" stroke="#8884d8" strokeWidth={2} />
        <Line type="monotone" dataKey="orderCount" name="Đơn hàng" stroke="#82ca9d" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default OrderChart;