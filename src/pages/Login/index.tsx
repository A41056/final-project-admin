import React from "react";
import { Button, Form, Input, Card } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [form] = Form.useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login({
        email: values.email,
        password: values.password,
      });
      navigate("/");
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <div className="w-full flex items-center justify-center">
      <div className="min-h-screen flex items-center justify-center">
        <Card
          title={
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Welcome Back
            </h2>
          }
          className="w-full max-w-lg shadow-xl rounded-xl border-none p-6"
        >
          <Form
            form={form}
            layout="vertical"
            className="space-y-8"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="email"
              rules={[{ required: true, message: "Please input your email!" }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-500 text-xl" />}
                placeholder="Email"
                size="large"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-lg py-3"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                { required: true, message: "Please input your password!" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-500 text-xl" />}
                placeholder="Password"
                size="large"
                className="rounded-lg border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-lg py-3"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                className="bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg py-6"
              >
                Login
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
