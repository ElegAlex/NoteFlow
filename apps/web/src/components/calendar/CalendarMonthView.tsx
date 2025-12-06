// ===========================================
// CalendarMonthView - Vue mensuelle (P3 Calendrier)
// ===========================================

import { useCalendarStore } from '../../stores/calendarStore';
import { CalendarDayCell } from './CalendarDayCell';
import { getWeekdayNames } from '../../lib/calendarUtils';
import { Skeleton } from '../ui/Skeleton';

interface CalendarMonthViewProps {
  onCreateEvent?: (date: Date) => void;
}

export function CalendarMonthView({ onCreateEvent }: CalendarMonthViewProps) {
  const { calendarMonth, isLoading } = useCalendarStore();
  const weekdays = getWeekdayNames('fr-FR', 'short');

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-7 border-l border-t">
          {weekdays.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-sm font-medium text-muted-foreground border-b border-r"
            >
              {day}
            </div>
          ))}
          {[...Array(35)].map((_, i) => (
            <Skeleton key={i} className="h-24 border-b border-r" />
          ))}
        </div>
      </div>
    );
  }

  if (!calendarMonth) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        Aucune donnée
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-l border-t min-w-[700px]">
        {/* En-têtes des jours */}
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-sm font-medium text-muted-foreground border-b border-r bg-muted/30 sticky top-0"
          >
            {day}
          </div>
        ))}

        {/* Grille des jours */}
        {calendarMonth.weeks.map((week, weekIndex) =>
          week.days.map((day, dayIndex) => (
            <CalendarDayCell
              key={`${weekIndex}-${dayIndex}`}
              day={day}
              onCreateEvent={onCreateEvent}
            />
          ))
        )}
      </div>
    </div>
  );
}
