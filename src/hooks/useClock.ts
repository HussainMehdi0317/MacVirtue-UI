import React from "react";

export const useClock = () => {
  const [date, setDate] = React.useState(() => new Date());

  React.useEffect(() => {
    const id = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return {
    date,
    formatted: date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
};
