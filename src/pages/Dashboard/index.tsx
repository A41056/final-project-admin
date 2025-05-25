import React from 'react';
import { Row, Col, Card, Statistic, Typography, Spin } from 'antd';
import { catalogApi, orderApi } from '@/config/api';
import OrderStatsChart from '@/components/OrderStatsChart/OrderStatsChart';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const { data: productStats, isLoading: loadingProducts } = catalogApi.useGet("/dashboard/product-stats");
  const { data: orderStats, isLoading: loadingOrders } = orderApi.useGet("/dashboard/order-stats?range=7d");

  const loading = loadingProducts || loadingOrders;

  return (
    <div style={{ padding: 24 }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        Tổng quan kinh doanh
      </Title>

      {loading ? (
        <Spin size="large" />
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Doanh thu (7 ngày)"
                  value={orderStats?.totalSales ?? 0}
                  prefix="₫"
                  suffix={<span style={{ color: orderStats?.salesChangePercent >= 0 ? 'green' : 'red' }}>
                    {orderStats?.salesChangePercent?.toFixed(1)}%
                  </span>}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Đơn hàng mới"
                  value={orderStats?.totalOrders ?? 0}
                  suffix={<span style={{ color: orderStats?.orderChangePercent >= 0 ? 'green' : 'red' }}>
                    {orderStats?.orderChangePercent?.toFixed(1)}%
                  </span>}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Sản phẩm đang bán"
                  value={productStats?.active ?? 0}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Sản phẩm hết hàng"
                  value={productStats?.outOfStock ?? 0}
                />
              </Card>
            </Col>
          </Row>

          <Row style={{ marginTop: 32 }}>
            <Col span={24}>
              <Card title="Biểu đồ doanh thu theo ngày (7 ngày)">
                <div style={{ height: 300 }}>
                  <OrderStatsChart data={orderStats?.chart ?? []} />
                </div>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Dashboard;