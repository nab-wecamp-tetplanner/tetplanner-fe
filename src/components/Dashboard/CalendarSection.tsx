import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  date: number;
  month: number;
  day: string;
  dayName: string;
  events: {
    type: "all-day" | "timed";
    title: string;
    time?: string;
    location?: string;
    color: string;
  }[];
}

const CalendarSection = () => {
  const [currentDate] = useState(new Date(2026, 1, 23)); // Feb 23, 2026

  const events: CalendarEvent[] = [
    {
      date: 23,
      month: 2,
      day: "23",
      dayName: "MON",
      events: [
        {
          type: "all-day",
          title: "Capsstone Project Work Period - Wecamp Batch 9 (Day 15/19)",
          color: "#fbbf24",
        },
        {
          type: "timed",
          title: "CS105.Q21 - P. B6.04",
          time: "07:30 - 09:45",
          color: "#8b5cf6",
        },
      ],
    },
    {
      date: 24,
      month: 2,
      day: "24",
      dayName: "TUE",
      events: [
        {
          type: "all-day",
          title: "Capsstone Project Work Period - Wecamp Batch 9 (Day 16/19)",
          color: "#fbbf24",
        },
        {
          type: "timed",
          title: "PE232.Q26 - P. Sanbongban",
          time: "09:00 - 11:30",
          color: "#fbbf24",
        },
        {
          type: "timed",
          title: "Khang",
          time: "19:30 - 21:00",
          color: "#5051f9",
        },
      ],
    },
    {
      date: 25,
      month: 2,
      day: "25",
      dayName: "WED",
      events: [
        {
          type: "all-day",
          title: "Capsstone Project Work Period - Wecamp Batch 9 (Day 17/19)",
          color: "#fbbf24",
        },
      ],
    },
    {
      date: 26,
      month: 2,
      day: "26",
      dayName: "THU",
      events: [
        {
          type: "all-day",
          title: "Capsstone Project Work Period - Wecamp Batch 9 (Day 18/19)",
          color: "#fbbf24",
        },
        {
          type: "timed",
          title: "NT209.Q21.ANTT - P. C305",
          time: "10:00 - 11:30",
          color: "#1ea7ff",
        },
      ],
    },
    {
      date: 27,
      month: 2,
      day: "27",
      dayName: "FRI",
      events: [
        {
          type: "all-day",
          title: "Capsstone Project Work Period - Wecamp Batch 9 (Day 19/19)",
          color: "#fbbf24",
        },
        {
          type: "timed",
          title: "CS338.Q21 - P. B6.02",
          time: "07:30 - 09:45",
          color: "#1ea7ff",
        },
        {
          type: "timed",
          title: "CS431.Q22 - P. B6.04",
          time: "13:00 - 15:15",
          color: "#1ea7ff",
        },
        {
          type: "timed",
          title: "Khang",
          time: "20:00 - 21:30",
          color: "#5051f9",
        },
      ],
    },
    {
      date: 28,
      month: 2,
      day: "28",
      dayName: "SAT",
      events: [
        {
          type: "timed",
          title: "Tina",
          time: "08:30 - 10:00",
          color: "#5051f9",
        },
      ],
    },
  ];

  const getColorDot = (color: string) => {
    const colorMap: Record<string, string> = {
      "#5051f9": "bg-indigo-500",
      "#fbbf24": "bg-amber-400",
      "#1ea7ff": "bg-cyan-500",
      "#8b5cf6": "bg-violet-500",
    };
    return colorMap[color] || "bg-gray-500";
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 overflow-hidden w-full lg:max-w-[50%]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-200 text-slate-900 font-bold text-lg rounded-full w-12 h-12 flex items-center justify-center">
            {currentDate.getDate()}
          </div>
          <div>
            <p className="text-sm text-slate-400">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-6 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {events.map((dayEvents) => (
          <div key={`${dayEvents.date}-${dayEvents.month}`}>
            {/* Date Header */}
            <div className="flex items-center gap-3 mb-4 sticky top-0 bg-slate-900 py-2">
              <div className="text-xl font-bold text-white min-w-fit">
                {dayEvents.date}
              </div>
              <div className="text-xs font-semibold text-slate-400 uppercase min-w-fit">
                {dayEvents.month === 2 ? "FEB" : "MAR"}, {dayEvents.dayName}
              </div>
              <div className="flex-1 h-px bg-slate-700"></div>
            </div>

            {/* Events */}
            <div className="space-y-2 ml-6">
              {dayEvents.events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  {/* Color dot */}
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${getColorDot(event.color)}`}
                  ></div>

                  {/* Event content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-300">
                      {event.type === "all-day" ? "All day" : event.time}
                    </p>
                    <p className="text-xs text-slate-400">
                      {event.location || event.title}
                    </p>
                    {event.title &&
                      event.type === "all-day" &&
                      event.title !== event.location && (
                        <p className="text-xs text-slate-300 mt-1">
                          {event.title}
                        </p>
                      )}
                    {event.type === "timed" && event.title && (
                      <p className="text-xs text-slate-300 mt-1">
                        {event.title}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            {dayEvents !== events[events.length - 1] && (
              <div className="h-px bg-slate-700 my-4"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarSection;
