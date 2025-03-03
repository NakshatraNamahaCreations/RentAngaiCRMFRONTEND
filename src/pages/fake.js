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
import { FaEye } from "react-icons/fa";

function Fake() {
  const [showAddCreateQuotation, setShowAddCreateQuotation] = useState(false);
  const [ClientData, setClientData] = useState([]);
  const [ProductData, setProductData] = useState([]);
  // console.log(ProductData, "productcategory");

  const [termsConditionData, setTermsConditionData] = useState([]);
  const [selectedTermsConditions, setSelectedTermsConditions] = useState([]);
  const [QuotationData, setQuotationData] = useState([]);
  const [ClientName, setClientName] = useState("");
  const [ClientId, setClientId] = useState("");

  const [Products, setProducts] = useState([]);
  const [adjustment, setAdjustment] = useState(0); // Ensure default value is 0
  const [grandTotal, setGrandTotal] = useState(0);
  const [GST, setGST] = useState(0);
  const [ClientNo, setClientNo] = useState();
  const [Address, setAddress] = useState();
  const [category, setCategoryData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  // console.log(selectedCategory,"selectedCategory")
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value); // Update selected category
  };
  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      const res = await axios.get(`${ApiURL}/category/getcategory`);
      if (res.status === 200) {
        setCategoryData(res.data?.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error.message || error);
    }
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
    fetchquotations();
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

  const fetchquotations = async () => {
    try {
      const res = await axios.get(`${ApiURL}/quotations/getallquotations`);
      if (res.status === 200) {
        setQuotationData(res.data.quoteData);
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

  useEffect(() => {
    // Combine all calculations into one useEffect to ensure consistency
    const total = Products.reduce(
      (sum, product) => sum + (Number(product.total) || 0),
      0
    );

    let adjustedTotal = total;

    // Apply GST if applicable
    if (GST) {
      const GSTAmt = Number(GST * adjustedTotal);
      adjustedTotal += GSTAmt;
    }

    // Subtract adjustment
    adjustedTotal -= adjustment;

    // Set the grand total
    setGrandTotal(adjustedTotal);
  }, [Products, GST, adjustment]);

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

    if (!ClientName || !Products || !selectedTermsConditions) {
      alert("Please enter all fields");
    } else {
      try {
        const config = {
          url: "/quotations/createQuotation",
          method: "post",
          baseURL: ApiURL,
          headers: { "content-type": "application/json" },
          data: {
            clientName: ClientName,
            clientId: ClientId,
            Products: Products,
            adjustments: adjustment,
            GrandTotal: grandTotal,
            GST: GST,
            clientNo: ClientNo,
            address: Address,
            quoteDate: moment().format("DD-MM-YYYY"),
            quoteTime: moment().format("LT"),
            termsandCondition: selectedTermsConditions,
          },
        };
        await axios(config).then(function (response) {
          if (response.status === 200) {
            toast.success("Quotation Created Successfully ");
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

  const deleteQuotation = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/quotations/deletequotation/${id}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          setQuotationData()
        }
      } catch (error) {
        toast.error("Quotation Not Deleted");
        window.location.reload();
        console.error("Error deleting the Quotation:", error);
      }
    }
  };
 const[editquotations,setEditquotation] = useState({})
console.log(editquotations,"ed>>>>>>>.")


  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />

      {/* Header */}
      <Header banner="Quotations" title="Quotations" />
      {/* <div className="mb-3 flex gap-5 justify-end">
        <button
          onClick={() => setShowAddCreateQuotation(true)}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Create Quotations
          </span>
        </button>
      </div> */}

      {showAddCreateQuotation && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full h-full max-w-7xl max-h-7xl overflow-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold"> Create Quotation</h2>
              {/* <button
                onClick={() => setShowAddCreateQuotation(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg p-2"
              >
                &#x2715;
              </button> */}
            </div>
            <form className="space-y-4">
              <div
                className=""
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <select
                  id="clientName"
                  value={ClientName}
                  onChange={handleClientSelection}
                  className={`block w-96 px-3 py-2 rounded-md focus:ring-blue-200 ${
                    ClientName ? "selected-border" : "normal-border"
                  } no-focus-ring`}
                >
                  <option value="">Select ClientName</option>
                  {ClientData.map((item) => (
                    <option key={item._id} value={item.clientName}>
                      {item.clientName}
                    </option>
                  ))}
                </select>
              </div>
              
                <div className="mt-4">
                  <label className="block w-200 text-gray-700 font-semibold mb-2">
                    Create New Client
                  </label>
                  <input
                    type="text"
                    value={ClientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 w-96"
                  />
                </div>
                <div className="mb-4" style={{ width: "24rem" }}>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Select Category <span className="text-red-500">*</span>
                  </label>
                  <select
                     value={selectedCategory} // Controlled input
                     onChange={handleCategoryChange}
                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                  >
                    <option value="" disabled>
                      Select Category
                    </option>
                    {category.map((cat) => (
                     <option key={cat._id} value={cat.category}>
                     {cat.category}
                   </option>
                    ))}
                  </select>
                </div>
              
              </div>
              <div
                className=""
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className="">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Select the Products{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <MultiSelectComponent
                      id="Products"
                      dataSource={ProductData}
                      fields={{ text: "ProductName", value: "_id" }}
                      placeholder="Select Products"
                      mode="Box"
                      value={Products.map((p) => p.productId)}
                      onChange={(e) => handleProductSelection(e.value)}
                      style={{ border: "4px solid #ccc" }} // Adjust color and style as needed
                      className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
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
                        Total: ${product.total}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                    <label className="block w-200 text-gray-700 font-semibold mb-2">
                    Labour Charge
                    </label>
                    <input
                      type="number"
                      // value={adjustment}
                      // onChange={(e) => setAdjustment(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 w-96"
                    />
                  </div>
                {selectedCategory === "Furnitures" && (
                  <div className="mt-4">
                    <label className="block w-200 text-gray-700 font-semibold mb-2">
                    Round off
                    </label>
                    <input
                      type="number"
                      value={adjustment}
                      onChange={(e) => setAdjustment(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 w-96"
                    />
                  </div>
                )}
                {/* <div className="mt-4">
                <label className="block w-200 text-gray-700 font-semibold mb-2">
                 Discount
                </label>
                <input
                  type="number"
                  value={adjustment}
                  onChange={(e) => setAdjustment(Number(e.target.value))}
                  className="border border-gray-300 rounded-md px-3 py-2 w-96"
                />
              </div> */}
              </div>
              <div
                className=""
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                   <div className="mt-4">
                    <label className="block w-200 text-gray-700 font-semibold mb-2">
                    Transportation Charge
                    </label>
                    <input
                      type="number"
                      // value={adjustment}
                      // onChange={(e) => setAdjustment(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-2 w-96"
                    />
                  </div>
                <div>
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
                  >
                    <option value="">Select GST</option>

                    <option value="0.05">5%</option>
                    <option value="0.12">12%</option>
                    <option value="0.18">18%</option>
                  </select>
                </div>
                <div className="mt-4">
                  <label className="block w-200 text-gray-700 font-semibold mb-2">
                    Grand Total <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={grandTotal}
                    readOnly
                    className="border border-gray-300 rounded-md px-3 py-2 w-96"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-semibold ">
                  Select Terms & Conditions
                </label>
                <div>
                  {termsConditionData.filter((ele)=> ele?.category == selectedCategory).map((item) => (
                    <div>
                      <div key={item._id} className="flex items-center gap-2">
                        {/* <input
                          type="checkbox"
                          id={`term-${item._id}`}
                          checked={selectedTermsConditions.includes(item._id)}
                          onChange={() => handleTermsConditionChange(item._id)}
                          className="border border-gray-300 rounded-md px-3 py-2 w-5 mt-5"
                        /> */}
                        <label
                          htmlFor={`term-${item._id}`}
                          className="block text-gray-700 font-semibold mx-5 mt-5"
                        >
                          {item.header}
                        </label>
                      </div>
                      <div>
                        {item.points.map((i, index) => (
                          <div
                            key={index}
                            className="block text-gray-700 mx-10 mb-2"
                            style={{ fontSize: "13px" }}
                          >
                            *{i.desc}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddCreateQuotation(false)}
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
        dataSource={QuotationData}
        allowPaging
        allowSorting
        editSettings={{ allowDeleting: true }}
        toolbar={["Search"]} // Add "Search" option here
        width="auto"
      >
        <ColumnsDirective>
          <ColumnDirective field="quoteDate" headerText="Quote Date" />
          <ColumnDirective field="quoteTime" headerText="Time" />
          <ColumnDirective field="clientName" headerText="Client Name" />
          <ColumnDirective field="GST" headerText="GST" />
          <ColumnDirective field="adjustments" headerText="Round off" />
          <ColumnDirective field="GrandTotal" headerText="GrandTotal" />
          <ColumnDirective field="status" headerText="Msg status" />
          {/* <ColumnDirective field="status" headerText="Quote Followup" /> */}
          <ColumnDirective
            field="status"
            headerText="Action"
            template={(data) => (
              <div className="flex gap-3">
                <Link to={`/QuotationFormat/${data?._id}`}>
                  <button
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                      padding: 0,
                    }}
                  >
                  <FaEye style={{ fontSize: "20px" }} />  
                  </button>{" "}
                </Link>
                
                <button
                   onClick={() => {
                    setShowAddCreateQuotation(true);
                    setEditquotation(data);
                  }}
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  Create Quotation
                </button>
                {/* <button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <img src={edit} width="30px" height="20px" alt="WhatsApp" />
                </button> */}
                <button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => deleteQuotation(data?._id)}
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

export default Fake;
