import React, { createContext, useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { computeLevelFromXp, generateLevelThresholds } from '../lib/levels.js';
import { defaultHabits, defaultProfile, defaultTimeBlocks, defaultTaskLogs } from '../data/defaults.js';
import { evaluateAchievements } from '../lib/achievements.js';
import { summarizeWeek } from '../lib/weeklyReview.js';

const STORAGE_KEY = 'life-os-data-v1';
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events';

const initialState = {
  userProfile: defaultProfile,
  habits: defaultHabits,
  taskLogs: defaultTaskLogs,
  timeBlocks: defaultTimeBlocks,
  levels: {
    xp: 1520,
    level: 4,
    thresholds: generateLevelThresholds(50)
  },
  achievements: [],
  weeklyReflection: summarizeWeek(defaultTaskLogs)
};

const AppContext = createContext();

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATE':
      return { ...state, ...action.payload };
    case 'UPDATE_PROFILE':
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };
    case 'UPSERT_HABIT': {
      const updated = [...state.habits];
      const index = updated.findIndex((h) => h.id === action.payload.id);
      if (index >= 0) {
        updated[index] = action.payload;
      } else {
        updated.push(action.payload);
      }
      return { ...state, habits: updated };
    }
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter((h) => h.id !== action.payload) };
    case 'ADD_TASK_LOG':
      return { ...state, taskLogs: [...state.taskLogs, action.payload] };
    case 'UPSERT_TIMEBLOCK_DAY': {
      const { day, blocks } = action.payload;
      const updated = state.timeBlocks.filter((entry) => entry.day !== day);
      updated.push({ day, blocks });
      return { ...state, timeBlocks: updated };
    }
    case 'SET_LEVELS':
      return { ...state, levels: { ...state.levels, ...action.payload } };
    case 'SET_ACHIEVEMENTS':
      return { ...state, achievements: action.payload };
    case 'SET_WEEKLY_REVIEW':
      return { ...state, weeklyReflection: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleSignedIn, setGoogleSignedIn] = useState(false);
  const [googleEvents, setGoogleEvents] = useState([]);
  const [chatbotHistory, setChatbotHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const remindedBlocksRef = useRef(new Set());

  // Persist state in localStorage whenever it changes
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      dispatch({ type: 'SET_STATE', payload: parsed });
    }
  }, []);

  useEffect(() => {
    const data = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, data);
  }, [state]);

  // Compute achievements when task logs or levels change
  useEffect(() => {
    const achievements = evaluateAchievements(state.taskLogs, state.levels, state.timeBlocks);
    dispatch({ type: 'SET_ACHIEVEMENTS', payload: achievements });
  }, [state.taskLogs, state.levels, state.timeBlocks]);

  // Weekly reflections
  useEffect(() => {
    dispatch({ type: 'SET_WEEKLY_REVIEW', payload: summarizeWeek(state.taskLogs) });
  }, [state.taskLogs]);

  const addNotification = useCallback((message, type = 'info') => {
    const id = crypto.randomUUID();
    setNotifications((prev) => [...prev, { id, message, type }]);
    if (type === 'success' && (localStorage.getItem('life-os-sound') ?? 'on') !== 'muted') {
      const audio = new Audio(
        'data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEAESsAACJWAAACABAAZGF0YRgAAACAgICAgICAgP//f39/f4CAgICAgIC' +
          'AgP//f39/f4CAgICAgICBgYGBgYGBgICAgICAgICAgYGBgYGBgICAf39/f39/gICAgICAgICAgP//f39/f4CAgICAgICA'
      );
      audio.volume = 0.25;
      audio.play().catch(() => {});
    }
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 5000);
  }, []);

  const addXp = useCallback((xp) => {
    const newXpTotal = state.levels.xp + xp;
    const thresholds = state.levels.thresholds || generateLevelThresholds(50);
    const { level, nextLevelXp } = computeLevelFromXp(newXpTotal, thresholds);
    dispatch({
      type: 'SET_LEVELS',
      payload: { xp: newXpTotal, level, nextLevelXp, thresholds }
    });
    if (level > state.levels.level) {
      addNotification(`You have reached Level ${level}!`, 'success');
    }
  }, [state.levels, addNotification]);

  const logTaskCompletion = useCallback((habit, date) => {
    const timestamp = dayjs(date).format('YYYY-MM-DD');
    const existing = state.taskLogs.find((log) => log.habitId === habit.id && log.date === timestamp);
    if (existing) return;
    const log = {
      id: crypto.randomUUID(),
      habitId: habit.id,
      habitName: habit.name,
      date: timestamp,
      completed: true,
      xpEarned: habit.xp,
      category: habit.category
    };
    dispatch({ type: 'ADD_TASK_LOG', payload: log });
    addXp(habit.xp);
  }, [state.taskLogs, addXp]);

  const updateTimeBlocks = useCallback((day, blocks) => {
    dispatch({ type: 'UPSERT_TIMEBLOCK_DAY', payload: { day, blocks } });
  }, []);

  // Google Calendar integration -------------------------------------------------
  const initGoogle = useCallback((clientId, apiKey) => {
    if (!window.gapi) return;
    window.gapi.load('client:auth2', () => {
      window.gapi.client
        .init({
          apiKey,
          clientId,
          discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
          scope: GOOGLE_SCOPES
        })
        .then(() => {
          setGoogleReady(true);
          const authInstance = window.gapi.auth2.getAuthInstance();
          const signedIn = authInstance.isSignedIn.get();
          setGoogleSignedIn(signedIn);
          authInstance.isSignedIn.listen((val) => setGoogleSignedIn(val));
        })
        .catch((error) => {
          console.error('Google init error', error);
        });
    });
  }, []);

  const googleSignIn = useCallback(() => {
    if (!window.gapi) return;
    window.gapi.auth2.getAuthInstance().signIn();
  }, []);

  const googleSignOut = useCallback(() => {
    if (!window.gapi) return;
    window.gapi.auth2.getAuthInstance().signOut();
  }, []);

  const refreshGoogleEvents = useCallback(async () => {
    if (!window.gapi || !googleSignedIn) return;
    const now = new Date().toISOString();
    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });
    const events = response.result.items || [];
    setGoogleEvents(events);
  }, [googleSignedIn]);

  const createGoogleEvent = useCallback(async (event) => {
    if (!window.gapi || !googleSignedIn) return;
    await window.gapi.client.calendar.events.insert({ calendarId: 'primary', resource: event });
    refreshGoogleEvents();
  }, [googleSignedIn, refreshGoogleEvents]);

  // Mirror Google events into the local planner so the agenda stays fresh
  useEffect(() => {
    if (!googleEvents.length) {
      state.timeBlocks.forEach((entry) => {
        const withoutGoogle = entry.blocks.filter((block) => block.source !== 'google');
        if (withoutGoogle.length !== entry.blocks.length) {
          updateTimeBlocks(entry.day, withoutGoogle);
        }
      });
      return;
    }
    const grouped = new Map();
    googleEvents.forEach((event) => {
      const startIso = event.start?.dateTime ?? event.start?.date;
      const endIso = event.end?.dateTime ?? event.end?.date;
      if (!startIso || !endIso) return;
      const start = dayjs(startIso);
      const end = dayjs(endIso);
      const dayName = start.format('dddd');
      const newBlock = {
        id: event.id ?? crypto.randomUUID(),
        task: event.summary ?? 'Calendar Event',
        start: start.format('HH:mm'),
        end: end.format('HH:mm'),
        category: 'Calendar',
        durationMinutes: Math.max(15, end.diff(start, 'minute')),
        source: 'google'
      };
      const arr = grouped.get(dayName) ?? [];
      arr.push(newBlock);
      grouped.set(dayName, arr);
    });
    grouped.forEach((blocks, dayName) => {
      const existing = state.timeBlocks.find((entry) => entry.day === dayName)?.blocks ?? [];
      const withoutGoogle = existing.filter((block) => block.source !== 'google');
      const merged = [...withoutGoogle, ...blocks];
      const existingGoogle = existing.filter((block) => block.source === 'google');
      const sameLength = existingGoogle.length === blocks.length &&
        existingGoogle.every((block, idx) => {
          const candidate = blocks[idx];
          return block.id === candidate.id && block.start === candidate.start && block.end === candidate.end && block.task === candidate.task;
        });
      if (!sameLength) {
        updateTimeBlocks(dayName, merged);
      }
    });
  }, [googleEvents, state.timeBlocks, updateTimeBlocks]);

  // Chatbot ---------------------------------------------------------------------
  const processChatbotSummary = useCallback((summaryText) => {
    const tokens = summaryText.toLowerCase().split(/\s+/);
    const categories = ['work', 'gym', 'learning', 'writing', 'meditation', 'finance', 'relationships'];
    const detected = categories.filter((category) => tokens.includes(category));
    const today = dayjs().format('YYYY-MM-DD');
    const newBlocks = detected.map((category, index) => {
      const startHour = 8 + index * 2;
      const start = dayjs().hour(startHour).minute(0);
      const end = start.add(90, 'minute');
      return {
        id: crypto.randomUUID(),
        task: `Focus: ${category.toUpperCase()}`,
        category,
        start: start.format('HH:mm'),
        end: end.format('HH:mm'),
        durationMinutes: end.diff(start, 'minute'),
        source: 'chatbot'
      };
    });
    if (newBlocks.length) {
      const dayName = dayjs(today).format('dddd');
      const existing = state.timeBlocks.find((entry) => entry.day === dayName)?.blocks ?? [];
      const preservedGoogle = existing.filter((block) => block.source === 'google');
      updateTimeBlocks(dayName, [...preservedGoogle, ...newBlocks]);
      addNotification('Time blocks updated from your summary.', 'info');
    }
    const newEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      message: summaryText,
      generatedBlocks: newBlocks
    };
    setChatbotHistory((prev) => [...prev, newEntry]);
    return newBlocks;
  }, [updateTimeBlocks, addNotification]);

  // Reminder system for upcoming blocks within the next 15 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      const now = dayjs();
      const todayName = now.format('dddd');
      const todayBlocks = state.timeBlocks.find((entry) => entry.day === todayName)?.blocks ?? [];
      todayBlocks.forEach((block) => {
        const [startHour, startMinute] = block.start.split(':').map(Number);
        const startTime = now.hour(startHour).minute(startMinute).second(0);
        const diffMinutes = startTime.diff(now, 'minute');
        if (diffMinutes >= 0 && diffMinutes <= 15) {
          const reminderKey = `${todayName}-${block.id}`;
          if (!remindedBlocksRef.current.has(reminderKey)) {
            remindedBlocksRef.current.add(reminderKey);
            addNotification(`Upcoming: ${block.task} in ${diffMinutes} minutes`, 'info');
          }
        }
        if (startTime.isBefore(now.subtract(30, 'minute'))) {
          remindedBlocksRef.current.delete(`${todayName}-${block.id}`);
        }
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [state.timeBlocks, addNotification]);

  const value = useMemo(() => ({
    state,
    dispatch,
    addXp,
    logTaskCompletion,
    updateTimeBlocks,
    google: {
      ready: googleReady,
      signedIn: googleSignedIn,
      init: initGoogle,
      signIn: googleSignIn,
      signOut: googleSignOut,
      events: googleEvents,
      refreshEvents: refreshGoogleEvents,
      createEvent: createGoogleEvent
    },
    chatbot: {
      history: chatbotHistory,
      processSummary: processChatbotSummary
    },
    notifications,
    addNotification
  }), [
    state,
    addXp,
    logTaskCompletion,
    updateTimeBlocks,
    googleReady,
    googleSignedIn,
    initGoogle,
    googleSignIn,
    googleSignOut,
    googleEvents,
    refreshGoogleEvents,
    createGoogleEvent,
    chatbotHistory,
    processChatbotSummary,
    notifications,
    addNotification
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export default AppContext;
