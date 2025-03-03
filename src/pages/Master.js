import React, { useState } from "react";
import { Header } from "../components";
import TermsandCondition from "./TermsandCondition";
import Category from "./Category";
import Subcategory from "./Subcategory";

function Master() {
  // State to manage the current active component
  const [activeComponent, setActiveComponent] = useState("Category");

  // Function to handle button click
  const handleButtonClick = (componentName) => {
    setActiveComponent(componentName);
  };

  // Function to get the class for active button
  const getButtonClass = (componentName) => {
    return componentName === activeComponent
      ? "bg-gradient-to-br from-green-400 to-blue-600 text-white border border-gray-300 dark:border-gray-600"
      : "bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600";
  };

  return (
    <div className="m-2 md:m-10 md:mt-2 p-2 md:p-10 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <div className="mb-3 flex">
        <button
          onClick={() => handleButtonClick("Category")}
          className={`relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group ${getButtonClass(
            "Category"
          )} group-hover:from-green-400 group-hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800`}
        >
          <span
            className={`relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md ${
              activeComponent === "Category" ? "bg-opacity-0" : ""
            }`}
          >
            Category
          </span>
        </button>
        <button
          onClick={() => handleButtonClick("Subcategory")}
          className={`mx-3 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group ${getButtonClass(
            "Subcategory"
          )} group-hover:from-green-400 group-hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800`}
        >
          <span
            className={`relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md ${
              activeComponent === "Subcategory" ? "bg-opacity-0" : ""
            }`}
          >
            Sub Category
          </span>
        </button>
        {/* <button
          onClick={() => handleButtonClick("TermsandCondition")}
          className={`mx-3 relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group ${getButtonClass(
            "TermsandCondition"
          )} group-hover:from-green-400 group-hover:to-blue-600 focus:ring-4 focus:outline-none focus:ring-green-200 dark:focus:ring-green-800`}
        >
          <span
            className={`relative px-5 py-2.5 transition-all ease-in duration-75 rounded-md ${
              activeComponent === "TermsandCondition" ? "bg-opacity-0" : ""
            }`}
          >
            Terms and Condition
          </span>
        </button> */}
      </div>
      <Header category="Master" title={activeComponent} />
      {/* Conditionally render components based on activeComponent */}
      {activeComponent === "Category" && <Category />}
      {activeComponent === "Subcategory" && <Subcategory />}
      {/* {activeComponent === "TermsandCondition" && <TermsandCondition />} */}
    </div>
  );
}

export default Master;
