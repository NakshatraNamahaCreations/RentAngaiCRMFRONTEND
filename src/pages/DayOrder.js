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
import { useLocation, useNavigate } from "react-router-dom";
import Calendars from "./Calendar";
const DayOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { date, orderData } = location.state || {};
  console.log("Selected Date:", date);
  console.log("Orders for Date:", orderData);

  //   const [filteredData, setFilteredData] = useState([]);
  //   useEffect(() => {
  //     fetchOrders();
  //   }, []);

  //   const fetchOrders = async () => {
  //     try {
  //       const res = await axios.get(`${ApiURL}/order/getallorder`);
  //       if (res.status === 200) {
  //         const transformedData = res.data.orderData.map((order) => ({
  //           ...order,
  //           productsDisplay: order.products.map(
  //             (p) => `${p.ProductName} @ ${p.qty} x ${p.Price}`
  //           ),

  //           addressDisplay: `${order.Address.address}, ${order.Address.other}`,
  //           formattedStartDate: moment(order.startDate).format("DD-MM-YYYY"),
  //           formattedEndDate: moment(order.endDate).format("DD-MM-YYYY"),
  //         }));
  //         setOrderData(transformedData);
  //         setFilteredData(transformedData);
  //       }
  //     } catch (error) {
  //       console.error("Error fetching orders:", error);
  //     }
  //   };

  const navigateToDetails = (_id) => {
    navigate("/orders/details", { state: { id: _id } });
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <div className="flex">
        <Header category="Client" title="Orders" />
      </div>

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
              const date = new Date(data?.createdAt);
              const time = date.toLocaleTimeString(); // Get local time string
              return (
                <div>
                  <div>{moment(data?.createdAt).format("L")}</div>
                  {/* <div>{time} </div> */}
                  {/* <div>{moment(data).format("h:mm:ss a")}</div> */}
                </div>
              );
            }}
          />
          <ColumnDirective field="clientName" headerText="Client Name" />
          {/* <ColumnDirective
              field="productsDisplay"
              headerText="Items"
              template={(data) => (
                <div>
                  {data.productsDisplay.map((item, index) => (
                    <div key={index}>{item}</div>
                  ))}
                </div>
              )}
            /> */}

          <ColumnDirective field="GrandTotal" headerText="Grand Total" />
          <ColumnDirective
            field="startDate"
            headerText="Start Date"
            template={(data) => moment(data?.startDate).format("DD-MM-YYYY")}
          />
          <ColumnDirective
            field="endDate"
            headerText="End Date"
            template={(data) => moment(data?.endDate).format("DD-MM-YYYY")}
          />
          <ColumnDirective
            field="Address"
            headerText="Address"
            template={(data) => (
              <div className="address-display">
                <div style={{ whiteSpace: "pre-wrap" }}>{data.Address}</div>
              </div>
            )}
          />
          <ColumnDirective field="paymentStatus" headerText="Payment Status" />

          {/* <ColumnDirective
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
                      data.orderStatus === "Approved" ? "green" : "orange",
                    padding: 5,
                    width: "100px",
                    textAlign: "center",
                  }}
                >
                  {data.orderStatus}
                </div>
              )}
            /> */}

          <ColumnDirective
            field="orderStatus"
            headerText="ACTION"
            template={(data) => (
              <div
                onClick={() => navigateToDetails(data._id)}
                style={{
                  cursor: "pointer",
                  color: "white",
                  borderRadius: "5px",
                  background:
                    data.orderStatus === "Approved" ? "green" : "orange",
                  padding: 5,
                  width: "150px",
                  textAlign: "center",
                }}
              >
                View more details
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
    </div>
  );
};

export default DayOrders;
