import React, { useEffect, useState } from "react";
import { BsBoxSeam, BsCurrencyDollar } from "react-icons/bs";
import { GoPrimitiveDot } from "react-icons/go";
import { IoIosMore } from "react-icons/io";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { Stacked, Pie, Button, LineChart, SparkLine } from "../components";
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
    fetchrefurbishment();
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

  const earningData = [
    {
      icon: <MdOutlineSupervisorAccount />,
      amount: ClientsData,
      percentage: "-4%",
      title: "Clients",
      iconColor: "#03C9D7",
      iconBg: "#E5FAFB",
      pcColor: "red-600",
    },
    {
      icon: <BsBoxSeam />,
      amount: Products,
      percentage: "+23%",
      title: "Products",
      iconColor: "rgb(255, 244, 229)",
      iconBg: "rgb(254, 201, 15)",
      pcColor: "green-600",
    },
    {
      icon: <FiBarChart />,
      amount: totalorders,
      percentage: todayorders,
      title: "Orders",
      iconColor: "rgb(228, 106, 118)",
      iconBg: "rgb(255, 244, 229)",

      pcColor: "green-600",
    },
    {
      icon: <HiOutlineRefresh />,
      amount: totalquotations,
      percentage: todayquotations,
      title: "Quotation",
      iconColor: "rgb(0, 194, 146)",
      iconBg: "rgb(235, 250, 242)",
      pcColor: "red-600",
    },
    // {
    //   icon: <HiOutlineRefresh />,
    //   amount: Refurbishment.length,
    //   title: "Refurbishment",
    //   iconColor: "rgb(0, 194, 146)",
    //   iconBg: "rgb(235, 250, 242)",
    //   pcColor: "red-600",
    // },
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
    <div className="mt-24">
      <div className="flexj ustify-between">
        <div
          className="flex m-3 flex-wrap gap-1 items-center justify-between"
          style={{ padding: "10px" }}
        >
          {/* Earning Data */}
          {earningData.map((item) => (
            <div
              key={item.title}
              className="bg-white h-44 dark:text-gray-200 dark:bg-secondary-dark-bg w-[20rem]  p-4 pt-9 rounded-2xl flex justify-between"
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
                  {/* <span className={`text-sm text-${item.pcColor} ml-2`}>
                  {item.percentage}
                </span> */}
                </p>
              </div>
              {/* Title */}
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-10 flex-wrap justify-center">
        {/* <div>
          <div
            className=""
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <div className="table-0 ">
              <div className="top-products-container">
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    textAlign: "left",
                  }}
                >
                  Top Category Sales
                </h2>
                <table className="top-products-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Category Name</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highestcategory.map((ele, i) => {
                      return (
                        <tr>
                          <td>{++i}</td>
                          <td>{ele.categoryName}</td>
                          <td>{ele.totalSales}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div
            className=""
            style={{ display: "flex", justifyContent: "space-around" }}
          >
            <div className="table-0 ">
              <div className="top-products-container">
                <h2
                  style={{
                    fontSize: "20px",
                    fontWeight: "800",
                    textAlign: "left",
                  }}
                >
                  Top Products Sales
                </h2>
                <table className="top-products-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Product Name</th>
                      <th>Total Sales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {highestSale.map((ele, i) => {
                      return (
                        <tr>
                          <td>{++i}</td>
                          <td>{ele.productName}</td>
                          <td>{ele.totalSales}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
           
          </div>
        </div> */}
        {/* <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg m-3 p-4 rounded-2xl md:w-780">
          <div className="flex justify-between">
     
            <p className="font-semibold text-xl">Revenue Updates</p>
            <div className="flex items-center gap-4">
     
              <p className="flex items-center gap-2 text-gray-600 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot />
                </span>
                <span>Expense</span>
              </p>

         
              <p className="flex items-center gap-2 text-green-400 hover:drop-shadow-xl">
                <span>
                  <GoPrimitiveDot />
                </span>
                <span>Budget</span>
              </p>
            </div>
          </div>

          <div className="mt-10 flex gap-10 flex-wrap justify-center">
         
           

            <div>
              <Stacked width="650px" height="360px" />
            </div>
          </div>
        </div> */}

       

        
      </div>

     
    
    </div>
  );
};

export default Dashboard;
