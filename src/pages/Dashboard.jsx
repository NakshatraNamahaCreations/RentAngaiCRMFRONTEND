import React, { useEffect, useState } from "react";
import { BsBoxSeam, BsCurrencyDollar } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import { IoIosMore } from "react-icons/io";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { Stacked, Pie, Button, LineChart, SparkLine } from "../components";
import moment from "moment";
import {
  recentTransactions,
  dropdownData,
  SparklineAreaData,
  ecomPieChartData,
} from "../data/dummy";
import axios from "axios";
import { MdOutlineSupervisorAccount } from "react-icons/md";
import { FiBarChart } from "react-icons/fi";
import { useStateContext } from "../contexts/ContextProvider";
import { HiOutlineRefresh } from "react-icons/hi";
import { ApiURL } from "../path";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";

// Drop Down Menu
const DropDown = ({ currentMode }) => (
  <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{ border: "none", color: currentMode === "Dark" && "white" }}
      value="1"
      dataSource={dropdownData}
      popupHeight="220px"
      popupWidth="120px"
    />
  </div>
);

// Dashboard
const Dashboard = () => {
  const { currentColor, currentMode } = useStateContext();
  const [ClientsData, setClientsData] = useState();
  const [Products, setProducts] = useState();
  const [Refurbishment, setRefurbishment] = useState({});
  const [totalorders, settotalorders] = useState();
  const [todayorders, settodayorders] = useState();
  const [totalquotations, settotalquotations] = useState();
  const [todayquotations, settodayquotations] = useState();

  // console.log(Refurbishment,"fetchrefurbishment");

  useEffect(() => {
    fetchTotalclients();
    fetchTotalproducts();
    fetchTotalorders();
    fetchTotalquotation();
  }, []);

  const fetchTotalclients = async () => {
    try {
      const res = await axios.get(`${ApiURL}/client/TotalNumberOfClients`);
      if (res.status === 200) {
        setClientsData(res.data.clientCount);
      }
    } catch (error) {
      console.error("Error fetching Totalclients:", error);
    }
  };

  const fetchTotalproducts = async () => {
    try {
      const res = await axios.get(`${ApiURL}/product/TotalNumberOfProduct`);
      if (res.status === 200) {
        setProducts(res.data.productCount);
      }
    } catch (error) {
      console.error("Error fetching Totalproduct:", error);
    }
  };
  const fetchTotalorders = async () => {
    try {
      const res = await axios.get(`${ApiURL}/order/TotalNumberOfOrder`);
      if (res.status === 200) {
        settotalorders(res.data.totalorderCount);
        settodayorders(res.data.todayorderCount);
      }
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };

  const fetchTotalquotation = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/quotations/TotalNumberOfquotation`
      );
      if (res.status === 200) {
        settotalquotations(res.data.totalQuotationCount);
        settodayquotations(res.data.todayQuotationCount);
      }
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };
  const fetchrefurbishment = async () => {
    try {
      const res = await axios.get(`${ApiURL}/refurbishment/getRefurbishment`);
      if (res.status === 200) {
        setRefurbishment(res.data.RefurbishmentData || []);
      }
    } catch (error) {
      console.error("Error fetching Refurbishment:", error);
      toast.error("Failed to fetch Refurbishment");
    }
  };

  const [selectedCategory, setSelectedCategory] = useState("Orders"); // Default selection
  const [monthlyData, setMonthlyData] = useState([]);
  useEffect(() => {
    fetchData(selectedCategory);
  }, [selectedCategory]);
  const fetchData = async (category) => {
    try {
      let apiUrl = "";
      if (category === "Orders") {
        apiUrl = `${ApiURL}/order/getallorder`;
      } else if (category === "Clients") {
        apiUrl = `${ApiURL}/client/getallclients`;
      } else if (category === "Quotations") {
        apiUrl = `${ApiURL}/quotations/getallquotations`;
      }
      const res = await axios.get(apiUrl);
      console.log(`${category} API Response:`, res.data);

      if (res.status === 200) {
        const data = res.data.orderData || res.data.Client || res.data.quoteData || res.data.data  // Adjust based on response

        if (!data || !Array.isArray(data)) {
          console.warn(`${category} API did not return a valid array.`);
          setMonthlyData([]);
          return;
        }

        const groupedData = processData(data);
        setMonthlyData(groupedData);
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      setMonthlyData([]);
    }
  };

  // Process Data for Monthly Graph
  const processData = (data) => {
    const monthlyData = {
      "January": 0, "February": 0, "March": 0, "April": 0,
      "May": 0, "June": 0, "July": 0, "August": 0,
      "September": 0, "October": 0, "November": 0, "December": 0,
    };

    data.forEach((item) => {
      if (item.createdAt) {
        const month = moment(item.createdAt).format("MMMM");
        if (monthlyData.hasOwnProperty(month)) {
          monthlyData[month] += 1;
        }
      }
    });

    return Object.keys(monthlyData).map((month) => ({
      month,
      count: monthlyData[month],
    }));
  };
//   useEffect(() => {
//     fetchMonthlyOrders();
//   }, []);

//   const fetchMonthlyOrders = async () => {
//     try {
//       const res = await axios.get(`${ApiURL}/order/getallorder`);
//       if (res.status === 200) {
//         const orders = res.data.orderData;
//         const groupedOrders = processMonthlyOrders(orders);
//         setMonthlyOrders(groupedOrders);
//         console.log("Processed Monthly Orders:", groupedOrders);
//       }
//     } catch (error) {
//       console.error("Error fetching MonthlyOrders:", error);
//     }
//   };
//   const processMonthlyOrders = (orders) => {
//     const monthlyData = {
//         "January": 0, "February": 0, "March": 0, "April": 0,
//         "May": 0, "June": 0, "July": 0, "August": 0,
//         "September": 0, "October": 0, "November": 0, "December": 0
//     };

//     orders.forEach((order) => {
//         if (order.createdAt) {
//             const month = moment(order.createdAt).format("MMMM");
//             monthlyData[month] += 1;
//         }
//     });

//     return Object.keys(monthlyData).map((month) => ({
//         month,
//         orders: monthlyData[month],
//     }));
// };

  const earningData = [

    {
      id: "Orders",
      icon: <FiBarChart />,
      amount: totalorders,
      percentage: todayorders,
      title: "Orders",
      iconColor: "rgb(228, 106, 118)",
      iconBg: "rgb(255, 244, 229)",
      pcColor: "green-600",
     
    },
    {
      id: "Clients",
      icon: <MdOutlineSupervisorAccount />,
      amount: ClientsData,
      percentage: "-4%",
      title: "Clients",
      iconColor: "#03C9D7",
      iconBg: "#E5FAFB",
      pcColor: "red-600",
    },
    // {
    //   id: "Clients",
    //   icon: <BsBoxSeam />,
    //   amount: Products,
    //   percentage: "+23%",
    //   title: "Products",
    //   iconColor: "rgb(255, 244, 229)",
    //   iconBg: "rgb(254, 201, 15)",
    //   pcColor: "green-600",
    // },
   
    {
      id: "Quotations",
      icon: <HiOutlineRefresh />,
      amount: totalquotations,
      percentage: todayquotations,
      title: "Quotation",
      iconColor: "rgb(0, 194, 146)",
      iconBg: "rgb(235, 250, 242)",
      pcColor: "red-600",
    },
  ];

  const [highestSale, setHighestSale] = useState([]);

  // product sales
  const fetchProductTotalorders = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/order/products/sales/highest-lowest`
      );
      if (res.status === 200) {
        setHighestSale(res.data.topProducts);
        // setLowestSale(res.data.lowestSale);
      }
    } catch (error) {ß
      console.error("Error fetching :", error);
    }
  };
  useEffect(() => {
    fetchProductTotalorders();
  }, []);

  // category sales
  const [highestcategory, setHighestCategory] = useState([]);
  const fetchCategoryTotalorders = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/order/category/sales/highest-lowest`
      );
      if (res.status === 200) {
        setHighestCategory(res.data.categorySales);
        // setLowestSale(res.data.lowestSale);
      }
    } catch (error) {
      console.error("Error fetching :", error);
    }
  };
  useEffect(() => {
    fetchCategoryTotalorders();
  }, []);

  return (
    <div className="">
      <div className="flexj ustify-between">
        <div
          className="flex m-3 flex-wrap gap-1 items-center justify-between"
          style={{ padding: "10px" }}
        >
          {/* Earning Data */}
          {earningData.map((item) => (
            <div
            key={item.id}
            className={`bg-white h-38 dark:text-gray-200 dark:bg-secondary-dark-bg w-[20rem] p-4 pt-5 rounded-2xl flex justify-between cursor-pointer ${
              selectedCategory === item.id ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => setSelectedCategory(item.id)}
            >
              {/* Icon */}
              <button
                type="button"
                style={{
                  color: item.iconColor,
                  backgroundColor: item.iconBg,
                  fontSize: "3rem",
                  height: "90px",
                  width: "90px",
                  display: "flex",
                  justifyContent: "center",
                }}
                className="text-2xl opacity-0.9 rounded-full  p-4 hover:drop-shadow-xl"
              >
                {item.icon}
              </button>
              <div>
                <p
                  className="text-sm text-gray-400  mt-1"
                  style={{
                    fontSize: "16px",
                    fontWeight: "700",
                    color: "black",
                  }}
                >
                  {item.title}
                </p>
                {/* Amount (with %) */}
                <p className="mt-3">
                  <span className="text-lg font-semibold">{item.amount}</span>
                 
                </p>
              </div>
              {/* Title */}
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg mt-10">
        {/* <h2 className="text-lg font-semibold mb-4">Orders Per Month</h2> */}
        {/* {monthlyOrders.length > 0 ? (
        <ResponsiveContainer width="95%" height={350}>
            <BarChart data={monthlyOrders} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
        </ResponsiveContainer>
    ) : (
        <h2 className="text-center text-gray-500 mt-4" style={{fontWeight:"bold"}}>No order data available.</h2>
    )} */}
     <div className="bg-white p-6 rounded-lg shadow-lg mt-4">
     <h2 className="text-lg font-semibold mb-4 text-center">
    {selectedCategory} Per Month
  </h2>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={monthlyData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill={selectedCategory === "Orders" ? "#3b82f6" : "#22c55e"}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <h2
            className="text-center text-gray-500 mt-4 font-bold"
          >
             No {selectedCategory ? selectedCategory.toLowerCase() : "data"} available.
          </h2>
        )}
      </div>

      </div>
    </div>
  );
};

export default Dashboard;
