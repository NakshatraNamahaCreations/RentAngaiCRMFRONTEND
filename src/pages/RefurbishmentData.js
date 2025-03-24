import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Search,
  Inject,
  Toolbar,
  Edit,
  Sort,
} from "@syncfusion/ej2-react-grids";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { ApiURL } from "../path";
import { Header } from "../components";
import moment from "moment";

const RefurbishmentData = () => {
  const [showAddRefurbishment, setShowAddRefurbishment] = useState(false);
  const [products, setProducts] = useState([]);
  const [productData, setProductData] = useState([]);
  const [shippingAddress, setShippingAddress] = useState("");
  const [floorManager, setFloorManager] = useState("");
  const [refurbishmentData, setRefurbishmentData] = useState([]);

  useEffect(() => {
    fetchRefurbishment();
    fetchProducts();
  }, []);

  const fetchRefurbishment = async () => {
    try {
      const res = await axios.get(`${ApiURL}/refurbishment/getRefurbishment`);
      if (res.status === 200) {
        setRefurbishmentData(res.data.RefurbishmentData);
      }
    } catch (error) {
      console.error("Error fetching Refurbishment:", error);
      toast.error("Failed to fetch Refurbishment");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/quoteproducts`);
      if (res.status === 200) {
        setProductData(res.data.QuoteProduct);
      }
    } catch (error) {
      console.error("Error fetching Products:", error);
      toast.error("Failed to fetch Products");
    }
  };

  const handleProductChange = (index, event) => {
    const { name, value } = event.target;
    const updatedProducts = [...products];
    updatedProducts[index][name] = value;
    setProducts(updatedProducts);
  };

  const addProduct = () => {
    setProducts([...products, { productName: "", quantity: "", price: "", damageDetails: "" }]);
  };

  const removeProduct = (index) => {
    const updatedProducts = [...products];
    updatedProducts.splice(index, 1);
    setProducts(updatedProducts);
  };

  const postRefurbishment = async (e) => {
    e.preventDefault();
    if (!products.length || !shippingAddress || !floorManager) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = {
      products,
      shippingAddress,
      floorManager,
    };

    try {
      const response = await axios.post(
        `${ApiURL}/refurbishment/addRefurbishment`,
        data
      );
      if (response.status === 201) {
        toast.success("Refurbishment added successfully");
        setShowAddRefurbishment(false);
        fetchRefurbishment();
        resetForm();
      }
    } catch (error) {
      console.error("Error adding refurbishment:", error);
      toast.error("Failed to add refurbishment");
    }
  };

  const resetForm = () => {
    setProducts([{ productName: "", quantity: "", price: "", damageDetails: "" }]);
    setShippingAddress("");
    setFloorManager("");
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <Header category="Page" title="Refurbishment" />

      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowAddRefurbishment(true)}
          className="px-5 py-2.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          Add Refurbishment
        </button>
      </div>

      {showAddRefurbishment && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Refurbishment</h2>
              <button
                onClick={() => setShowAddRefurbishment(false)}
                className="text-gray-900 bg-white border p-2 rounded-lg hover:bg-gray-100"
              >
                &#x2715;
              </button>
            </div>

            <form onSubmit={postRefurbishment}>
              <div className="mb-4">
                <h3 className="font-semibold">Products</h3>
                {products.map((product, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <select
                      name="productName"
                      value={product.productName}
                      onChange={(e) => handleProductChange(index, e)}
                      className="p-2 border rounded w-full"
                      required
                    >
                      <option value="">Select Product</option>
                      {productData.map((item) => (
                        <option key={item._id} value={item.ProductName}>
                          {item.ProductName}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      name="quantity"
                      value={product.quantity}
                      onChange={(e) => handleProductChange(index, e)}
                      placeholder="Quantity"
                      className="p-2 border rounded w-full"
                      required
                    />

                    <input
                      type="number"
                      name="price"
                      value={product.price}
                      onChange={(e) => handleProductChange(index, e)}
                      placeholder="Price"
                      className="p-2 border rounded w-full"
                      required
                    />

                    <input
                      type="text"
                      name="damageDetails"
                      value={product.damageDetails}
                      onChange={(e) => handleProductChange(index, e)}
                      placeholder="Damage Details"
                      className="p-2 border rounded w-full"
                    />

                    {products.length > 1 && (
                      <button type="button" onClick={() => removeProduct(index)} className="text-red-500">
                        ❌
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" onClick={addProduct} className="text-blue-500">
                  + Add Another Product
                </button>
              </div>

              <div className="mb-4">
                <label className="block font-semibold">Shipping Address</label>
                <input
                  type="text"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter Shipping Address"
                  className="p-2 border rounded w-full"
                  required
                />
              </div>

             

              <div className="mb-4">
                <label className="block font-semibold">Floor Manager</label>
                <input
                  type="text"
                  value={floorManager}
                  onChange={(e) => setFloorManager(e.target.value)}
                  placeholder="Enter Floor Manager Name"
                  className="p-2 border rounded w-full"
                  required
                />
              </div>

              <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600">
                Submit Refurbishment
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefurbishmentData;
