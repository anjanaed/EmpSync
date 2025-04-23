import React, { useEffect } from "react";
import { toast } from "sonner";


const Notifications = ({ type = "info", message }) => {
    useEffect(() => {
      if (message && toast[type]) {
        toast[type](message, {
          duration: 2500,
          position: "top-center",
        });
      }
    }, [type, message]);
  
    return null;
  };

export default Notifications;
