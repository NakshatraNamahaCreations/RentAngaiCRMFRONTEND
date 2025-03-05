import axios from "axios";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ApiURL } from "../path";
import moment from "moment/moment";
import Select from "react-select";

const OrdersDetails = () => {
  const location = useLocation();
  const { id } = location.state || {};
  const [orderData, setOrderData] = useState([]);
  const [clientOrders, setClientOrders] = useState([]);
  // console.log("clientOrders>>>", clientOrders);
  // Fetch all orders
  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${ApiURL}/order/getallorder`);
      if (res.status === 200) {
        const transformedData = res.data.orderData.map((order) => ({
          ...order,
          productsDisplay: order.products.map(
            (p) => `${p.ProductName} @ ${p.qty} x ${p.Price}`
          ),
          addressDisplay: `${order.Address.address}, ${order.Address.other}`,
          formattedStartDate: moment(order.startDate).format("DD-MM-YYYY"),
          formattedEndDate: moment(order.endDate).format("DD-MM-YYYY"),
        }));
        setOrderData(transformedData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Filter client orders
  useEffect(() => {
    if (id && orderData.length > 0) {
      const filteredOrders = orderData.filter((order) => order._id === id);
      setClientOrders(filteredOrders);
    }
  }, [id, orderData]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (data) => {
    const confirm = window.confirm(
      "Are you sure you want to approve this order?"
    );
    if (confirm) {
      try {
        const { _id, orderStatus } = data;

        if (!_id) {
          toast.error("Order ID is missing");
          console.error("Order ID is missing");
          return;
        }

        if (!orderStatus) {
          toast.error("Order status is missing");
          console.error("Order status is missing");
          return;
        }

        // Determine the new status
        const status = orderStatus === "Inprocess" ? "Approved" : orderStatus;

        // Log for debugging
        console.log("Order ID:", _id);
        console.log("New Status:", status);

        // API Call
        const response = await axios.put(
          `${ApiURL}/order/updateStatus/${_id}`, // Correctly pass the ID
          {
            orderStatus: status, // Correctly pass the status
          }
        );

        // Handle response
        if (response.status === 200) {
          toast.success("Successfully Updated");
          window.location.reload();
        } else {
          toast.error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating the order status:", error);
        toast.error("Error updating the order status");
      }
    }
  };

  // Function to handle button click
  const handleUpdateClick = () => {
    if (!id) {
      toast.error("Order ID not found");
      return;
    }

    // Prepare data for the updateStatus function
    const data = {
      _id: id, // Pass the retrieved id
      orderStatus: "Inprocess", // Example initial order status
    };

    updateStatus(data); // Call updateStatus with the data
  };

  const [showAddRefurbishment, setShowAddRefurbishment] = useState(false);
  const [productData, setproductData] = useState([]);
  const fetchproduct = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/quoteproducts`);
      if (res.status === 200) {
        setproductData(res.data.QuoteProduct);
      }
    } catch (error) {
      console.error("Error fetching Refurbishment:", error);
      toast.error("Failed to fetch Refurbishment");
    }
  };
  useEffect(() => {
    fetchproduct();
  }, []);

  const [productrefurbishment, setproductrefurbishment] = useState("");
  const [damagerefurbishment, setdamagerefurbishment] = useState("");
  const [shippingaddressrefurbishment, setshippingaddressrefurbishment] =
    useState("");
  const [expense, setexpense] = useState("");
  const [floormanager, setfloormanager] = useState("");
  const handleUpdateOrders = async () => {
    try {
      const config = {
        url: `/order/refurbishment/${id}`,
        method: "put",
        baseURL: ApiURL,
        headers: { "Content-Type": "application/json" },
        data: {
          productrefurbishment: selectedOptions,
          damagerefurbishment,
          shippingaddressrefurbishment,
          expense,
          floormanager,
        },
      };
      const response = await axios(config);

      if (response.status === 200) {
        alert("Refurbishment details updated successfully.");
        setShowAddRefurbishment(false);
        window.location.reload();
      } else {
        console.error("Unexpected response:", response);
        alert("Failed to update refurbishment details.");
      }
    } catch (error) {
      console.error("Error updating orders:", error);
      alert("An error occurred while updating refurbishment details.");
    }
  };
  const [selectedOptions, setSelectedOptions] = useState([]);
  const transformedOptions = productData.map((item) => ({
    value: item._id,
    label: item.ProductName,
  }));

  const handleChange = (selected) => {
    setSelectedOptions(selected || []);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-2 px-1">
      {clientOrders.length === 0 ? (
        <>
          {" "}
          <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-800">
                No data available
              </h2>
              <p className="text-gray-600 mt-2">
                We couldn’t find any orders. Please check back later or contact
                support.
              </p>
            </div>
          </div>
        </>
      ) : (
        <>
          {clientOrders.map((ele) => {
            return (
              <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h5
                  className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6"
                  style={{ fontSize: "18px", fontWeight: "600" }}
                >
                  View Orders Details
                </h5>

                <h5
                  className="text-2xl font-semibold text-gray-800 border-b pb-4 mb-6"
                  style={{ fontSize: "18px", fontWeight: "600" }}
                >
                  Client Id : {ele?.ClientId}
                </h5>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Booking Date :{" "}
                      <span style={{ color: "red" }}>
                        {moment(ele?.createdAt).format("DD/MM/YYYY  ")}
                      </span>
                    </h2>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Order Id:
                    </h2>
                    <p className="text-gray-600">{ele?._id}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Company Name:
                    </h2>
                    <p className="text-gray-600">{ele?.clientName}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Phone No:
                    </h2>
                    <p className="text-gray-600">{ele?.clientNo}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Executive Name:
                    </h2>
                    <p className="text-gray-600">{ele?.executivename}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{
                        color: "black",
                        fontWeight: "600 ",
                        width: "50%",
                      }}
                    >
                      Address:
                    </h2>
                    <p
                      className="text-gray-600 text-right"
                      style={{ width: "50%" }}
                    >
                      {/* {ele?.Address?.address} */}
                      {ele?.Address}{" "}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{
                        color: "black",
                        fontWeight: "600 ",
                        cursor: "pointer",
                      }}
                    >
                      Order Status:
                    </h2>
                    <p
                      // onClick={() => handleUpdateClick()}
                      className={`font-semibold ${
                        ele.orderStatus === "Confirm"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                      style={{ cursor: "pointer" }}
                    >
                      {ele.orderStatus}
                    </p>
                  </div>

                  {/* <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Payment Status:
                    </h2>
                    <p
                      className={`font-semibold ${
                        ele.paymentStatus === "Pending"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {ele.paymentStatus}
                    </p>
                  </div> */}

                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Grand Total:
                    </h2>
                    <p className="text-gray-600">₹{ele.GrandTotal}</p>
                  </div>

                  {/* <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      Start Date:
                    </h2>
                    <p className="text-gray-600">{ele.formattedStartDate}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <h2
                      className="text-lg font-medium text-gray-700"
                      style={{ color: "black", fontWeight: "600 " }}
                    >
                      End Date:
                    </h2>
                    <p className="text-gray-600">{ele.formattedEndDate}</p>
                  </div> */}

                  <div className="border-t pt-4">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h2
                        className="text-lg font-medium text-gray-700 mb-2"
                        style={{ color: "black", fontWeight: "600 " }}
                      >
                        Products:
                      </h2>
                      <button
                        onClick={() => setShowAddRefurbishment(true)}
                        className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
                      >
                        <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                          Add Refurbishment
                        </span>
                      </button>
                    </div>
                    <div className="border-t pt-4">
                      <table className="min-w-full table-auto border-collapse border border-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                              Slot
                            </th>
                            <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                              Product Name
                            </th>

                            <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                              Quantity
                            </th>
                            {/* <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                                                  Price
                                                </th> */}
                            <th className="border px-4 py-2 text-left text-gray-700 font-semibold text-center">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {ele?.slots?.map((slot, slotIndex) => (
                            <React.Fragment key={slotIndex}>
                              {slot?.products?.map((product, productIndex) => (
                                <tr
                                  key={productIndex}
                                  className="hover:bg-gray-50"
                                >
                                  {productIndex === 0 && (
                                    <td
                                      className="border px-4 py-2 text-gray-700 font-bold text-center bg-gray-200"
                                      rowSpan={slot.products.length}
                                      style={{
                                        borderBottom: "1px solid #8080803b",
                                      }}
                                    >
                                      {slot.slotName?.slice(0, 16)},<br />
                                      {slot?.quoteDate},<br />{" "}
                                      {slot.slotName?.slice(16)},<br />
                                      {slot?.endDate},
                                    </td>
                                  )}
                                  {/* Product Details */}
                                  <td className="border px-4 py-2 text-gray-700 text-center">
                                    {product.productName || "N/A"}
                                  </td>

                                  <td className="border px-4 py-2 text-gray-700 text-center">
                                    {product.quantity || 0}
                                  </td>
                                  {/* <td className="border px-4 py-2 text-gray-700 text-center">
                                                        ₹{product.price || 0}
                                                      </td> */}
                                  <td className="border px-4 py-2 text-gray-700 text-center">
                                    ₹{product?.total.toFixed(2) || 0}
                                  </td>
                                </tr>
                              ))}
                            </React.Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {/* Refurbishment */}

                  <div className="border-t pt-4">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h2
                        className="text-lg font-medium text-gray-700 mb-2"
                        style={{ color: "black", fontWeight: "600 " }}
                      >
                        Refurbishment Details:
                      </h2>
                    </div>
                    <div className="border-t pt-4">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr>
                            <th className="border-b-2 p-2">Product Name</th>
                            <th className="border-b-2 p-2">Damage</th>
                            <th className="border-b-2 p-2">Expense</th>
                            <th className="border-b-2 p-2">Floor Manager</th>
                            <th className="border-b-2 p-2">Shipping Address</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr>
                            <td className="border-b p-2">
                              {ele?.productrefurbishment?.map((item, index) => (
                                <div key={index}>{item?.label}</div> // Wrap each item in a div
                              ))}
                            </td>
                            <td className="border-b p-2">
                              {ele.damagerefurbishment}
                            </td>
                            <td className="border-b p-2">₹{ele.expense}</td>
                            <td className="border-b p-2">{ele.floormanager}</td>
                            <td className="border-b p-2">
                              {ele.shippingaddressrefurbishment}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/*  */}
                </div>
              </div>
            );
          })}
        </>
      )}
      {showAddRefurbishment && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full"
            style={{ width: "40rem" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Add Refurbishment</h2>
              <button
                onClick={() => setShowAddRefurbishment(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg p-2"
              >
                &#x2715;
              </button>
            </div>
            <form className="space-y-4">
              <div className="flex-1 mb-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Product Name <span className="text-red">*</span>
                </label>
                {/* <select
                  id="productName"
                  value={productrefurbishment}
                  onChange={(e) => setproductrefurbishment(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-200"
                >
                  <option
                    value=""
                    className="block text-gray-700 font-semibold mb-2"
                  >
                    Select Product
                  </option>
                  {productData.map((item) => (
                    <option
                      key={item._id}
                      value={item.ProductName}
                      className="block text-gray-700 font-semibold "
                    >
                      {item.ProductName}
                    </option>
                  ))}
                </select> */}

                <div>
                  <Select
                    isMulti
                    options={transformedOptions}
                    value={selectedOptions}
                    onChange={handleChange}
                    placeholder="Select products..."
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="refurbishmentName"
                >
                  Damage <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="comment"
                  value={damagerefurbishment}
                  onChange={(e) => setdamagerefurbishment(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="refurbishmentName"
                >
                  Shipping Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="comment"
                  value={shippingaddressrefurbishment}
                  onChange={(e) =>
                    setshippingaddressrefurbishment(e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  // htmlFor="email"
                >
                  Expense
                </label>
                <input
                  type="number"
                  id="expense"
                  value={expense}
                  onChange={(e) => setexpense(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="email"
                >
                  Floor Manager
                </label>
                <input
                  type="text"
                  id="floormanager"
                  value={floormanager}
                  onChange={(e) => setfloormanager(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddRefurbishment(false)}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleUpdateOrders}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersDetails;
