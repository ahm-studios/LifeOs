import { useContext, useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { PlusIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import AppContext from '../context/AppContext.jsx';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const dayIndexMap = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6
};

export default function TimeBlockPlanner() {
  const { state, updateTimeBlocks, addNotification, google } = useContext(AppContext);
  const [selectedDay, setSelectedDay] = useState(dayjs().format('dddd'));
  const [form, setForm] = useState({ task: '', start: '08:00', end: '09:00', category: 'Focus' });

  const dayBlocks = useMemo(() => {
    return state.timeBlocks.find((day) => day.day === selectedDay)?.blocks ?? [];
  }, [selectedDay, state.timeBlocks]);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const newBlocks = Array.from(dayBlocks);
    const [moved] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, moved);
    updateTimeBlocks(selectedDay, newBlocks);
  };

  const addBlock = (event) => {
    event.preventDefault();
    if (!form.task) return;
    const start = dayjs(`${form.start}`, 'HH:mm');
    const end = dayjs(`${form.end}`, 'HH:mm');
    const duration = end.diff(start, 'minute');
    const block = {
      id: crypto.randomUUID(),
      task: form.task,
      start: form.start,
      end: form.end,
      category: form.category,
      durationMinutes: duration > 0 ? duration : 60,
      source: 'manual'
    };
    updateTimeBlocks(selectedDay, [...dayBlocks, block]);
    setForm({ task: '', start: '08:00', end: '09:00', category: 'Focus' });
    if (google.signedIn) {
      const targetIndex = dayIndexMap[selectedDay];
      const todayIndex = dayjs().day();
      let baseDate = dayjs().startOf('day').add(((targetIndex - todayIndex + 7) % 7), 'day');
      const [startHour, startMinute] = block.start.split(':').map(Number);
      const [endHour, endMinute] = block.end.split(':').map(Number);
      let startDate = baseDate.hour(startHour).minute(startMinute);
      let endDate = baseDate.hour(endHour).minute(endMinute);
      if (((targetIndex - todayIndex + 7) % 7) === 0 && endDate.isBefore(dayjs())) {
        startDate = startDate.add(7, 'day');
        endDate = endDate.add(7, 'day');
      }
      google.createEvent?.({
        summary: block.task,
        start: {
          dateTime: startDate.toISOString()
        },
        end: {
          dateTime: endDate.toISOString()
        }
      });
      addNotification('Synced block to Google Calendar.', 'success');
    }
  };

  const autoFill = () => {
    const baseStart = 6;
    const tasks = state.habits.slice(0, 5);
    const googleBlocks = dayBlocks.filter((block) => block.source === 'google');
    const generated = tasks.map((habit, index) => {
      const startHour = baseStart + index * 2;
      const start = dayjs().hour(startHour).minute(0);
      const end = start.add(90, 'minute');
      return {
        id: crypto.randomUUID(),
        task: habit.name,
        start: start.format('HH:mm'),
        end: end.format('HH:mm'),
        category: habit.category,
        durationMinutes: end.diff(start, 'minute'),
        source: 'suggested'
      };
    });
    updateTimeBlocks(selectedDay, [...googleBlocks, ...generated]);
    addNotification('Auto-filled from habits.', 'info');
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Time Blocking</h2>
          <p className="text-sm text-base-400">Design your day with laser focus</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white"
            value={selectedDay}
            onChange={(event) => setSelectedDay(event.target.value)}
          >
            {daysOfWeek.map((day) => (
              <option key={day}>{day}</option>
            ))}
          </select>
          <button
            className="rounded-xl border border-white/10 px-3 py-2 text-sm text-white transition hover:bg-white/10"
            onClick={autoFill}
          >
            Auto-fill
          </button>
        </div>
      </div>
      <form onSubmit={addBlock} className="mt-4 grid gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-4 md:grid-cols-5">
        <input
          className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white md:col-span-2"
          placeholder="Task"
          value={form.task}
          onChange={(event) => setForm((prev) => ({ ...prev, task: event.target.value }))}
        />
        <input
          type="time"
          className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white"
          value={form.start}
          onChange={(event) => setForm((prev) => ({ ...prev, start: event.target.value }))}
        />
        <input
          type="time"
          className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white"
          value={form.end}
          onChange={(event) => setForm((prev) => ({ ...prev, end: event.target.value }))}
        />
        <input
          className="rounded-xl border border-white/10 bg-base-900 px-3 py-2 text-sm text-white"
          placeholder="Category"
          value={form.category}
          onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
        />
        <button className="flex items-center justify-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/20 md:col-span-5">
          <PlusIcon className="h-4 w-4" /> Add Block
        </button>
      </form>
      <div className="mt-5">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="time-blocks">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-3">
                {dayBlocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(draggableProvided) => (
                      <div
                        ref={draggableProvided.innerRef}
                        {...draggableProvided.draggableProps}
                        {...draggableProvided.dragHandleProps}
                        className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 transition hover:border-white/20"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-white">{block.task}</p>
                            <p className="text-xs uppercase tracking-wide text-base-500">
                              {block.start} - {block.end} • {block.category} • {block.durationMinutes} mins {block.source === 'suggested' ? '• Suggested' : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </section>
  );
}
