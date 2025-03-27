import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Calendar from "rsuite/Calendar";
import "rsuite/Calendar/styles/index.css";
import moment from "moment";
import axios from "axios";
import { ApiURL } from "../path";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
import { FaEdit, FaTrash } from "react-icons/fa";
import { SelectPicker, VStack } from "rsuite";
function EnquiryDetails() {
  const [isOpen, setIsOpen] = useState(false);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [flwdata, setflwdata] = useState([]);
  const location = useLocation();
  const admin = {};
  const data = location.state || {};
  const enquiryId = location.state?.enquiryId;
  console.log(enquiryId); // Logs the passed data
  const [enquiryData, setEnquiryData] = useState([]);
  // console.log("enquiryData", enquiryData);
  const [editproduct, setEditproduct] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  // const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0);
  // const [grandTotal, setGrandTotal] = useState(0);

  console.log(editproduct, "name");
  useEffect(() => {
    fetchEnquiry();
  }, []);

  const fetchEnquiry = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Enquiry/getallEnquiry`);
      if (res.status === 200) {
        setEnquiryData(res.data.enquiryData);
      }
    } catch (error) {
      console.error("Error fetching enquiry data:", error);
    }
  };

  const enquirydata = enquiryData.filter((ele) => ele._id === enquiryId);
  console.log(enquirydata, "sripgirew");

  const eledata = enquirydata.find((el) => el._id === enquiryId);

  const orders = async () => {
    try {
    } catch (error) {
      console.log();
    }
  };

  // Invoice Genrate
  const enquiry = enquirydata[0];
  console.log(enquiry?._id, ">>>>>>>>>>>>>>");
  const TotalPrices = enquiry?.products?.reduce(
    (sum, product) => sum + Number(product.total),
    0
  );

  // Apply discount
  const discountAmount = (TotalPrices * enquiry?.discount) / 100;
  const finalPrice = TotalPrices - discountAmount - enquiry?.adjustments;

  // console.log(TotalPrices, "TotalPrices"); // Output: 6700
  // console.log(discountAmount, "DiscountAmount"); // Output: 670 (10% of 6700)
  // console.log(finalPrice, "FinalPrice"); // Output: 6030

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  const redirectToOrders = () => {
    navigate("/orders");
  };

  const updateStatus = async (data) => {
    const confirm = window.confirm(
      "Are you sure you want to update this order status?"
    );
    if (confirm) {
      try {
        const { _id, orderStatus } = data;

        if (!_id) {
          toast.error("Enquiry ID is missing");
          console.error("Enquiry ID is missing");
          return;
        }

        const status = orderStatus === "not send" ? "send" : orderStatus;

        // API call to update status
        const response = await axios.put(
          `http://localhost:8000/api/Enquiry/updatestatus/${_id}`, // Pass the ID in the URL
          {
            status, // Pass the new status in the body
          }
        );

        if (response.status === 200) {
          toast.success("Status updated successfully");
        } else {
          toast.error("Failed to update status");
        }
      } catch (error) {
        console.error("Error updating status:", error);
        toast.error("Error updating status");
      }
    }
  };
  const [ProductData, setProductData] = useState([]);
  const [Products, setProducts] = useState([]);
  const [subcategory, serSubcategory] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  console.log(subcategory, "subcategory");

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/quoteproducts`);
      if (res.status === 200) {
        setProductData(res.data.QuoteProduct);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchSubcategory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/subcategory/getappsubcat`);
      if (res.status === 200) {
        serSubcategory(res.data.subcategory);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  useEffect(() => {
    fetchProducts();
    fetchSubcategory();
  }, []);

  const { discount = 0, GST = 0 } = enquirydata[0] || {}; // Extract only required fields

  useEffect(() => {
    // Combine all calculations into one useEffect to ensure consistency
    let total = Products.reduce(
      (sum, product) => sum + (Number(product.total) || 0),
      0
    );

    let adjustedTotal = total;
    if (GST) {
      const GSTAmt = Number(GST * adjustedTotal);
      adjustedTotal += GSTAmt;
    }
    if (discount) {
      const discountPercentage = Number(discount) / 100;
      const discountAmount = adjustedTotal * discountPercentage;
      adjustedTotal -= discountAmount; // Subtract discount amount from total
    }

    // Subtract adjustment
    adjustedTotal -= adjustment;

    // Ensure adjusted total is not negative
    adjustedTotal = Math.max(0, adjustedTotal);

    // Set the grand total
    setGrandTotal(adjustedTotal);
  }, [Products, GST, adjustment, discount]); // Dependencies include fields dynamically extracted

  // Handle subcategory selection
  const handleSubcategorySelection = (e) => {
    const subcategory = e.target.value;
    setSelectedSubcategory(subcategory);

    console.log("ProductData---", ProductData);
    // Filter products based on the selected subcategory
    const filtered = ProductData?.filter(
      (product) => product.ProductSubcategory === subcategory.trim()
    );

    console.log("filtered produts", filtered);
    setFilteredProducts(filtered);
  };

  const handleProductSelection = (selectedValues) => {
    const updatedProducts = selectedValues.map((productId) => {
      const existingProduct = Products.find(
        (prod) => prod.productId === productId
      );
      if (existingProduct) {
        return existingProduct;
      }

      const productDetails = ProductData.find((prod) => prod._id === productId);
      return {
        productId,
        productName: productDetails.ProductName,
        price: productDetails.ProductPrice || 0,
        quantity: 1,
        total: productDetails.ProductPrice || 0,
        StockAvailable: productDetails?.StockAvailable || 0,
      };
    });

    setProducts(updatedProducts);
  };
  const handleQuantityChange = (productId, newQuantity) => {
    const updatedProducts = Products.map((product) => {
      if (product.productId === productId) {
        const newTotal = product.price * newQuantity;
        return { ...product, quantity: newQuantity, total: newTotal };
      }
      return product;
    });

    setProducts(updatedProducts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Products) {
      alert("Please enter all fields");
    } else {
      try {
        const config = {
          url: "/Enquiry/add-products",
          method: "post",
          baseURL: ApiURL,
          headers: { "content-type": "application/json" },
          data: {
            id: enquiry.enquiryId,
            products: Products,
            adjustments: adjustment,
            GrandTotal: grandTotal,
          },
        };
        await axios(config).then(function (response) {
          if (response.status === 200) {
            toast.success("Product Created Successfully ");
            window.location.reload();
          }
        });
      } catch (error) {
        console.error(error);

        if (error.response) {
          alert(error.response.data.error); // Display error message from the API response
        } else {
          alert("An error occurred. Please try again later.");
        }
      }
    }
  };

  // quotations

  const handleSubmitQuotations = async (e) => {
    e.preventDefault();
    const enquiry = enquirydata[0];

    if (!enquiry) {
      setResponseMessage("No enquiry data available to generate the order");
      setLoading(false);
      return;
    }

    try {
      const config = {
        url: "/quotations/createQuotation",
        method: "post",
        baseURL: ApiURL,
        headers: { "content-type": "application/json" },
        data: {
          clientName: enquiry?.clientName,
          executivename: enquiry?.executivename,
          clientId: enquiry?.clientId,
          Products: enquiry?.products,
          adjustments: enquiry?.adjustments,
          GrandTotal: enquiry?.GrandTotal,
          GST: enquiry?.GST,
          clientNo: enquiry?.clientNo,
          address: enquiry?.address,
          quoteDate: enquiry?.enquiryDate,
          endDate: enquiry?.endDate,
          quoteTime: enquiry?.enquiryTime,
          discount: enquiry?.discount,
          placeaddress: enquiry?.placeaddress,
          slots: [
            {
              slotName: enquiry?.enquiryTime,
              Products: enquiry?.products,
              quoteDate: enquiry?.enquiryDate,
              endDate: enquiry?.endDate,
            },
          ],
        },
      };

      const response = await axios(config);

      if (response.status === 200) {
        await updateStatus({
          _id: enquiry._id,
          orderStatus: "send",
        });

        toast.success("Quotation Created Successfully");
        setResponseMessage(response.data.message);
        navigate("/quotations");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error creating quotation:", error);

      if (error.response) {
        alert(error.response.data.error || "Error creating quotation");
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  // Update the status of the enquiry
  const [edit, setEdit] = useState({});
  // console.log(edit,"Update ke liye")
  const [upgst, setUpgst] = useState(enquiry?.GST);
  const [upgrandtotal, setUpgrandtotal] = useState(0);
  const [updiscount, setUpdiscount] = useState(enquiry?.discount);
  const [upadjustments, setUpadjustments] = useState(enquiry?.adjustments);

  useEffect(() => {
    // Perform all calculations in one effect for consistency
    let adjustedTotal = enquiry?.GrandTotal;

    // Apply GST
    if (upgst) {
      const GSTAmt = Number(upgst * adjustedTotal);
      adjustedTotal += GSTAmt;
    }

    // Apply discount (percentage)
    if (updiscount) {
      const discountPercentage = Number(updiscount) / 100;
      const discountAmount = adjustedTotal * discountPercentage;
      adjustedTotal -= discountAmount;
    }

    // Subtract adjustments
    if (upadjustments) {
      adjustedTotal -= upadjustments;
    }

    // Ensure the adjusted total is non-negative
    adjustedTotal = Math.max(0, adjustedTotal);

    // Update the grand total state
    setUpgrandtotal(adjustedTotal);
  }, [upgst, updiscount, upadjustments]);

  const handleUpdateQuantity = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/Enquiry/update-product-data/${enquiryId}`,
        { productId: editproduct?.productId, quantity }
      );

      if (response.status === 200) {
        toast.success("Product quantity updated successfully!");
        setModalIsOpen(false);
        fetchEnquiry();
      }
    } catch (err) {
      toast.error("Failed to update product quantity");
      console.error("Error updating quantity:", err);
    }
  };

  console.log(enquiry?._id, "enquiry?._id");
  // Product api with inventory management
  const [productinventory, setProductinventory] = useState([]);
  // console.log(productinventory, "productinventory");
  const fetchProductsWithInventory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/products-with-inventory`);
      if (res.status === 200) {
        setProductinventory(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProductsWithInventory();
  }, []);

  const formattedProducts = productinventory.map((product) => ({
    label: product.ProductName,
    value: product._id,
  }));
  const [selectedProductDetails1, setSelectedProductDetails1] = useState({
    productId: null,
    productName: "",
    price: 0,
    StockAvailable: 0,
    quantity: 1,
    total: 0,
    availableQty: 0,
  });

  console.log(
    selectedProductDetails1?.productId,
    selectedProductDetails1,
    "selectedProductDetails1"
  );

  // const handleQuantityChange1 = (newQuantity) => {
  //   setSelectedProductDetails1((prev) => ({
  //     ...prev,
  //     quantity: newQuantity,
  //     total: prev.price * newQuantity,
  //   }));
  // };

  const handleQuantityChange1 = (newQuantity) => {
    if (newQuantity > selectedProductDetails1.StockAvailable) {
      alert(`Only ${selectedProductDetails1.StockAvailable} items available.`);
      return;
    }

    setSelectedProductDetails1((prev) => ({
      ...prev,
      quantity: newQuantity,
      total: prev.price * newQuantity,
    }));
  };
  const handleProductSelection2 = (productId) => {
    console.log("productId", productId);

    // Find the product in the database using `_id`
    const selectedProduct = productinventory.find(
      (product) => product._id === productId
    );

    if (selectedProduct) {
      console.log("Selected Product:", selectedProduct);
      // Update state with the selected product's details
      setSelectedProductDetails1({
        productId: selectedProduct._id, // Use `_id` as `productId`
        productName: selectedProduct.ProductName, // Correct property
        price: Number(selectedProduct.ProductPrice) || 0, // Ensure price is a number
        StockAvailable: Number(selectedProduct.ProductStock) || 0,
        quantity: 1, // Default quantity
        total: (Number(selectedProduct.ProductPrice) || 0) * 1,
        availableQty: Number(selectedProduct.availableQty) || 0,
        // totalAvailableQty, // Use calculated `totalAvailableQty`
      });
    } else {
      console.error("Selected product not found in ProductData.");
    }
  };

  const handleAddnewproduct = async () => {
    try {
      const response = await axios.put(
        `http://localhost:8000/api/Enquiry/add/${enquiry?._id}`,
        {
          productId: selectedProductDetails1?.productId,
          productName: selectedProductDetails1?.productName,
          price: selectedProductDetails1?.price,
          StockAvailable: selectedProductDetails1?.StockAvailable,
          quantity: selectedProductDetails1?.quantity,
        }
      );

      if (response.status === 200) {
        toast.success("Product added successfully!");
        setIsOpen(false);
        fetchEnquiry();
        fetchProductsWithInventory()
        productinventory();
        setSelectedProductDetails1({
          productId: null,
          productName: "",
          price: 0,
          StockAvailable: 0,
          quantity: 1,
          total: 0,
          availableQty: 0,
        });
      }
    } catch (err) {
      toast.error("Failed to add product.");
      console.error("Error adding product:", err);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      toast.error("Product ID is missing!");
      return;
    }
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `http://localhost:8000/api/Enquiry/delet-product-data/${enquiryId}`,
        {
          data: { productId }, 
        }
      );

      if (response.status === 200) {
        toast.success("Product deleted successfully!");
        fetchEnquiry(); // Refresh enquiry data
      }
    } catch (err) {
      toast.error("Failed to delete product.");
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div className="p-4 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
      <div className="flex justify-center">
        <div className="w-full">
          <div className="border-b border-gray-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enquiry Detail Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Enquiry Detail</h2>
                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                  <table className="w-full text-left border border-gray-200 bg-white">
                    {enquirydata?.map((ele) => {
                      return (
                        <tbody>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Client ID
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.clientId}
                            </td>
                          </tr>

                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Enquiry Date
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.enquiryDate}
                            </td>
                          </tr>

                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Company Name
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.clientName}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Executive Name
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.executivename}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Contact
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.clientNo}{" "}
                              <a
                                href={`https://wa.me/+91${enquiryData?.mobile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <i className="fa-brands fa-whatsapp text-green-500 text-2xl"></i>
                              </a>
                            </td>
                          </tr>

                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Address
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.address}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Enquiry Time
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.enquiryTime}
                            </td>
                          </tr>

                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Grand Total
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.GrandTotal}
                              {/* {grandTotal} */}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Status
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              <span
                                style={{
                                  color:
                                    ele?.status === "send" ? "green" : "red",
                                }}
                              >
                                {" "}
                                {/* {ele?.status} */}
                                {ele?.status === "send" ? "Sent" : ele?.status}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      );
                    })}
                  </table>
                </div>
              </div>

              {/* Follow-Up Detail Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Product Details</h2>
                <table className="w-full text-left border border-gray-200 bg-white mb-4">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-2">S.No</th>
                      <th className="p-2">Product Name</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2">Price</th>
                      <th className="p-2">Total</th>
                      {/* <th className="p-2">Action</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {enquirydata?.map((enquiryItem, enquiryIndex) =>
                      enquiryItem?.products?.map((product, productIndex) => (
                        <tr
                          key={product.id}
                          className="bg-white hover:bg-gray-100"
                        >
                          <td className="p-2">{productIndex + 1}</td>
                          <td className="p-2">{product?.productName}</td>
                          <td className="p-2">{product?.quantity}</td>
                          <td className="p-2">{product?.price}</td>
                          <td className="p-2">
                            {Number(product?.price) * Number(product?.quantity)}
                          </td>
                          {/* <td className="p-2 flex items-center space-x-2">
                            <button
                              // onClick={() => handleEdit(product)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <FaEdit
                                size={18}
                                onClick={() => {
                                  setModalIsOpen(true);
                                  setEditproduct(product);
                                }}
                                //  onClick={() => setIsOpen(true)}
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteProduct(product?.productId)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash size={18} />
                            </button>
                          </td> */}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* {
                  enquiry?.status === "send" &&()
                } */}
                <button
                  className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                  // onClick={() => setIsOpen(true)}
                  onClick={() => {
                    setSelectedProductDetails1({ // Reset State when opening
                      productId: null,
                      productName: "",
                      price: 0,
                      StockAvailable: 0,
                      quantity: 1,
                      total: 0,
                      availableQty: 0,
                    });
                    setIsOpen(true);
                  }}
                >
                  Add Product
                </button>
              </div>
              {enquirydata.map((ele) => {
                return (
                  <>
                    {ele.status === "send" ? (
                      <></>
                    ) : (
                      <>
                        {/* {(!ele.GST || !ele.adjustments || !ele.discount) && ele?.hasBeenUpdated === false ? (
            <button
              onClick={() => { setModalIsOpen(true); setEdit(ele); }}
              className="bg-blue-500 text-white py-2 px-4 rounded"
              disabled={loading}
            >
              Update Enquiry
            </button>
          ) : (
            <></>
          )} */}

                        <button
                          onClick={handleSubmitQuotations}
                          className="bg-blue-500 text-white py-2 px-4 rounded"
                          disabled={loading}
                        >
                          {loading
                            ? "Loading Quotations..."
                            : "Confirm Quotations"}
                        </button>
                      </>
                    )}
                  </>
                );
              })}
      
            </div>
          </div>
        </div>
      </div>
      <div>
        <Modal
          isOpen={isOpen}
          onRequestClose={() => setIsOpen(false)}
          style={{
            overlay: {
              backgroundColor: "rgba(0, 0, 0, 0.5)",
            },
            content: {
              // width: "400px",
              height: "300px",
              margin: "auto",
              padding: "20px",
              borderRadius: "8px",
            },
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Product</h2>
          {/* <div className="flex-1">
            <label className="block text-gray-700 font-semibold mb-2">
              Sub Category <span className="text-red-500">*</span>
            </label>
            <select
              id="subcategory"
              value={selectedSubcategory}
              onChange={handleSubcategorySelection}
              className="block w-full px-3 py-2 rounded-md border focus:ring-blue-200"
            >
              <option value="">Select Sub Category</option>
              {subcategory.map((item) => (
                <option key={item._id} value={item.subcategory}>
                  {item.subcategory}
                </option>
              ))}
            </select>
          </div>
          <div style={{ paddingTop: "20px" }}>
            <label className="block text-gray-700 font-semibold mb-2">
              Select the Products <span className="text-red-500">*</span>
            </label>
            <MultiSelectComponent
              id="Products"
              dataSource={formattedProducts}
              fields={{ text: "ProductName", value: "_id" }}
              placeholder="Select Products"
              mode="Box"
              value={Products.map((p) => p.productId)}
              onChange={(e) => handleProductSelection(e.value)}
              style={{ border: "4px solid #ccc" }} // Adjust color and style as needed
              className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
              itemTemplate={(data) => (
                <div className="flex items-center">
                  <img
                    src={`http://localhost:8000/product/${data?.ProductIcon}`}
                    alt={data.ProductName}
                    className="w-8 h-8 mr-2 rounded"
                  />
                  <span>{data.ProductName}</span>
                </div>
              )}
            />
          </div>

          {Products.map((product) => (
            <div
              key={product.productId}
              className="flex  items-center gap-4 mt-2"
            >
              <span className="block text-gray-700 font-semibold mb-2 text-sm">
                {product.productName}
              </span>
              <input
                type="number"
                value={product.quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    product.productId,
                    parseInt(e.target.value)
                  )
                }
                className="border border-gray-300 rounded-md px-3 py-2 w-20  h-8 text-sm"
              />
              <span className="font-semibold text-sm">
                Total: {product.total}
              </span>
            </div>
          ))} */}

          {/* inventory */}
          <div className="mt-5">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Product Name</th>
                  <th className="px-4 py-2 border">Left Stock</th>
                  <th className="px-4 py-2 border">Quantity</th>
                  <th className="px-4 py-2 border">Price</th>
                  <th className="px-4 py-2 border">Total Price</th>
                  <th className="px-4 py-2 border">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="text-center">
                  <td>
                    <div>
                      <div>
                        <SelectPicker
                          data={formattedProducts} // Use the formatted data
                          searchable={true}
                          style={{ width: 224 }}
                          placeholder="Select product"
                          onChange={(value) => handleProductSelection2(value)}
                          multiple // Handle selection
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 border">
                    {selectedProductDetails1.availableQty ||
                      selectedProductDetails1.StockAvailable}
                  </td>
                  <td className="px-4 py-2 border">
                    <input
                      type="number"
                      value={selectedProductDetails1.quantity}
                      onChange={(e) =>
                        handleQuantityChange1(Number(e.target.value))
                      }
                      style={{ width: 150 }}
                      className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    />
                  </td>
                  <td className="px-4 py-2 border">
                    ₹{selectedProductDetails1.price || 0}
                  </td>
                  <td className="px-4 py-2 border">
                    ₹{selectedProductDetails1.total || 0}
                  </td>
                  <td>
                    <div
                      style={{ margin: "10px" }}
                      className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none"
                      // onClick={() =>
                      //   addProductToSlot1(
                      //     ontherSlots,
                      //     // Pr1,
                      //     selectedProductDetails1
                      //   )
                      // }
                      onClick={handleAddnewproduct}
                    >
                      Add
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end mt-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded-md mr-2"
            >
              Close
            </button>
            {/* <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              // onClick={handleSubmit}
              // onClick={handleAddnewproduct}
            >
              Submit
            </button> */}
          </div>
        </Modal>
      </div>

      {/* Update enquiry modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Example Modal"
        style={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          },
          content: {
            width: "50%",
            height: "auto",
            maxWidth: "500px",
            maxHeight: "30vh",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            value={editproduct?.productName}
            // onChange={(e) => setProductName(e.target.value)}
            className="w-full border bg-white border-gray-300 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quantity
          </label>
          <input
            type="number"
            defaultValue={editproduct?.quantity}
            min="1"
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full border bg-white border-gray-300 px-2 py-1.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-500"
          />
        </div>

        <button
          onClick={() => setModalIsOpen(false)}
          style={{
            padding: "10px 20px",
            margin: "10px",
            backgroundColor: "#ccc",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        {/* Update Button */}
        <button
          onClick={() => handleUpdateQuantity()}
          style={{
            padding: "10px 20px",
            margin: "10px",
            backgroundColor: "#4CAF50", // Green color
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Update
        </button>
      </Modal>

      {/* ++++ */}
    </div>
  );
}

export default EnquiryDetails;
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
  },
};
