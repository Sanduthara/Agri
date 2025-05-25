// Advanced Report Dashboard with Filters, Summaries, Charts and Export

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Spin,
  Alert,
  notification,
  DatePicker,
  Button,
  Space,
} from "antd";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dayjs, { Dayjs } from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker, MonthPicker } = DatePicker;

interface InventoryItem {
  _id: string;
  item_name: string;
  quantity: number;
  warehouse_location: string;
  stored_date: string;
  expiration_date?: string;
}

interface Supplier {
  _id: string;
  supplier: string;
  contact: string;
  email: string;
  collectedAmount: number;
  deliveryCount: number;
  qualityRating: number;
  lastDeliveryDate: string;
}

const Reports: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventoryRes, suppliersRes] = await Promise.all([
        fetch("http://localhost:8000/api/inventory"),
        fetch("http://localhost:8000/api/suppliers"),
      ]);

      if (!inventoryRes.ok || !suppliersRes.ok) throw new Error("Failed to fetch data");

      setInventory(await inventoryRes.json());
      setSuppliers(await suppliersRes.json());
      setError("");
    } catch {
      setError("Failed to fetch report data.");
    } finally {
      setLoading(false);
    }
  };

  const filterByDate = (date: string, type: 'stored' | 'delivered') => {
    if (!selectedDateRange) return true;
    const dateObj = dayjs(date);
    return dateObj.isSameOrAfter(selectedDateRange[0]) && dateObj.isSameOrBefore(selectedDateRange[1]);
  };

  const filteredInventory = inventory.filter(item => filterByDate(item.stored_date, 'stored'));
  const filteredSuppliers = suppliers.filter(s => filterByDate(s.lastDeliveryDate, 'delivered'));

  const totalInventoryItems = filteredInventory.length;
  const averageSupplierQuality = filteredSuppliers.length
    ? (filteredSuppliers.reduce((sum, s) => sum + s.qualityRating, 0) / filteredSuppliers.length).toFixed(1)
    : "N/A";
  const topLowStockItems = [...filteredInventory].sort((a, b) => a.quantity - b.quantity).slice(0, 5);
  const supplierDeliveriesLastMonth = filteredSuppliers.length;

  const exportToPDF = () => {
    const doc: any = new jsPDF();
    doc.setFontSize(16);
    doc.text("Inventory & Supplier Report", 14, 20);
    doc.setFontSize(12);
    doc.text(`Total Inventory Items: ${totalInventoryItems}`, 14, 30);
    doc.text(`Average Supplier Quality: ${averageSupplierQuality}`, 14, 36);
    doc.text(`Deliveries in Period: ${supplierDeliveriesLastMonth}`, 14, 42);

    autoTable(doc, {
      startY: 50,
      head: [["Item Name", "Quantity", "Warehouse Location", "Stored Date", "Expiration Date"]],
      body: filteredInventory.map(item => [
        item.item_name,
        item.quantity,
        item.warehouse_location,
        new Date(item.stored_date).toLocaleDateString(),
        item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "N/A",
      ]),
    });

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Supplier", "Contact", "Email", "Collected Amount", "Delivery Count", "Quality Rating", "Last Delivery"]],
      body: filteredSuppliers.map(sup => [
        sup.supplier,
        sup.contact,
        sup.email,
        `$${sup.collectedAmount.toFixed(2)}`,
        sup.deliveryCount,
        sup.qualityRating,
        new Date(sup.lastDeliveryDate).toLocaleDateString(),
      ]),
    });

    doc.save("Monthly_Report.pdf");
    notification.success({ message: "PDF Exported" });
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const summarySheet = XLSX.utils.aoa_to_sheet([
      ["Summary"],
      ["Total Inventory Items", totalInventoryItems],
      ["Average Supplier Quality", averageSupplierQuality],
      ["Deliveries in Period", supplierDeliveriesLastMonth],
    ]);

    const inventorySheet = XLSX.utils.json_to_sheet(filteredInventory.map(item => ({
      "Item Name": item.item_name,
      Quantity: item.quantity,
      "Warehouse Location": item.warehouse_location,
      "Stored Date": new Date(item.stored_date).toLocaleDateString(),
      "Expiration Date": item.expiration_date ? new Date(item.expiration_date).toLocaleDateString() : "N/A",
    })));

    const supplierSheet = XLSX.utils.json_to_sheet(filteredSuppliers.map(sup => ({
      Supplier: sup.supplier,
      Contact: sup.contact,
      Email: sup.email,
      "Collected Amount": `$${sup.collectedAmount.toFixed(2)}`,
      "Delivery Count": sup.deliveryCount,
      "Quality Rating": sup.qualityRating,
      "Last Delivery Date": new Date(sup.lastDeliveryDate).toLocaleDateString(),
    })));

    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    XLSX.utils.book_append_sheet(wb, inventorySheet, "Inventory");
    XLSX.utils.book_append_sheet(wb, supplierSheet, "Suppliers");
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })]), "Monthly_Report.xlsx");
    notification.success({ message: "Excel Exported" });
  };

  const chartData = filteredSuppliers.map(s => ({
    name: s.supplier,
    Quality: s.qualityRating,
    Deliveries: s.deliveryCount,
  }));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Space>
          <RangePicker onChange={(range) => range ? setSelectedDateRange(range as [Dayjs, Dayjs]) : setSelectedDateRange(null)} />
          <MonthPicker onChange={(month) => month ? setSelectedDateRange([month.startOf("month"), month.endOf("month")]) : setSelectedDateRange(null)} placeholder="Select Month" />
          <Button onClick={exportToPDF} type="primary" danger>Export PDF</Button>
          <Button onClick={exportToExcel} type="primary">Export Excel</Button>
        </Space>
      </div>

      {error && <Alert type="error" message={error} showIcon className="mb-4" />}
      {loading ? <Spin size="large" className="block mx-auto" /> : (
        <>
          <Row gutter={16} className="mb-6">
            <Col span={6}><Card><h2>{totalInventoryItems}</h2><p>Total Inventory Items</p></Card></Col>
            <Col span={6}><Card><h2>{averageSupplierQuality}</h2><p>Avg Supplier Quality</p></Card></Col>
            <Col span={6}><Card><h2>{supplierDeliveriesLastMonth}</h2><p>Deliveries in Period</p></Card></Col>
            <Col span={6}><Card><h2>Top 5</h2><p>Low Stock Items</p></Card></Col>
          </Row>

          <h2 className="text-lg font-semibold mb-2">Supplier Performance</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="Quality" fill="#8884d8" />
              <Bar dataKey="Deliveries" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <Table
            dataSource={topLowStockItems}
            columns={[{ title: "Item Name", dataIndex: "item_name" }, { title: "Quantity", dataIndex: "quantity" }]}
            rowKey="_id"
            pagination={false}
            className="my-4"
          />
        </>
      )}
    </div>
  );
};

export default Reports;
