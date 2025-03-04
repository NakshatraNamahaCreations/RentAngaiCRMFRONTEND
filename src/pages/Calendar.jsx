import React, { useEffect, useState } from "react";
;
import axios from "axios";
import { ApiURL } from "../path";
import moment from "moment/moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useNavigate } from "react-router-dom";

const Calendars = () => {
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${ApiURL}/order/getallorder`);
      if (res.status === 200) {
        setOrderData(res.data.orderData);
        };
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const localizer = momentLocalizer(moment);
  const [events, setEvents] = useState([]);
 console.log(events,"pppppp")



  useEffect(() => {
    const aggregatedEvents = orderData.reduce((acc, enquiry) => {
      const parsedDate = moment(enquiry.createdAt).startOf('day').toDate();
  
      console.log(parsedDate, "parsedDate"); // Check the parsed date
      const existingEvent = acc.find(event => event.start.getTime() === parsedDate.getTime());
  
      if (existingEvent) {
        existingEvent.title = `Orders: ${parseInt(existingEvent.title.split(": ")[1]) + 1}`;
      } else {
        acc.push({ title: "Orders: 1", start: parsedDate, end: parsedDate });
      }
  
      return acc;
    }, []);
  
    setEvents(aggregatedEvents);
  }, [orderData]);
  
  const navigate = useNavigate(); 
  const handleSelectEvent = (event) => {
    const date = moment(event.start).startOf('day').format("YYYY-MM-DD"); // Format the date for consistency
    const ordersForDate = orderData.filter(
      (order) =>
        moment(order.createdAt).startOf('day').format("YYYY-MM-DD") === date
    );
  
    // Navigate to the order-by-date page with the date and filtered orders
    navigate(`/order-by-date/${date}`, {
      state: { date, orderData: ordersForDate },
    });
  };
  
  return (
    <div className="m-2 mt-24 p-2 bg-white dark:bg-secondary-dark-bg rounded-3xl">
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
  );
};

export default Calendars;
