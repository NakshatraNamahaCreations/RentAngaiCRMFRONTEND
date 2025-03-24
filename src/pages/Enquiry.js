import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Selection,
  Inject,
  Toolbar,
  Sort,
  Filter,
  Edit,
} from "@syncfusion/ej2-react-grids";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { ApiURL } from "../path";
import { Header } from "../components";
import { MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
import moment from "moment/moment";
import whatsappIcon from "../assets/images/whatsapp (1).png";
import eyeicon from "../assets/images/eye-scanner.png";
import edit from "../assets/images/pen.png";
import deleteicon from "../assets/images/delete.png";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";
import Modal from "react-modal";
import { AiOutlineSearch } from "react-icons/ai";

function Enquiry() {
  const [showAddCreateEnquiry, setShowAddCreateEnquiry] = useState(false);
  const [ClientData, setClientData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const clientID = ClientData.map((ele) => ele._id);
  // console.log(clientID, "ClientData");

  const [ProductData, setProductData] = useState([]);
  const [termsConditionData, setTermsConditionData] = useState([]);
  const [selectedTermsConditions, setSelectedTermsConditions] = useState([]);
  const [EnquiryData, setEnquiryData] = useState([]);
  const [ClientName, setClientName] = useState("");
  const [ClientId, setClientId] = useState("");

  const [Products, setProducts] = useState([]);
  console.log(Products, "Products");
  const [subcategory, serSubcategory] = useState([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

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

  // Handle product selection from MultiSelectComponent
  const handleProductSelection3 = (selectedProductIds) => {
    const selectedProducts = filteredProducts.filter((product) =>
      selectedProductIds.includes(product._id)
    );
    setProducts(selectedProducts);
  };

  // console.log(ProductData,"products")

  // console.log("Products", EnquiryData);
  const [adjustment, setAdjustment] = useState(0);
  console.log(adjustment, "adjustment");
  const [grandTotal, setGrandTotal] = useState(0);
  console.log(grandTotal, "grandTotal");
  const [discount, setDiscount] = useState(0);
  const [GST, setGST] = useState(0);
  const [ClientNo, setClientNo] = useState();
  const [Address, setAddress] = useState();
  const [enquiryDate, setEnquiryDate] = useState();
  const [endDate, setEndDate] = useState();
  const [ExecutiveName, setExecutiveName] = useState("");
  const [placeaddress, setPlaceaddress] = useState("");
  const [selectslots, setSelectslots] = useState("");

  const handleExecutiveSelection = (e) => {
    setExecutiveName(e.target.value);
  };

  const handleClientSelection = (event) => {
    const selectedClientName = event.target.value;
    const selectedClient = ClientData.find(
      (client) => client.clientName === selectedClientName
    );

    if (selectedClient) {
      setClientName(selectedClientName);
      setClientId(selectedClient._id);
      setClientNo(selectedClient.phoneNumber);
      setAddress(selectedClient.address);
    } else {
      setClientName("");
      setClientId("");
    }
  };

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchTermsAndConditions();
    fetchEnquiry();
    fetchSubcategory();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${ApiURL}/client/getallClientsNames`);
      if (res.status === 200) {
        setClientData(res.data.ClientNames);
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

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

  const fetchEnquiry = async () => {
    try {
      const res = await axios.get(`${ApiURL}/Enquiry/getallEnquiry`);
      if (res.status === 200) {
        setEnquiryData(res.data.enquiryData);
        setFilteredData(res.data.enquiryData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchTermsAndConditions = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/termscondition/allTermsandCondition`
      );
      if (res.status === 200) {
        setTermsConditionData(res.data.TermsandConditionData);
      }
    } catch (error) {
      console.error("Error fetching terms and conditions:", error);
    }
  };

  const handleProductSelection = (selectedValues) => {
    // Map over selected product IDs to create or reuse product objects
    const newSelections = selectedValues.map((productId) => {
      const existingProduct = Products.find(
        (prod) => prod.productId === productId
      );

      if (existingProduct) {
        return existingProduct; // Reuse existing product if already selected
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

    // Merge new selections with existing products, avoiding duplicates
    const updatedProducts = [
      ...Products.filter(
        (existingProduct) =>
          !newSelections.some(
            (newProduct) => newProduct.productId === existingProduct.productId
          )
      ),
      ...newSelections,
    ];

    setProducts(updatedProducts);
  };

  // const handleQuantityChange = (productId, newQuantity) => {
  //   const updatedProducts = Products.map((product) => {
  //     if (product.productId === productId) {
  //       const newTotal = product.price * newQuantity;
  //       return { ...product, quantity: newQuantity, total: newTotal };
  //     }
  //     return product;
  //   });

  //   setProducts(updatedProducts);
  // };
  const handleQuantityChange = (productId, newQuantity) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) => {
        if (product.productId === productId) {
          // Prevent exceeding stock availability
          if (newQuantity > product.StockAvailable) {
            toast.error(`Only ${product.StockAvailable} Product Available`);
            return { ...product, quantity: product.StockAvailable };
          }
          return {
            ...product,
            quantity: newQuantity,
            total: product.price * newQuantity,
          };
        }
        return product;
      })
    );
  };

  useEffect(() => {
    // Combine all calculations into one useEffect to ensure consistency
    let total = Products.reduce(
      (sum, product) => sum + (Number(product.total) || 0),
      0
    );

    let adjustedTotal = total;

    // Apply GST if applicable
    if (GST) {
      const GSTAmt = Number(GST * adjustedTotal);
      adjustedTotal += GSTAmt;
    }

    // Apply discount in percentage if applicable
    if (discount) {
      const discountPercentage = Number(discount) / 100;
      const discountAmount = adjustedTotal * discountPercentage;
      adjustedTotal -= discountAmount;
    }

    // Subtract adjustment
    adjustedTotal -= adjustment;

    // Ensure adjusted total is not negative
    adjustedTotal = Math.max(0, adjustedTotal);

    // Set the grand total
    setGrandTotal(adjustedTotal);
  }, [Products, GST, adjustment, discount]);

  const handleTermsConditionChange = (termId) => {
    const alreadySelected = selectedTermsConditions.some(
      (term) => term === termId
    );

    if (alreadySelected) {
      setSelectedTermsConditions((prev) =>
        prev.filter((term) => term !== termId)
      );
    } else {
      setSelectedTermsConditions((prev) => [...prev, termId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ClientName || !Products) {
      alert("Please enter all fields");
    } else {
      try {
        const config = {
          url: "/Enquiry/createEnquiry",
          method: "post",
          baseURL: ApiURL,
          headers: { "content-type": "application/json" },
          data: {
            clientName: ClientName,
            clientId: ClientId,
            products: Products,
            category: selectedSubcategory,
            adjustments: adjustment,
            discount: discount,
            GrandTotal: grandTotal,
            GST: GST,
            clientNo: ClientNo,
            executivename: ExecutiveName,
            address: Address,
            enquiryDate: moment(enquiryDate).format("DD-MM-YYYY"),
            endDate: moment(endDate).format("DD-MM-YYYY"),
            enquiryTime: selectslots,
            termsandCondition: selectedTermsConditions,
            placeaddress: placeaddress,
          },
        };
        await axios(config).then(function (response) {
          if (response.status === 200) {
            toast.success("Enquiry Created Successfully ");
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

  const deleteEnquiry = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/Enquiry/deleteEnquiry/${id}`
        );
        if (response.status === 200) {
          window.location.reload();
          toast.success("Successfully Deleted");
        }
      } catch (error) {
        toast.error("Enquiry Not Deleted");
        window.location.reload();
        console.error("Error deleting the Enquiry:", error);
      }
    }
  };
  const navigate = useNavigate();

  const handleNavigate = (data) => {
    navigate("/EnquiryDetails", { state: { data: data } });
  };
  // Selected company name
  const [Executives, setExecutives] = useState([]);
  //  console.log(Executives,"handleClientSelection2")
  const handleClientSelection2 = (e) => {
    const selectedClientName = e.target.value;
    setClientName(selectedClientName);

    // Find the selected company and get its executives
    const selectedClient = ClientData.find(
      (client) => client.clientName === selectedClientName
    );
    console.log(selectedClient, "selectedClient");

    if (selectedClient && selectedClient.executives) {
      setClientId(selectedClient._id);
      setAddress(selectedClient.address);
      setClientNo(selectedClient?.phoneNumber);
      setExecutives(selectedClient.executives);
    } else {
      setClientId("");
      setExecutives([]); // Clear if no executives found
    }
  };

  // sub category
  const handleClient = () => {
    navigate("/clients");
  };

  const [daysDifference, setDaysDifference] = useState(null);
  // console.log(daysDifference, "datesss");

  useEffect(() => {
    if (enquiryDate && endDate) {
      const start = new Date(enquiryDate);
      const end = new Date(endDate);

      const diffInMs = end - start;
      const diffInDays = diffInMs / (1000 * 60 * 60 * 24) + 1;

      if (diffInDays >= 1) {
        setDaysDifference(diffInDays);
      } else {
        setDaysDifference(0);
      }
    } else {
      setDaysDifference(null);
    }
  }, [enquiryDate, endDate]);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);

    if (value === "") {
      setFilteredData(EnquiryData); // ✅ Reset search
    } else {
      const filtered = EnquiryData.filter(
        (enquiry) =>
          enquiry.clientName.toLowerCase().includes(value) ||
          enquiry.executivename.toLowerCase().includes(value) ||
          enquiry.enquiryDate.toLowerCase().includes(value) ||
          enquiry.GrandTotal.toString().includes(value)
      );
      setFilteredData(filtered);
    }
  };

  //  date validation
  const handleDeliveryDateChange = (e) => {
    const newDeliveryDate = e.target.value;
    setEnquiryDate(newDeliveryDate);

    if (endDate) {
      validateDateSelection(newDeliveryDate, endDate);
    }
  };

  const handleDismantleDateChange = (e) => {
    const newDismantleDate = e.target.value;
    setEndDate(newDismantleDate);

    if (enquiryDate) {
      validateDateSelection(enquiryDate, newDismantleDate);
    }
  };

  const validateDateSelection = (delivery, dismantle) => {
    const start = new Date(delivery);
    const end = new Date(dismantle);
    const diffInDays = (end - start) / (1000 * 60 * 60 * 24); // Calculate days difference

    if (diffInDays < 0) {
      alert("Dismantle date cannot be before the delivery date.");
      setEndDate(""); // Reset invalid selection
      return;
    }

    if (diffInDays > 1) {
      alert(
        "You can only select the same or next day. 3+ days gap is not allowed."
      );
      setEndDate(""); // Reset invalid selection
      return;
    }

    // Adjust slot options based on date selection
    if (diffInDays === 0) {
      setAllowedSlots([
        "Slot 1: 7:00 AM to 11:00 PM",
        "Slot 3: 7:00 AM to 4:00 AM",
      ]);
    } else if (diffInDays === 1) {
      setAllowedSlots(["Slot 2: 11:00 PM to 11:45 PM"]);
    }
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = Products.filter(
      (product) => product.productId !== productId
    );
    setProducts(updatedProducts);
  };

  return (
    <div className="m-2 mt-6 md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      {/* Header */}
      <Header banner="Enquiry" title="Enquiry" />
      <div className="mb-3 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search..."
            className="w-72 border border-gray-300 rounded-md px-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition placeholder-gray-500"
          />
          <AiOutlineSearch className="absolute left-3 top-3 text-gray-500 text-lg" />
        </div>
        <div className="mb-3 flex gap-5 justify-end">
          <button
            onClick={() => setShowAddCreateEnquiry(true)}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
          >
            <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
              Create Enquiry
            </span>
          </button>
        </div>
      </div>

      {showAddCreateEnquiry && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full max-w-7xl max-h-7xl overflow-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold"> Create Enquiry</h2>
              <button
                onClick={() => setShowAddCreateEnquiry(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg p-2"
              >
                &#x2715;
              </button>
            </div>
            <form className="space-y-4">
              <div className="flex justify-between items-start space-x-4">
                {/* Company Name */}
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Company Name
                  </label>
                  <select
                    id="clientName"
                    value={ClientName}
                    onChange={handleClientSelection2}
                    className={`block w-full px-3 py-2 rounded-md border focus:ring-blue-200 ${
                      ClientName ? "border-blue-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Select Company Name</option>
                    {ClientData.map((item) => (
                      <option key={item._id} value={item.clientName}>
                        {item.clientName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="" style={{ marginTop: "28px" }}>
                  <a href="" onClick={handleClient}>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                      Create New Client
                    </button>
                  </a>
                </div>

                {/* Executive Name */}
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Executive Name
                  </label>
                  <select
                    value={ExecutiveName}
                    onChange={handleExecutiveSelection}
                    id="executiveName"
                    className="block w-full px-3 py-2 rounded-md border focus:ring-blue-200"
                  >
                    <option value="">Select Executive Name</option>
                    {/* Render options only if Executives is not empty */}
                    {Executives.length > 0 ? (
                      Executives.map((item, index) => (
                        <option key={index} value={item.name}>
                          {item.name}
                        </option>
                      ))
                    ) : (
                      <option disabled>No Executives Found</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-start space-x-4">
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Delivery Date
                  </label>
                  <input
                    type="date"
                    value={enquiryDate}
                    // onChange={(e) => setEnquiryDate(e.target.value)}
                    onChange={handleDeliveryDateChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-200"
                    // style={{ width: "90%" }}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Dismantal Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={handleDismantleDateChange}
                    min={enquiryDate || new Date().toISOString().split("T")[0]}
                    // onChange={(e) => setEndDate(e.target.value)}
                    // min={new Date().toISOString().split("T")[0]}
                    className="block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-200"
                    // style={{ width: "90%" }}
                  />
                </div>
              </div>

              <div
                className="flex justify-between items-start space-x-4"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Slots
                  </label>
                  <select
                    value={selectslots}
                    onChange={(e) => {
                      setSelectslots(e.target.value);
                    }}
                    id="executiveName"
                    // style={{ width: "90%" }}
                    className="block w-full px-3 py-2 rounded-md border focus:ring-blue-200"
                  >
                    <option value="">Select Slots</option>
                    {/* Render options only if Executives is not empty */}
                    {/* <option value="Slot 1: 7:00 AM to 11:00 PM">Slot 1: 7:00 AM to 11:00 PM</option>
                 <option value="Slot 2: 11:00 PM to 11:45 PM">Slot 2: 11:00 PM to 11:45 PM</option>
                 <option value="Slot 3: 7:00 AM to 4:00 AM">Slot 3: 7:00 AM to 4:00 AM</option> */}
                    <option
                      value="Slot 1: 7:00 AM to 11:00 PM"
                      disabled={
                        !(enquiryDate && endDate && enquiryDate === endDate)
                      }
                    >
                      Slot 1: 7:00 AM to 11:00 PM
                    </option>
                    <option
                      value="Slot 2: 11:00 PM to 11:45 PM"
                      disabled={
                        !(
                          enquiryDate &&
                          endDate &&
                          new Date(endDate) - new Date(enquiryDate) === 86400000
                        )
                      }
                    >
                      Slot 2: 11:00 PM to 11:45 PM
                    </option>
                    <option
                      value="Slot 3: 7:00 AM to 4:00 AM"
                      disabled={
                        !(enquiryDate && endDate && enquiryDate === endDate)
                      }
                    >
                      Slot 3: 7:00 AM to 4:00 AM
                    </option>
                    {/* <option
                      value="Slot 4: 11:00 PM to 4:00 PM"
                     
                    >
                      Slot 4: 11:00 PM to 4:00 PM
                    </option> */}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Venue Address
                  </label>
                  <textarea
                    type="text"
                    style={{ width: "100%" }}
                    value={placeaddress}
                    onChange={(e) => setPlaceaddress(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-96"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="" style={{ width: "100%" }}>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Sub Category
                  </label>
                  <select
                    id="subcategory"
                    value={selectedSubcategory}
                    onChange={handleSubcategorySelection}
                    className="block w-full px-3 py-2 rounded-md border focus:ring-blue-200"
                    style={{ width: "100%" }}
                  >
                    <option value="">Select Sub Category</option>
                    {subcategory.map((item) => (
                      <option key={item._id} value={item.subcategory}>
                        {item.subcategory}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ width: "100%" }}>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select the Products
                  </label>
                  {/* <MultiSelectComponent
                  id="Products"
                  dataSource={filteredProducts}
                  fields={{ text: "ProductName", value: "_id" }}
                  placeholder="Select Products"
                  mode="Box"
                  value={Products.map((p) => p.productId)}
                  onChange={(e) => handleProductSelection(e.value)}
                  style={{ border: "4px solid #ccc" }} // Adjust color and style as needed
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                /> */}
                  <MultiSelectComponent
                    id="Products"
                    dataSource={filteredProducts}
                    fields={{ text: "ProductName", value: "_id" }}
                    placeholder="Select Products"
                    mode="Box"
                    value={Products.map((p) => p.productId)}
                    onChange={(e) => handleProductSelection(e.value)}
                    style={{
                      width: " 50%",
                      border: "1px solid",
                      borderColor: "#e5e7eb",
                      borderRadius: "6px",
                      padding: "8px",
                    }}
                    className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                    itemTemplate={(data) => (
                      <div className="flex items-center">
                        <img
                          src={`https://api.rentangadi.in/product/${data?.ProductIcon}`}
                          alt={data.ProductName}
                          className="w-8 h-8 mr-2 rounded"
                        />
                        <span>{data.ProductName}</span>
                      </div>
                    )}
                    // valueTemplate={(selectedValue) => {
                    //   const selectedProduct = filteredProducts.find(
                    //     (p) => p._id === selectedValue
                    //   );
                    //   return (
                    //     <div className="flex items-center">
                    //       <img
                    //         src={`https://api.rentangadi.in/product/${selectedProduct?.ProductIcon}`}
                    //         // src={selectedProduct?.imageUrl}
                    //         alt={selectedProduct?.ProductName}
                    //         className="w-6 h-6 mr-2 rounded"
                    //       />
                    //       <span>{selectedProduct?.ProductName}</span>
                    //     </div>
                    //   );
                    // }}
                  />
                </div>
              </div>
              {/* {Products.map((product) => (
                <div
                  key={product.productId}
                  className="flex  items-center gap-4 mt-2"
                >
                  <img
                    src={`https://api.rentangadi.in/product/${product?.ProductIcon}`}
                    className="w-6 h-6 mr-2 rounded"
                  />
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
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Products
                </h3>
                <div className=" p-2">
                  {Products.length > 0 ? (
                    <table className="min-w-full table-auto border-collapse border border-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          {/* <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Image
                          </th> */}
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Product Name
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Stock
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Quantity
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Price
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Total
                          </th>
                          <th className="border px-4 py-2 text-left text-gray-700 font-semibold">
                            Remove
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {Products.map((product) => (
                          <tr
                            key={product.productId}
                            className="hover:bg-gray-50"
                          >
                            {/* Product Image */}
                            {/* <td className="border px-4 py-2 text-center">
                              <img
                                src={`https://api.rentangadi.in/product/${product?.ProductIcon}`}
                                className="w-10 h-10 rounded"
                                alt={product.productName}
                              />
                            </td> */}

                            {/* Product Name */}
                            <td className="border px-4 py-2 text-gray-700">
                              {product.productName || "N/A"}
                            </td>
                            <td className="border px-4 py-2 text-gray-700">
                              {product.StockAvailable || "N/A"}
                            </td>
                            {/* Quantity Input */}
                            <td className="border px-4 py-2 text-center">
                              <input
                                type="number"
                                value={product.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(
                                    product.productId,
                                    Math.max(1, parseInt(e.target.value) || 1)
                                    // parseInt(e.target.value)
                                  )
                                }
                                className="border border-gray-300 rounded-md px-2 py-1 w-20 text-center"
                              />
                            </td>
                            <td className="border px-4 py-2 text-gray-700 text-center">
                              ₹{product.price || 0}
                            </td>
                            {/* Total */}
                            <td className="border px-4 py-2 text-gray-700 text-center">
                              ₹{product.total || 0}
                            </td>
                            <td className="border px-4 py-2 text-center">
                              <button
                                onClick={() =>
                                  handleRemoveProduct(product.productId)
                                }
                                className="text-red-500 hover:text-red-700 font-bold text-lg"
                                title="Remove Product"
                              >
                                ✖
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <></>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-start space-x-2">
                {/* <div className="mt-4" style={{width:"25%"}}>
                <label className="block w-200 text-gray-700 font-semibold mb-2">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  placeholder="Discount in percentage"
                  className="border border-gray-300 rounded-md px-3 py-2"
                  style={{width:"100%"}}
                />
              </div> */}

                {/* <div className="mt-4"  style={{width:"25%"}}>
                <label className="block text-gray-700 font-semibold mb-2">
                  GST
                </label>
                <select
                  id="GST"
                  value={GST}
                  onChange={(e) => setGST(e.target.value)}
                  className={`block w-96 px-3 py-2 rounded-md focus:ring-blue-200 ${
                    ClientName ? "selected-border" : "normal-border"
                  } no-focus-ring`}
                  style={{width:"100%"}}
                >
                  <option value="">Select GST</option>

                  <option value="0.05">5%</option>

                </select>
              </div> */}
                {/* <div className="mt-4"  style={{width:"25%"}}>
                <label className="block w-200 text-gray-700 font-semibold mb-2">
                  Round off
                </label>
                <input
                  type="number"
                  value={adjustment || ""}
                  onChange={(e) => setAdjustment(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 "
                  style={{width:"100%"}}
                />
              </div> */}
                <div className="mt-4" style={{ width: "25%" }}>
                  <label className="block w-200 text-gray-700 font-semibold mb-2">
                    Grand Total <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    // value={(grandTotal*daysDifference)}
                    value={grandTotal}
                    readOnly
                    className="border border-gray-300 rounded-md px-3 py-2 "
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <div className="flex gap-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCreateEnquiry(false)}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <GridComponent
        dataSource={filteredData}
        allowPaging
        allowSorting
        editSettings={{ allowDeleting: true }}
        // toolbar={["Search"]} // Add "Search" option here
        width="auto"
      >
        <ColumnsDirective>
          <ColumnDirective field="enquiryId" headerText="S.No." />
          <ColumnDirective field="enquiryDate" headerText="Enquiry Date" />
          <ColumnDirective field="enquiryTime" headerText="Time" />
          <ColumnDirective field="createdAt" headerText="Enq Time" />
          <ColumnDirective field="clientName" headerText="Company Name" />
          <ColumnDirective field="executivename" headerText="Executive Name" />
          {/* <ColumnDirective field="GST" headerText="GST" /> */}
          {/* <ColumnDirective
            field="discount"
            headerText="Discount (In Percentage"
          /> */}
          {/* <ColumnDirective field="adjustments" headerText="Round off" /> */}
          <ColumnDirective field="GrandTotal" headerText="GrandTotal" />
          {/* <ColumnDirective field="status" headerText="Msg status" /> */}
          {/* <ColumnDirective field="status" headerText="enquiry Followup" /> */}
          <ColumnDirective
            field="status"
            headerText="Action"
            template={(data) => (
              <div className="flex gap-3">
                <button
                  // newEnquiry
                  onClick={(e) => {
                    navigate(`/newEnquiry/${data?.clientId}`, {
                      state: { enquiryId: data._id },
                    });
                  }}
                  // onClick={(e) => {
                  //   navigate('/EnquiryDetails');
                  // }}
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <FaEye style={{ fontSize: "20px" }} />
                </button>

                <button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => deleteEnquiry(data?._id)}
                >
                  <img
                    src={deleteicon}
                    width="30px"
                    height="20px"
                    alt="WhatsApp"
                  />
                </button>
              </div>
            )}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
}

export default Enquiry;
