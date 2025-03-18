import React from "react";
import { Button, Form, Input, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card
        title={
          <h2 className="text-3xl font-bold text-center text-gray-800">
            Welcome Back
          </h2>
        }
        className="w-full max-w-lg shadow-xl rounded-xl border-none p-6" // Tăng max-w và padding
      >
        <Form layout="vertical" className="space-y-8">
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please input your username!" }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-500 text-xl" />} // Tăng kích thước icon
              placeholder="Username"
              size="large"
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-lg py-3" // Tăng kích thước font và padding
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please input your password!" }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-500 text-xl" />} // Tăng kích thước icon
              placeholder="Password"
              size="large"
              className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-lg py-3" // Tăng kích thước font và padding
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              className="bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg py-6" // Tăng chiều cao và font
            >
              Login
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
