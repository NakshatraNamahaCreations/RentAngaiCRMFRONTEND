import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Sort,
  ContextMenu,
  Filter,
  Page,
  ExcelExport,
  PdfExport,
  Edit,
  Inject,
} from "@syncfusion/ej2-react-grids";
import Calendar from "./Calendar";
import axios from "axios";
import { Header } from "../components"; // Adjust the import path as necessary
import { ApiURL } from "../path"; // Adjust the import path as necessary
import moment from "moment/moment";
import { toast, Toaster } from "react-hot-toast";
const Orders = () => {
  const [toggle, setToggle] = useState(false);
  const [orderData, setOrderData] = useState([]);
  const [showModel, setshowModel] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${ApiURL}/order/getApprovedData`);
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

  const updateStatus = async (data) => {
    if (data?.orderStatus === "Returned") {
      toast.error("This order is already returned!");
      return;
    }
    const confirm = window.confirm(
      "Are you sure want to update this order status?"
    );

    if (confirm) {
      try {
        const { _id, orderStatus } = data;
        let status = ""; // Define status outside the if-else block

        if (orderStatus === "Approved") {
          status = "Delivered";
        } else if (orderStatus === "Delivered") {
          status = "Returned";
        } else {
          status = orderStatus;
        }

        const response = await axios.put(
          `${ApiURL}/order/updateStatus/${_id}`,
          {
            orderStatus: status,
          }
        );

        if (response.status === 200) {
          toast.success("Successfully Updated");
          window.location.reload("");
        } else {
          toast.error("Failed to update order status");
        }
      } catch (error) {
        console.error("Error updating the order status:", error);
        toast.error("Error updating the order status");
      }
    }
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <div className="flex">
        <Header category="Warehouse Management" title="Orders" />
      </div>
      <label className="inline-flex items-center cursor-pointer mb-3">
        <span className="ms-3 mx-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          List View
        </span>
        <input
          type="checkbox"
          className="sr-only peer"
          onChange={(e) => setToggle(e.target.checked)}
        />
        <div className="relative mx-4 w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        <span className="ms-3 mx-3 text-sm font-medium text-gray-900 dark:text-gray-300">
          Calendar View
        </span>
      </label>

      {showModel && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add Category</h2>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Enter category name"
              className="border border-gray-300 rounded-md px-3 py-2 mb-4 w-500"
            />
            <label className="block mb-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setCategoryImgUrl(file);
                }}
                className="hidden  w-full"
              />
              <div className="relative border border-gray-300 rounded-md px-3 py-2 w-full cursor-pointer bg-white hover:bg-gray-100">
                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <img
                    src={upload} // Path to your custom image
                    alt="Upload Icon"
                    className="h-6 w-6 text-gray-400 bg-opacity-50 z-50" // Adjust size as needed
                  />
                </span>
                {CategoryImgUrl ? (
                  <img
                    src={URL.createObjectURL(CategoryImgUrl)}
                    alt="Selected Image"
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Select an icon</span>
                )}
              </div>
            </label>

            <div className="flex justify-between">
              <button
                onClick={() => setShowAddCategory(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Close
              </button>
              <button
                onClick={postCategory}
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {toggle ? (
        <Calendar />
      ) : (
        <GridComponent
          id="gridcomp"
          dataSource={orderData}
          allowPaging
          allowSorting
        >
          <ColumnsDirective>
            <ColumnDirective
              field="createAt"
              headerText="Book Date/Time"
              template={(data) => {
                console.log("data", data);
                const date = new Date(data?.createdAt);
                const time = date.toLocaleTimeString(); // Get local time string
                return (
                  <div>
                    <div>{moment(data?.createdAt).format("L")}</div>
                    <div>{time} </div>
                    {/* <div>{moment(data).format("h:mm:ss a")}</div> */}
                  </div>
                );
              }}
            />
            <ColumnDirective field="clientName" headerText="Client Name" />
            <ColumnDirective
              field="productsDisplay"
              headerText="Items"
              template={(data) => (
                <div>
                  {data.productsDisplay.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              )}
            />

            <ColumnDirective
              field="formattedStartDate"
              headerText="Start Date"
            />
            <ColumnDirective field="formattedEndDate" headerText="End Date" />
            <ColumnDirective
              field="addressDisplay"
              headerText="Address"
              template={(data) => (
                <div className="address-display">
                  <div style={{ whiteSpace: "pre-wrap" }}>
                    {data.addressDisplay}
                  </div>
                </div>
              )}
            />
            <ColumnDirective
              field="paymentStatus"
              headerText="Payment Status"
              template={(data) => (
                <div
                  style={{
                    background: "#ff000087",
                    padding: "3px",
                    width: "80px",
                    borderRadius: "15px",
                    color: "white",
                    textAlign: "center",
                  }}
                >
                  {data?.paymentStatus}
                </div>
              )}
            />
            <ColumnDirective
              field="orderStatus"
              headerText="Order Status"
              template={(data) => (
                <div
                  onClick={() => updateStatus(data)}
                  style={{
                    cursor: "pointer",
                    color: "white",
                    borderRadius: "5px",
                    background:
                      data.orderStatus === "Delivered"
                        ? "red"
                        : data.orderStatus === "Approved"
                        ? "green"
                        : "black",

                    padding: 5,
                    width: "100px",
                    textAlign: "center",
                  }}
                >
                  {data.orderStatus}
                </div>
              )}
            />
          </ColumnsDirective>

          <Inject
            services={[
              Sort,
              ContextMenu,
              Filter,
              Page,
              Edit,
              ExcelExport,
              PdfExport,
            ]}
          />
        </GridComponent>
      )}
    </div>
  );
};

export default Orders;
