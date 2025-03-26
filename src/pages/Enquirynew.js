import React, { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { addDays } from "date-fns";
import DatePicker from "react-datepicker";
import axios from "axios";
import { ApiURL } from "../path";
import { FaEdit, FaSearch } from "react-icons/fa";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Modal from "react-modal";
import { SelectPicker, VStack } from "rsuite";
import toast from "react-hot-toast";

const Enquirynew = () => {

  
  const [isOpen, setIsOpen] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const location = useLocation();
  const data = location.state || {};
  const enquiryId = location.state?.enquiryId;
  console.log(enquiryId); // Logs the passed data
  const [enquiryData, setEnquiryData] = useState([]);
  // console.log("enquiryData", enquiryData);
  const [editproduct, setEditproduct] = useState({});
  const [grandTotal, setGrandTotal] = useState(0);
  console.log(editproduct, "editproductname");
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
//   console.log(enquirydata, "sripgirew");

  const eledata = enquirydata.find((el) => el._id === enquiryId);

  const orders = async () => {
    try {
    } catch (error) {
      console.log();
    }
  };

  // Invoice Genrate
  const enquiry = enquirydata[0];
  console.log(enquiry?.status,"ddata")
  const navigate = useNavigate();
  const[FilteredProducts,setFilteredProducts]= useState([])
//   console.log(FilteredProducts,"FilteredProducts")

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedDates, setSelectedDates] = useState([null, null]);
  const [numberOfDays, setNumberOfDays] = useState(0);

  // ✅ Fix: Update state correctly when date range is selected
  const handleDateChange = (dates) => {
    setSelectedDates(dates);

    if (dates[0] && dates[1]) {
      const start = dates[0];
      const end = dates[1];
      const difference =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      setNumberOfDays(difference);
    }
  };

  // ✅ Fix: Ensure confirmation only works when a valid range is selected
  const handleConfirm = () => {
    if (selectedDates[0] && selectedDates[1]) {
      navigate("/"); // ✅ Redirect after selection
      calendarClose(); // ✅ Close calendar modal
    } else {
      alert("Please select a complete date range first.");
    }
  };

  // const [value, onChange] = useState(new Date());

  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  ]);
  const [productData, setProductData] = useState([]);
  const [confirmedProducts, setConfirmedProducts] = useState([]);

console.log(confirmedProducts,"confirmedProducts")

