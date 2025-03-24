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
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function DayEnquiry() {




 const navigate = useNavigate();
  const location = useLocation();
  const { date, enquiries } = location.state || {};
  console.log(date,"date",enquiries,"enquiries")
  return (
    <div className="m-2 mt-6  md:mt-2 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
      <Toaster />

      {/* Header */}
      <Header banner="Enquiry" title="Enquiry" />
      <GridComponent
        dataSource={enquiries}
        allowPaging
        allowSorting
        editSettings={{ allowDeleting: true }}
        toolbar={["Search"]} // Add "Search" option here
        width="auto"
      >
        <ColumnsDirective>
          {/* <ColumnDirective field="enquiryId" headerText="Enquiry ID" /> */}
          <ColumnDirective field="enquiryDate" headerText="Enquiry Date" />
          <ColumnDirective field="enquiryTime" headerText="Time" />
          <ColumnDirective field="clientName" headerText="Client Name" />
          <ColumnDirective field="GST" headerText="GST" />
          <ColumnDirective field="adjustments" headerText="Round off" />
          <ColumnDirective field="GrandTotal" headerText="GrandTotal" />
          <ColumnDirective field="status" headerText="Msg status" />
          {/* <ColumnDirective field="status" headerText="enquiry Followup" /> */}
          <ColumnDirective
            field="status"
            headerText="Action"
            template={(data) => (
              <div className="flex gap-3">
                <button
             onClick={(e) => {
              navigate(`/newEnquiry/${data?.clientId}`, { state: { enquiryId: data._id } });
            }}
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                >
                  <img src={eyeicon} width="30px" height="20px" alt="View" />
                </button>

                <button
                  style={{
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    padding: 0,
                  }}
                  onClick={() => deleteEnquiry(data?._id)}
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

export default DayEnquiry;
