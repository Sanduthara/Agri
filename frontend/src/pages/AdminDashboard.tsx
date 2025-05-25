import React, { useEffect, useState } from 'react';
// import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { Package, TrendingUp, AlertCircle, Plus, Search } from 'lucide-react';
import { ProductModal } from '../components/ProductModal';
import { Product } from '../types';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoImg from '../assets/image.png';

const AdminDashboard = () => {
  // const { user } = useAuthStore();
  const { products, fetchProducts, addProduct, updateProduct, deleteProduct } = useProductStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<Product | undefined>();
  const [totalSales, setTotalSales] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchTotalSales();
  }, [fetchProducts]);

  // Add new useEffect for low stock notification
  useEffect(() => {
    if (products.length > 0) {
      const lowStockProducts = products.filter(p => p.quantity < 100);
      if (lowStockProducts.length > 0) {
        // Show toast notification for low stock products
        toast.custom((t) => (
          <div
            className={`${t.visible ? 'animate-enter' : 'animate-leave'
              } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <AlertCircle className="h-10 w-10 text-yellow-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Low Stock Alert!
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} {lowStockProducts.length > 1 ? 'are' : 'is'} running low on stock.
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    {lowStockProducts.slice(0, 3).map(product => (
                      <div key={product.id} className="flex justify-between">
                        <span>{product.name}</span>
                        <span className="font-medium">{product.quantity} kg</span>
                      </div>
                    ))}
                    {lowStockProducts.length > 3 && (
                      <p className="mt-1 text-gray-600">...and {lowStockProducts.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        ), {
          duration: 10000, // Show for 10 seconds
          position: 'top-right',
        });
      }
    }
  }, [products]);

  const fetchTotalSales = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/orders/total-amount');
      const data = await response.json();
      setTotalSales(data?.totalAmount ?? 1);
    } catch (error) {
      console.error('Error fetching total sales:', error);
      toast.error('Failed to load total sales data');
    }
  };

  const handleAddProduct = async (productData: Partial<Product>, imageFile?: File) => {
    try {
      const formData = new FormData();

      // Append all product fields to FormData
      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key as keyof Product] as string);
      });

      // Append the image file if it exists
      if (imageFile) {
        formData.append('productImage', imageFile);
      } else {
        // If no image is uploaded, send a default image URL
        formData.append('image', '/uploads/products/default-product-image.jpg');
      }

      // Send the request to the backend
      const response = await fetch('http://localhost:8000/api/products', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to add product');
      }

      const newProduct = await response.json();

      // Immediately update the UI with the new product
      addProduct(newProduct);

      // Clear selectedProduct to reset the modal form
      setSelectedProduct(undefined);

      // Close the modal
      setIsModalOpen(false);

      // Show success message
      toast.success('Product added successfully!');

      // Refresh the products list to ensure we have the latest data
      fetchProducts();

    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const handleEditProduct = async (productData: Partial<Product>, imageFile?: File) => {
    if (!selectedProduct) return;

    try {
      const formData = new FormData();

      // Append all product fields to FormData
      Object.keys(productData).forEach((key) => {
        formData.append(key, productData[key as keyof Product] as string);
      });

      // Append the image file if it exists
      if (imageFile) {
        formData.append('productImage', imageFile);
      }

      // Send the request to the backend
      const response = await fetch(`http://localhost:8000/api/products/${selectedProduct.id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      const updatedProduct = await response.json();

      // Immediately update the UI with the updated product
      updateProduct(updatedProduct);

      // Close the modal
      setIsModalOpen(false);

      // Show success message
      toast.success('Product updated successfully!');

      // Refresh the products list to ensure we have the latest data
      fetchProducts();

    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Call the delete function from the store
        await deleteProduct(productId);

        // Show success message
        toast.success('Product deleted successfully!');

        // Refresh the products list to ensure we have the latest data
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const lowStockProducts = products.filter(p => p.quantity < 100);

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.price.toString().includes(searchQuery) ||
    product.quantity.toString().includes(searchQuery)
  );

  // Helper to convert image URL to base64
  const toDataURL = (url: string) => new Promise<string>((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function () {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject('Canvas context not available');
      }
    };
    img.onerror = function () { reject('Image load error'); };
    img.src = url;
  });

  // Download PDF report of filtered products
  const handleDownloadPDF = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const today = new Date();
    const dateString = today.toLocaleDateString();

    // Convert logo to base64
    const logoBase64 = await toDataURL(logoImg);

    // Header with logo and company details
    doc.addImage(logoBase64, 'PNG', 14, 10, 22, 22); // x, y, width, height
    // Company details top right
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Fairtrade', pageWidth - 14, 16, { align: 'right' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Main Street, City, Country', pageWidth - 14, 22, { align: 'right' });
    doc.text('info@fairtrade.com | +1 234 567 890', pageWidth - 14, 28, { align: 'right' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    const reportTitle = searchQuery.trim() ? 'Filtered Inventory Report' : 'Full Inventory Report';
    doc.text(reportTitle, pageWidth / 2, 36, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Date: ${dateString}`, pageWidth / 2, 44, { align: 'center' });
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(14, 48, pageWidth - 14, 48);

    autoTable(doc, {
      startY: 54,
      head: [[
        'Product Name',
        'Category',
        'Quantity',
        'Price',
        'Status',
      ]],
      body: filteredProducts.map(product => [
        product.name,
        product.category,
        product.quantity + ' kg',
        'LKR' + product.price + '/kg',
        product.quantity > 100 ? 'In Stock' : 'Low Stock',
      ]),
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 3,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [41, 128, 185], // Company blue
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 11,
      },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: function (data) {
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text('Fairtrade', pageWidth / 2, pageHeight - 12, { align: 'center' });
        doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 20, pageHeight - 12, { align: 'right' });
        doc.text('© Fairtrade. All rights reserved.', 20, pageHeight - 12, { align: 'left' });
      }
    });
    doc.save('product-inventory-report.pdf');
    toast.success('PDF downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your waste products and monitor sales
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                fetchProducts();
                fetchTotalSales();
                toast.success('Dashboard refreshed!');
              }}
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1021 12.35" /></svg>
              Refresh Dashboard
            </button>
            <button
              onClick={() => {
                setSelectedProduct(undefined);
                setIsModalOpen(false);
                setTimeout(() => setIsModalOpen(true), 0); // Force remount
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <Package className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Total Products</h2>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <TrendingUp className="h-10 w-10 text-blue-600" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Total Sales</h2>
                <p className="text-2xl font-bold">LKR {totalSales.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <AlertCircle className="h-10 w-10 text-yellow-500" />
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">Low Stock Items</h2>
                <p className="text-2xl font-bold">{lowStockProducts.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Product Inventory</h3>
              <div className="flex gap-2 items-center">
                <div className="relative w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="ml-2 flex items-center px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto rounded-b-xl">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.quantity} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      LKR{product.price}/kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${product.quantity > 100
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {product.quantity > 100 ? 'In Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ProductModal
          isOpen={isModalOpen}
          key={isModalOpen + String(selectedProduct?.id || 'add')}
          onClose={() => {
            setSelectedProduct(undefined);
            setIsModalOpen(false);
          }}
          onSubmit={selectedProduct ? handleEditProduct : handleAddProduct}
          product={selectedProduct}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;