const handleConfirmProduct = (product) => {
  const enquiryProduct = enquirydata
    ?.flatMap((enquiry) => enquiry.products)
    .find((p) => p.productId === product.productId);

  if (!enquiryProduct) return; 

  const orderQuantity = enquiryProduct.quantity; 
  const availableStock = product.availableStock; 


  const finalQuantity = Math.min(orderQuantity, availableStock);

  const existingProductIndex = confirmedProducts.findIndex(
    (p) => p.productId === product.productId
  );

  if (existingProductIndex !== -1) {
    alert("This product is already confirmed!");
    return;
  }

  if (finalQuantity > 0) {
    // Update confirmedProducts array
    const totalPrice = product.price * finalQuantity;
    setConfirmedProducts((prev) => [
      ...prev,
      { ...product, confirmedQuantity: finalQuantity,   total: totalPrice  },
    ]);
    // Update grand total
    setGrandTotal((prevTotal) => prevTotal + totalPrice);

    // Reduce availableStock in the filteredProducts state
    setFilteredProducts((prevProducts) =>
      prevProducts.map((p) =>
        p.productId === product.productId
          ? { ...p, availableStock: p.availableStock - finalQuantity }
          : p
      )
    );
  }
};

  
//   console.log(confirmedProducts, "confirmedProducts");
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

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = FilteredProducts.filter((product) =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const timeSlots = [
    "Slot:1 7:00 PM - 11:00 PM",
    "Slot:2 11:00 PM - 11:45 PM",
    "Slot:3 7:00 AM - 4:00 AM",
  ];

  const fetchFilteredInventory = async () => {
    const enquiry = enquirydata[0];
    try {
      const response = await axios.get("http://localhost:8000/api/inventory/filter", {
        params: {
          startDate: enquiry.enquiryDate,  // ✅ Using correct field
          endDate: enquiry.endDate,        // ✅ Using correct field
          slot: enquiry.enquiryTime,       // ✅ Using correct field
          products: enquiry.products.map(p => p.productId).join(","), // ✅ Fixing product selection
        },
      });
  
      setFilteredProducts(response.data.stock);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    //   alert("Failed to fetch inventory. Please try again.");
    }
  };
  

  useEffect(()=>{
    fetchFilteredInventory()
 },[enquiry])

      
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

console.log(selectedProductDetails1,"selectedProductDetails1")

     const handleQuantityChange1 = (newQuantity) => {
      const validQuantity = Math.max(0, Math.min(newQuantity, selectedProductDetails1.StockAvailable));
      if (newQuantity > selectedProductDetails1.StockAvailable) {
        alert(`Only ${selectedProductDetails1.StockAvailable} items available.`);
        return;
      }
      setSelectedProductDetails1((prev) => ({
        ...prev,
        quantity: validQuantity,
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
            // price: selectedProductDetails1?.price,
            price: Number(selectedProductDetails1?.price),
            StockAvailable: Number(selectedProductDetails1?.StockAvailable),
        quantity: Number(selectedProductDetails1?.quantity),
       
            // StockAvailable: selectedProductDetails1?.StockAvailable,
            // quantity: selectedProductDetails1?.quantity,
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
          const response = await axios.put(
            `http://localhost:8000/api/Enquiry/updatestatus/${_id}`, 
            {
              status, 
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

    const handleSubmitQuotations = async (e) => {
      e.preventDefault();
      const enquiry = enquirydata[0];
    
      if (!enquiry) {
        toast.error("No enquiry data available to generate the quotation.");
        return;
      }
    
      if (confirmedProducts.length === 0) {
        toast.error("No products confirmed for the quotation.");
        return;
      }
    
      try {
        const quotationData = {
          clientName: enquiry?.clientName,
          executivename: enquiry?.executivename,
          clientId: enquiry?.clientId,
          Products: confirmedProducts.map((product) => ({
            productId: product.productId,
            productName: product.productName,
            price: Number(product.price) || 0,
            quantity: product.confirmedQuantity,
            total: Number(product.total) || 0,
            StockAvailable: product.StockAvailable || 0,
          })), // ✅ Send only confirmed products
          adjustments: enquiry?.adjustments || 0,
          GrandTotal: confirmedProducts.reduce((sum, product) => sum + product.total, 0), 
          GST: enquiry?.GST || 0,
          clientNo: enquiry?.clientNo,
          address: enquiry?.address,
          quoteDate: enquiry?.enquiryDate,
          endDate: enquiry?.endDate,
          quoteTime: enquiry?.enquiryTime,
          discount: enquiry?.discount || 0,
          placeaddress: enquiry?.placeaddress,
          slots: [
            {
              slotName: enquiry?.enquiryTime,
              Products: confirmedProducts.map((product) => ({
                productId: product.productId,
                productName: product.productName,
                price: Number(product.price) || 0,
                quantity: product.confirmedQuantity,
                total: Number(product.total) || 0,
                StockAvailable: product.StockAvailable || 0,
              })), 
              quoteDate: enquiry?.enquiryDate,
              endDate: enquiry?.endDate,
            },
          ],
        };
    
        const response = await axios.post(`${ApiURL}/quotations/createQuotation`, quotationData, {
          headers: { "content-type": "application/json" },
        });
    
        if (response.status === 200) {
          await updateStatus({
            _id: enquiry._id,
            orderStatus: "send",  // ✅ Change status to "sent"
          });
    
          toast.success("Quotation Created Successfully!");
          navigate("/quotations");  // ✅ Redirect to quotations page
        }
      } catch (error) {
        console.error("Error creating quotation:", error);
    
        if (error.response) {
          toast.error(error.response.data.error || "Error creating quotation.");
        } else {
          toast.error("An error occurred. Please try again later.");
        }
      }
    };
    
    // update quantity API
      const [quantity, setQuantity] = useState(0);
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

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">Furniture Rental</h1>

     
      {/* <div className="my-4 border-b pb-3">
        <h2 className="text-lg font-semibold">Select Multiple Dates:</h2>
        <DatePicker
          selected={selectedDates[0]}
          onChange={handleDateChange}
          startDate={selectedDates[0]}
          endDate={selectedDates[1]}
          selectsRange
          inline
          showYearDropdown
          scrollableYearDropdown
          yearDropdownItemNumber={10}
          minDate={new Date()} // Prevent selecting past dates
          maxDate={new Date(2035, 11, 31)} // Limit date selection
          calendarClassName="custom-calendar"
        />

        <div className="mt-4">
          <h2 className="text-lg font-semibold">Selected Date </h2>
          {selectedDates[0] && selectedDates[1] ? (
            <p>{`${moment(selectedDates[0]).format('DD-MM-YYYY')} : ${moment(selectedDates[1]).format('DD-MM-YYYY')} (${numberOfDays} days)`}</p>
          ) : (
            <p className="text-gray-500">No date selected</p>
          )}
        </div>

       
      </div> */}

      {/* 📌 Search Bar */}
      <div style={{display:'flex',justifyContent:"space-between"}}>
      
      <div className="flex space-x-2 mt-4">
        {/* {timeSlots.map((slot) => ( */}
          <button
            // key={slot}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition ${
                enquiry?.enquiryTime === enquiry?.enquiryTime ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
            // onClick={() => setSelectedTime(slot)}
          >
            {enquiry?.enquiryTime}
          </button>
        {/* ))} */}
      </div>
      </div>

      {/* 📌 Product Listing */}
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

                          {/* <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Grand Total
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.GrandTotal}
                            
                            </td>
                          </tr> */}
                          <tr>
                            {/* <td className="p-2 text-center border-b border-gray-200">
                              Status
                            </td> */}
                            {/* <td className="p-2 border-b border-gray-200">
                              <span
                                style={{
                                  color:
                                    ele?.status === "send" ? "green" : "red",
                                }}
                              >
                                {" "}
                              
                                {ele?.status === "send" ? "Sent" : ele?.status}
                              </span>
                            </td> */}
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
                         <td className="p-2 flex items-center space-x-2">
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
                             
                              />
                            </button> 
                             {/* 
                            <button
                              onClick={() =>
                                handleDeleteProduct(product?.productId)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <FaTrash size={18} />
                            </button> */}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {enquiry && enquiry?.status !== "send" && (
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
  )}
                {/* <button
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
                </button> */}
              </div>
              </div>
      <div className="mt-6">
        {/* <h2 className="text-lg font-semibold">Available Products:</h2> */}
        <div className="my-4 flex items-center border border-gray-300 rounded-md px-3 py-2 w-[300px]" style={{background:"white"}}>
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="mt-4 space-y-4">
    {filteredProducts?.map((theater, index) => {
      // Find the enquiry quantity for this product
      const enquiryProduct = enquirydata?.flatMap((enquiry) => enquiry.products)
        .find((product) => product.productId === theater.productId);

      return (
        <div
          key={index}
          className="border p-4 rounded-lg bg-white shadow-md"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          {/* Product Name */}
          <h2 className="font-semibold text-lg mb-2" style={{ width: "300px" }}>
            {theater.productName}
          </h2>

          {/* Stock Information */}
          <div style={{ display: "flex", gap: "35px" }}>
            {/* Show Enquiry Quantity */}
            <div className="flex space-x-2">
              <button className="px-3 py-1.5 border rounded-md bg-gray-100 hover:bg-gray-200">
                Order Quantity: {enquiryProduct ? enquiryProduct.quantity : 0}
              </button>
            </div>

            <div className="flex space-x-2">
              <button className="px-3 py-1.5 border rounded-md bg-gray-100 hover:bg-gray-200">
                Available Stock: {theater.availableStock}
              </button>
            </div>
           

           
          </div>

          {/* Add to Slot Button */}
          <div className="mt-2">
          {confirmedProducts.some((p) => p.productId === theater.productId) ? (
  <button className="px-4 py-2 rounded-md bg-green-600 text-white" disabled>
    Confirmed
  </button>
) : enquiryProduct && enquiryProduct.quantity <= theater.availableStock ? (
  <button
    className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
    onClick={() => handleConfirmProduct(theater)}
  >
    Confirm
  </button>
) : (
  <button
    className="px-4 py-2 rounded-md bg-gray-400 text-white cursor-not-allowed"
    disabled
  >
    Confirm
  </button>
)}

            {/* {confirmedProducts.some((p) => p.productId === theater.productId) ? (
              <button
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
                disabled
              >
                Confirmed
              </button>
            ) : (
              <button
                className={`px-4 py-2 rounded-md text-white ${
                  theater.availableStock > 0 ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                }`}
                disabled={theater.availableStock === 0}
                onClick={() => handleConfirmProduct(theater)}
              >
                Confirm
              </button>
            )} */}
          </div>

          
        </div>
      );
    })}
  </div>
  <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-md" style={{width:"200px"}}>
  <h2 className="text-xl font-semibold text-gray-800">Total Amount</h2>
  <p className="text-lg font-bold text-gray-900">₹ {grandTotal}</p>
</div>
  <div className="flex justify-end mt-4">
  <div className="flex justify-end mt-4">
  {enquiry && enquiry?.status !== "send" && (
    <button
      onClick={handleSubmitQuotations}
      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
    >
      Confirm Quotation
    </button>
  )}
</div>

       
      </div>
{/* enventory data */}
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
{/* Update Quantity modal */}
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
      </div>
    </div>
  );
};

export default Enquirynew;
