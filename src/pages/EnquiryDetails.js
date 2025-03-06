import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Calendar from 'rsuite/Calendar';
import 'rsuite/Calendar/styles/index.css';
import moment from "moment";
import axios from "axios";
import { ApiURL } from "../path";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { MultiSelectComponent } from "@syncfusion/ej2-react-dropdowns";
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
  const [grandTotal, setGrandTotal] = useState(0);
  const [adjustment, setAdjustment] = useState(0);

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

  const orders = async () => {
    try {
    } catch (error) {
      console.log();
    }
  };

  // Invoice Genrate
  const enquiry = enquirydata[0];
  console.log(enquiry?.products, ">>>>>>>>>>>>>>");
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

  // const handleGenerateOrder = async () => {
  //   setLoading(true);
  //   // Extract the first element from the array
  //   const enquiry = enquirydata[0];

  //   // Ensure enquiry is defined before creating the order
  //   if (!enquiry) {
  //     setResponseMessage("No enquiry data available to generate the order");
  //     setLoading(false);
  //     return;
  //   }
  //   try {
  //     const orderDetails = {
  //       ClientId: enquiry.clientId,
  //       startDate: enquiry?.createdAt,
  //       endDate: enquiry?.createdAt,
  //       products: enquiry.products,
  //       GrandTotal: enquiry.GrandTotal,
  //       advpayment: enquiry.advpayment,
  //       paymentStatus: enquiry.paymentStatus,
  //       // orderStatus: "Pending",
  //       clientName: enquiry.clientName,
  //       Address: enquiry?.address,
  //     };

  //     const response = await axios.post(
  //       "http://localhost:8000/api/order/postaddorder",
  //       orderDetails
  //     );
  //     setResponseMessage(response.data.message);
  //     await updateStatus({
  //       _id: enquiry._id,
  //       orderStatus: enquiry.status,
  //     });
  //     // updateStatus()
  //     redirectToOrders();
  //   } catch (error) {
  //     console.error("Error generating order:", error);
  //     setResponseMessage("Failed to generate order");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

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
        StockAvailable:productDetails?.StockAvailable || 0,
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
          placeaddress:enquiry?.placeaddress,
          slots: [
           { slotName:enquiry?.enquiryTime,
            Products:enquiry?.products,
            quoteDate:enquiry?.enquiryDate,
            endDate: enquiry?.endDate,
           }
          ],
          
        },
      };

      const response = await axios(config);

      if (response.status === 200) {
        // Update the status of the enquiry
        await updateStatus({
          _id: enquiry._id,
          orderStatus: "send", // Set the new status
        });

        toast.success("Quotation Created Successfully");
        setResponseMessage(response.data.message);
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
  const[edit,setEdit] = useState({})
  // console.log(edit,"Update ke liye")
  const[upgst,setUpgst] = useState(enquiry?.GST);
  const[upgrandtotal,setUpgrandtotal] = useState(0);
  const[updiscount,setUpdiscount] = useState(enquiry?.discount)  ;
  const[upadjustments,setUpadjustments] = useState(enquiry?.adjustments);

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


  const updateEnquiryStatus = async () => {
    try {
      let config ={
        method: 'put',
        url:"/Enquiry/updateenquiries/"+edit?._id,
        baseURL:"http://localhost:8000/api",
        headers: { "Content-Type": "application/json" }, 
        data:{
          GrandTotal:upgrandtotal,
          GST:upgst,
          discount:updiscount,
          adjustments:upadjustments,
          hasBeenUpdated:"true"
        }
      }
      let res = await axios(config);
      if(res.status === 200){
        console.log("Enquiry updated successfully");
        window.location.reload(true)
      } 
    } catch (error) {
      console.log(error)
    }
  }




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
                  {/* <div
                    className="text-center text-blue-600 font-semibold cursor-pointer mb-4"
                    onClick={() => editdetails(enquirydata?.enquiryId)}
                  >
                    Modify
                  </div> */}

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
                          {/* <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              End Date
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.endDate}
                            </td>
                          </tr> */}
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

                          {/* <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Email Id
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {enquiryData?.email}
                            </td>
                          </tr> */}
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
                              Discount
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.discount}%
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              GST
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.GST}
                            </td>
                          </tr>
                          <tr>
                            <td className="p-2 text-center border-b border-gray-200">
                              Round Off
                            </td>
                            <td className="p-2 border-b border-gray-200">
                              {ele?.adjustments}
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* <button
                  className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                  onClick={() => setIsOpen(true)}
                >
                  Alternate Product
                </button> */}
                {/* <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                  <form>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-gray-700">
                          Staff Name
                        </label>
                        <div className="border p-2 rounded bg-gray-50">
                          {admin.displayname}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700">
                          Foll. Date
                        </label>
                        <div className="border p-2 rounded bg-gray-50">
                          {moment().format("llll")}
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-700">
                          Response <span className="text-red-500">*</span>
                        </label>
                        <select className="border p-2 rounded w-full">
                          <option>--select--</option>
                          Uncomment when responsedata is available
                          {responsedata?.map((i) => (
                            <option key={i.response} value={i.response}>
                              {i.response}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-gray-700">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        className="border p-2 rounded w-full"
                        rows="4"
                      ></textarea>
                    </div>
                  </form>
                </div> */}
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
            {loading ? "Loading Quotations..." : "Confirm Quotations"}
          </button>
        </>
      )}
    </>
  );
})}
              {/* {enquirydata.map((ele) => {
                return (
                  <>
                    {ele.status === "send" ? (
                      <></>
                    ) : (
                      <>
                      {
  ele?.hasBeenUpdated === false ? ( 
    <button
      onClick={() => { setModalIsOpen(true); setEdit(ele); }}
      className="bg-blue-500 text-white py-2 px-4 rounded"
      disabled={loading}
    >
      Update Enquiry
    </button>
  ) : (
    <></>
  )
}

                        

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
              })} */}
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
              width: "400px",
              margin: "auto",
              padding: "20px",
              borderRadius: "8px",
            },
          }}
        >
          <h2 className="text-lg font-semibold mb-4">Product Form</h2>
          <div className="flex-1">
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
              dataSource={filteredProducts}
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
          ))}
          <div className="mt-4 mb-3">
            <label className="block w-200 text-gray-700 font-semibold mb-2">
              Round off
            </label>
            <input
              type="number"
              value={adjustment}
              onChange={(e) => setAdjustment(Number(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div className="mt-4 mb-3">
            <label className="block w-200 text-gray-700 font-semibold mb-2">
              Grand Total <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={grandTotal}
              readOnly
              className="border border-gray-300 rounded-md px-3 py-2 "
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-gray-300 rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
              onClick={handleSubmit}
            >
              Submit
            </button>
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
            maxHeight: "80vh",
            margin: "auto",
            padding: "20px",
            borderRadius: "10px",
            border: "1px solid #ccc",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {!enquiry?.GST && (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">GST</label>
      <select
        id="GST"
        value={upgst}
        onChange={(e) => setUpgst(e.target.value)}
        className="block px-3 py-2 rounded-md focus:ring-blue-200 no-focus-ring border"
        style={{ border: "1px solid", width: "200px" }}
      >
        <option value="">Select GST</option>
        <option value="0.05">5%</option>
        {/* <option value="0.12">12%</option>
              <option value="0.18">18%</option> */}
      </select>
    </div>
  )}
  {!enquiry?.discount && (
    <div className="mt-4 mb-3">
      <label className="block w-200 text-gray-700 font-semibold mb-2">
        Discount (%)
      </label>
      <input
        type="number"
        placeholder={enquiry?.discount}
        value={updiscount}
        onChange={(e) => setUpdiscount(Number(e.target.value))}
        className="border border-gray-300 rounded-md px-3 py-2"
      />
    </div>
  )}
   {!enquiry?.adjustments && (
    <div className="mt-4 mb-3">
      <label className="block w-200 text-gray-700 font-semibold mb-2">
        Round off
      </label>
      <input
        type="number"
        placeholder={enquiry?.adjustments}
        value={upadjustments || ""}
        onChange={(e) => setUpadjustments(Number(e.target.value))}
        className="border border-gray-300 rounded-md px-3 py-2"
      />
    </div>
  )}
        {/* <div>
          <label className="block text-gray-700 font-semibold mb-2">GST</label>
          <select
            id="GST"
            value={upgst}
            onChange={(e) => setUpgst(e.target.value)}
            className="block px-3 py-2 rounded-md focus:ring-blue-200 no-focus-ring border"
            style={{ border: "1px solid", width: "200px" }}
          >
            <option value="">Select GST</option>
            <option value="0.05">5%</option>
          </select>
        </div> */}
        {/* <div className="mt-4 mb-3">
          <label className="block w-200 text-gray-700 font-semibold mb-2">
            Discount{" "}
          </label>
          <input
            type="number"
            placeholder={enquiry?.discount}
            value={updiscount}
            onChange={(e) => setUpdiscount(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div> */}
        {/* <div className="mt-4 mb-3">
          <label className="block w-200 text-gray-700 font-semibold mb-2">
            Round off
          </label>
          <input
            type="number"
            placeholder={enquiry?.adjustments}
            value={upadjustments}
            onChange={(e) => setUpadjustments(Number(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          />
        </div> */}
        <div className="mt-4 mb-3">
          <label className="block w-200 text-gray-700 font-semibold mb-2">
            Grand Total <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            placeholder={enquiry?.GrandTotal}
            value={upgrandtotal}
            readOnly
            className="border border-gray-300 rounded-md px-3 py-2 "
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
          onClick={() => updateEnquiryStatus()}
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
