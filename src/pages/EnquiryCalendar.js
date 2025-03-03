import React, { useState, useEffect } from "react";
import axios from "axios";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css"; // Import calendar styles
import { Header } from "../components";
import { useNavigate } from "react-router-dom";

function EnquiryCalendar() {
  const apiURL = "https://api.rentangadi.in/api"; // Update your API URL
  const localizer = momentLocalizer(moment);

  const [enquiryData, setEnquiryData] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEnquiry();
  }, []);

  const fetchEnquiry = async () => {
    try {
      const res = await axios.get(`${apiURL}/Enquiry/getallEnquiry`);
      if (res.status === 200) {
        setEnquiryData(res.data.enquiryData);
      }
    } catch (error) {
      console.error("Error fetching enquiry data:", error);
    }
  };
  useEffect(() => {
    // Aggregate EnquiryData into calendar events
    const aggregatedEvents = enquiryData.reduce((acc, enquiry) => {
      const parsedDate = moment(enquiry.enquiryDate, "DD-MM-YYYY").startOf('day').toDate();
      const existingEvent = acc.find(event => event.start.getTime() === parsedDate.getTime());
      if (existingEvent) {
        existingEvent.title = `Enquiries: ${parseInt(existingEvent.title.split(": ")[1]) + 1}`;
      } else {
        acc.push({ title: "Enquiries: 1", start: parsedDate, end: parsedDate });
      }
      return acc;
    }, []);

    setEvents(aggregatedEvents);
  }, [enquiryData]);


  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.title.includes("Enquiries") ? "red" : "blue",
        color: "white",
      },
    };
  };

  const navigate = useNavigate(); 
  const handleSelectEvent = (event) => {
    const date = moment(event.start).format("DD-MM-YYYY");
    const enquiriesForDate = enquiryData.filter((enquiry) => enquiry.enquiryDate === date);

    // Navigate to another page and pass data
    navigate(`/enquiries-by-date/${date}`, {
      state: { date, enquiries: enquiriesForDate },
    });
  };
  // const handleSelectEvent = (event) => {
  //   alert(`Selected Event: ${event.title}`);
  // };

  return (
    <div className="web" style={{ background: "white" }}>
      {/* Header */}
      <Header banner="Enquiry Calendar" title="Enquiry" />

      <div style={{ width: "94%", margin: "3%" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          selectable
          onSelectEvent={handleSelectEvent}
          style={{ height: 500 }}
        />
      </div>
    </div>
  );
}

export default EnquiryCalendar;
