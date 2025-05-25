import React, { useState, useEffect } from "react";
import { Form, Input, Button, notification, DatePicker, Spin } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";

interface InventoryItem {
  item_name: string;
  quantity: number;
  warehouse_location: string;
  stored_date: string;
  expiration_date?: string | null;
}

interface FormValues {
  item_name: string;
  quantity: number;
  warehouse_location: string;
  stored_date: Dayjs;
  expiration_date?: Dayjs | null;
}

const UpdateInventory: React.FC = () => {
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchInventoryItem = async () => {
      try {
        const response = await axios.get<InventoryItem>(`http://localhost:8000/api/inventory/${id}`);
        const item = response.data;
        setInventoryItem(item);

        form.setFieldsValue({
          item_name: item.item_name,
          quantity: item.quantity,
          warehouse_location: item.warehouse_location,
          stored_date: dayjs(item.stored_date),
          expiration_date: item.expiration_date ? dayjs(item.expiration_date) : null
        });
      } catch (error: any) {
        notification.error({
          message: "Failed to fetch item data!",
          description: error.response?.data?.message || error.message
        });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInventoryItem();
  }, [id, form]);

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    try {
      const updatedData: InventoryItem = {
        item_name: values.item_name,
        quantity: values.quantity,
        warehouse_location: values.warehouse_location,
        stored_date: values.stored_date.format("YYYY-MM-DD"),
        expiration_date: values.expiration_date
          ? values.expiration_date.format("YYYY-MM-DD")
          : null
      };

      await axios.put(
        `http://localhost:8000/api/inventory/${id}`,
        updatedData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      notification.success({
        message: "Item updated successfully!",
        duration: 2
      });

      setTimeout(() => navigate("/inventory"), 1000);
    } catch (error: any) {
      notification.error({
        message: "Failed to update item!",
        description: error.response?.data?.message || error.message,
        duration: 3
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Update Inventory Item</h1>
        <Form
          form={form}
          onFinish={onFinish}
          layout="vertical"
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Item Name"
              name="item_name"
              rules={[{ required: true, message: "Please enter the item name!" }]}
              className="mb-0"
            >
              <Input 
                placeholder="Enter item name" 
                className="w-full p-2"
              />
            </Form.Item>

            <Form.Item
              label="Quantity"
              name="quantity"
              rules={[{ required: true, message: "Please enter the quantity!" }]}
              className="mb-0"
            >
              <Input 
                type="number" 
                min={0} 
                placeholder="Enter quantity" 
                className="w-full p-2"
              />
            </Form.Item>

            <Form.Item
              label="Warehouse Location"
              name="warehouse_location"
              rules={[{ required: true, message: "Please enter the warehouse location!" }]}
              className="mb-0"
            >
              <Input 
                placeholder="Enter location" 
                className="w-full p-2"
              />
            </Form.Item>

            <Form.Item
              label="Stored Date"
              name="stored_date"
              rules={[{ required: true, message: "Please select the stored date!" }]}
              className="mb-0"
            >
              <DatePicker 
                className="w-full p-2" 
                format="YYYY-MM-DD"
              />
            </Form.Item>

            <Form.Item
              label="Expiration Date"
              name="expiration_date"
              className="md:col-span-2 mb-0"
            >
              <DatePicker 
                className="w-full p-2" 
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </div>

          <Form.Item className="pt-2">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading} 
              size="large"
              className="w-full bg-green-600 hover:bg-green-700 focus:bg-green-700 border-none"
            >
              Update Item
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default UpdateInventory;