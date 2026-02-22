import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import "./calendarWidget.css"; 

const CalendarWidget = () => {
  const events = [
    { title: "Event", start: "2026-02-16", display: "dot" },
    { title: "Event", start: "2026-02-16", display: "dot" },
    { title: "Event", start: "2026-02-16", display: "dot" },
  ];

  return (
    <div className="p-4 bg-white rounded-2xl shadow-xl max-w-sm">
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        initialDate="2026-02-01"
        headerToolbar={{
          left: "title",
          center: "",
          right: "prev,next",
        }}
        events={events}
        dayHeaderFormat={{ weekday: "short" }}
        titleFormat={{ month: "short", year: "numeric" }}
        height="auto"
        fixedWeekCount={false}
      />
    </div>
  );
};

export default CalendarWidget;
