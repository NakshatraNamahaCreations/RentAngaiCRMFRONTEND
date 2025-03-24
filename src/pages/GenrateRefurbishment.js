import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ApiURL } from "../path";
import moment from "moment/moment";
import Select from "react-select";
import { toWords } from "number-to-words";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const GenrateRefurbishment = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();
  console.log(orderId, "orderId");
  const [refurbishmentdata, setRefurbishmentdata] = useState({});
  //   console.log(refurbishmentdata,"refurbishmentdata")
  const getRefurbishmentByOrderId = async () => {
    try {
      const response = await fetch(`${ApiURL}/refurbishment/${orderId}`);
      console.log(response, "response");
      const data = await response.json();
      setRefurbishmentdata(data);
    } catch (error) {
      console.error("Error fetching refurbishment:", error);
    }
  };
  useEffect(() => {
    getRefurbishmentByOrderId();
  }, [orderId]);

  const handleDownloadPDF = () => {
    const input = invoiceRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Refurbishment_Invoice_${orderId?.slice(20, 25)}.pdf`);
    });
  };

  const invoiceRef = useRef(null);
  return (
    <>
      <div className="max-w-5xl mx-auto mt-6 flex justify-end">
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-md"
        >
          Download Invoice PDF
        </button>
      </div>
      {refurbishmentdata?.products?.length > 0 ? (
        <div
          ref={invoiceRef}
          className="max-w-5xl mx-auto bg-white shadow-lg rounded-md p-8 mt-10 text-gray-800 font-sans"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-6 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-blue-800">
                Refurbishment Invoice
              </h2>
              <p
                className="text-sm text-gray-600 mt-1"
                style={{ fontWeight: "700" }}
              >
                Ordered ID: {refurbishmentdata?.orderId}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Refurbishment ID: {refurbishmentdata?._id}
              </p>
              <p className="text-sm text-gray-600">
                Date:{" "}
                {moment(refurbishmentdata?.createdAt).format("DD-MM-YYYY")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">From:</p>
              <p>Rent Angadi</p>
              <p>+91 9619868262</p>
              {/* <p>GSTIN: 29ABJFR2437B1Z3</p> */}
            </div>
          </div>

          {/* Product Table */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-gray-700">
              Refurbishment Products
            </h3>
            <table className="w-full text-sm border border-gray-300">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="border px-4 py-2 text-center">S.No.</th>
                  <th className="border px-4 py-2 text-left">Product</th>
                  <th className="border px-4 py-2 text-center">Quantity</th>
                  <th className="border px-4 py-2 text-center">Price</th>
                  <th className="border px-4 py-2 text-center">Total</th>
                  <th className="border px-4 py-2 text-left">
                    Damage Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {refurbishmentdata?.products?.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">
                      {index + 1}
                    </td>
                    <td className="border px-4 py-2">{item.productName}</td>
                    <td className="border px-4 py-2 text-center">
                      {item.quantity}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      ₹{item.price}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      ₹{item.quantity * item.price}
                    </td>
                    <td className="border px-4 py-2">{item.damage || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Summary */}
          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-1/2">
              <div className="flex justify-between border-t pt-4 text-gray-800 font-semibold text-md">
                <span>Total Amount</span>
                <span>
                  ₹
                  {refurbishmentdata?.products?.reduce(
                    (acc, curr) => acc + curr.quantity * curr.price,
                    0
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="mt-8 border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Shipping
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p className="font-semibold">Shipping Address:</p>
                <p>{refurbishmentdata?.shippingAddress || "N/A"}</p>
              </div>
              <div>
                <p className="font-semibold">Floor Manager:</p>
                <p>{refurbishmentdata?.floorManager || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-600 font-bold text-xl">
            No Refurbishment Invoice Available
          </p>
        </div>
      )}
    </>
  );
};

export default GenrateRefurbishment;
