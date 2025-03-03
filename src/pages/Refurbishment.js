import React, { useState, useEffect } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Search,
  Inject,
  Toolbar,
  Edit,
  Sort,
} from "@syncfusion/ej2-react-grids";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { ApiURL } from "../path";
import { Header } from "../components";
import moment from "moment";

const Refurbishment = () => {
  const [showAddRefurbishment, setShowAddRefurbishment] = useState(false);
  const [Name, setName] = useState("");
  const [productName, setproductName] = useState("");
  const [comment, setcomment] = useState("");
  const [expense, setexpense] = useState("");
  const [AlternateNumber, setAlternateNumber] = useState("");
  const [Password, setPassword] = useState("");
  const [Address, setAddress] = useState("");
  const [refurbishmentData, setrefurbishmentData] = useState([]);
  const [productData, setproductData] = useState([]);
  
  useEffect(() => {
    fetchrefurbishment();
    fetchproduct();
  }, []);

  const fetchrefurbishment = async () => {
    try {
      const res = await axios.get(`${ApiURL}/refurbishment/getRefurbishment`);
      if (res.status === 200) {
        setrefurbishmentData(res.data.RefurbishmentData);
      }
    } catch (error) {
      console.error("Error fetching Refurbishment:", error);
      toast.error("Failed to fetch Refurbishment");
    }
  };

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

  const postRefurbishment = async (e) => {
    console.log("api");
    e.preventDefault();
    if (!productName || !comment || !expense) {
      toast.error("Please fill all required fields");
      return;
    }

    const data = {
      productName,
      date: moment().format("DD-MM-YYYY"),
      comment,
      expense,
    };

    try {
      const response = await axios.post(
        `${ApiURL}/refurbishment/addRefurbishment`,
        data
      );
      if (response.status === 200) {
        window.location.reload("");
        toast.success("refurbishment added successfully");
        setShowAddRefurbishment(false);
        fetchrefurbishment();
      }
    } catch (error) {
      console.error("Error adding refurbishment:", error);
      toast.error("Failed to add refurbishment");
    }
  };

  const deleterefurbishment = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/refurbishment/deleteRefurbishment/${id}`
        );
        if (response.status === 200) {
          toast.success("refurbishment deleted successfully");
          fetchrefurbishment();
        }
      } catch (error) {
        console.error("Error deleting refurbishment:", error);
        toast.error("Failed to delete refurbishment");
      }
    }
  };

  const editrefurbishment = async (data) => {
    const {
      _id,
      refurbishmentName,
      email,
      phoneNumber,
      alternateNumber,
      password,
      address,
    } = data;

    try {
      const response = await axios.put(
        `${ApiURL}/refurbishment/editrefurbishment/${_id}`,
        {
          refurbishmentName,
          email,
          phoneNumber,
          alternateNumber,
          password,
          address,
        }
      );
      if (response.status === 200) {
        toast.success("refurbishment updated successfully");
        fetchrefurbishment(); // Refresh data after update
      } else {
        toast.error("Failed to update refurbishment");
      }
    } catch (error) {
      console.error("Error updating refurbishment:", error);
      toast.error("Error updating refurbishment");
    }
  };

  const actionBegin = async (args) => {
    if (args.requestType === "save") {
      const { data } = args;
      await editrefurbishment(data);
    }
    if (args.requestType === "delete") {
      const { data } = args;
      if (Array.isArray(data)) {
        for (const refurbishment of data) {
          await deleterefurbishment(refurbishment._id);
        }
      } else {
        await deleterefurbishment(data._id);
      }
    }
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />
      <Header category="Page" title="Refurbishment" />
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowAddRefurbishment(true)}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Add Refurbishment
          </span>
        </button>
      </div>

      {showAddRefurbishment && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
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
              <div className="flex-1 mb-4 mx-8">
                <label className="block text-gray-700 font-semibold mb-2">
                  Product Name <span className="text-red">*</span>
                </label>
                <select
                  id="productName"
                  value={productName}
                  onChange={(e) => setproductName(e.target.value)}
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
                </select>
              </div>
              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="refurbishmentName"
                >
                  comment <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="comment"
                  value={comment}
                  onChange={(e) => setcomment(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="email"
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
                  onClick={postRefurbishment}
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
        dataSource={refurbishmentData}
        allowPaging
        allowSorting
        editSettings={{ allowEditing: true, allowDeleting: true }}
        toolbar={["Edit", "Delete", "Search"]}
        width="auto"
        actionBegin={actionBegin}
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective
            field="productName"
            headerText="Product Name"
            width="150"
          />
          <ColumnDirective field="expense" headerText="Expense" width="150" />

          <ColumnDirective field="comment" headerText="Comment" width="150" />
        </ColumnsDirective>
        <Inject services={[Page, Search, Toolbar, Edit, Sort]} />
      </GridComponent>
    </div>
  );
};

export default Refurbishment;
