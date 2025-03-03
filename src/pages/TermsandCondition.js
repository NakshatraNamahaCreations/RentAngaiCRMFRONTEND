import React, { useState, useEffect, useRef } from "react";
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

function TermsandCondition() {
  const [data, setData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  console.log(data, "data");
  const [showModal, setShowModal] = useState(false);
  const [header, setHeader] = useState("");
  const [desc, setDesc] = useState("");
  const [termsCategory, setTermsCategory] = useState("");
  const [descriptions, setDescriptions] = useState([]);
  const gridRef = useRef(null);

  useEffect(() => {
    fetchTermsandCondition();
    fetchCategories();
  }, []);

  const fetchTermsandCondition = async () => {
    try {
      const res = await axios.get(
        `${ApiURL}/termscondition/allTermsandCondition`
      );
      if (res.status === 200) {
        setData(res.data.TermsandConditionData);
      }
    } catch (error) {
      console.error("Error fetching TermsandCondition:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${ApiURL}/category/getcategory`);
      if (res.status === 200) {
        setCategoryData(res.data.category);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories");
    }
  };

  const deleteitem = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      try {
        const response = await axios.post(
          `${ApiURL}/termscondition/deleteTC/${id}`
        );
        if (response.status === 200) {
          toast.success("Successfully Deleted");
          fetchTermsandCondition();
        }
      } catch (error) {
        toast.error("Termscondition Not Deleted");
        console.error("Error deleting the Termscondition:", error);
      }
    }
  };

  const toolbarClick = async (args) => {
    if (args.item.id.includes("delete")) {
      const selectedRecords = gridRef.current.getSelectedRecords();
      if (selectedRecords.length) {
        const deletePromises = selectedRecords.map((record) =>
          deleteitem(record._id)
        );
        await Promise.all(deletePromises);
        gridRef.current.clearSelection();
        toast.success("Selected records deleted successfully.");
      } else {
        alert("Please select at least one record to delete.");
      }
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!header || !descriptions.length) {
      alert("Please fill out all fields");
    } else {
      try {
        const response = await axios.post(
          `${ApiURL}/termscondition/addtermscondition`,
          {
            header: header,
            points: descriptions,
            category: termsCategory,
          }
        );
        if (response.status === 200) {
          fetchTermsandCondition();
          setHeader("");
          setDescriptions([]);
          setShowModal(false);
          toast.success("Successfully Added");
        }
      } catch (error) {
        console.error(error);
        alert("Not Added");
      }
    }
  };

  const handleAddDesc = () => {
    setDescriptions([...descriptions, { desc }]);
    setDesc("");
  };

  return (
    <div className="m-2 mt-6 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />

      <div className="mb-3 flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-green-400 to-blue-600 group-hover:from-green-400 group-hover:to-blue-600 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800"
        >
          <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
            Add Terms and Condition
          </span>
        </button>
      </div>

      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-700 bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full"
            style={{ width: "30rem" }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Add Terms and Conditions
              </h2>
              <button
                onClick={() => setShowModal(false)}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 rounded-lg p-2"
              >
                &#x2715;
              </button>
            </div>
            <form className="space-y-4">
              <div className="mb-4" style={{ width: "28rem" }}>
                <label className="block text-gray-700 font-semibold mb-2">
                  Select Category <span className="text-red-500">*</span>
                </label>
                <select
          value={termsCategory} // Correctly bind the selected category to state
          onChange={(e) => setTermsCategory(e.target.value)} // Update the state on selection
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
        >
          <option value="" disabled>
            Select Category
          </option>
          {categoryData.map((cat) => (
            <option key={cat._id} value={cat.category}>
              {cat.category}
            </option>
          ))}
        </select>
              </div>
              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="header"
                >
                  Header <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="header"
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-semibold mb-2"
                  htmlFor="Desc"
                >
                  Description
                </label>
                <textarea
                  id="Desc"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={handleAddDesc}
                  className="text-gray-900 bg-white border border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 rounded-lg text-sm px-5 py-2.5"
                >
                  Add more
                </button>
                <button
                  onClick={submit}
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 rounded-lg text-sm px-5 py-2.5 focus:outline-none"
                >
                  Submit
                </button>
              </div>
            </form>

            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Descriptions:</h3>
              <ul className="list-disc pl-5">
                {descriptions.map((d, index) => (
                  <li key={index}>{d.desc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <GridComponent
        ref={gridRef}
        dataSource={data}
        allowPaging
        allowSorting
        toolbar={["Delete"]}
        toolbarClick={toolbarClick}
        editSettings={{ allowDeleting: true, allowEditing: true }}
        width="auto"
      >
        <ColumnsDirective>
          <ColumnDirective type="checkbox" width="50" />
          <ColumnDirective field="category" headerText="Category" />
          <ColumnDirective field="header" headerText="Header" />
          <ColumnDirective
            field="points"
            headerText="Description"
            template={(data) => (
              <div>
                {data.points.map((item, index) => (
                  <p key={index} style={{ whiteSpace: "pre-wrap" }}>
                    * {item.desc}
                  </p>
                ))}
              </div>
            )}
          />
        </ColumnsDirective>
        <Inject services={[Page, Toolbar, Selection, Edit, Sort, Filter]} />
      </GridComponent>
    </div>
  );
}

export default TermsandCondition;
