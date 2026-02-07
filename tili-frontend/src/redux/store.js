// Redux Store Configuration
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import documentReducer from './documentSlice';
import reunionReducer from './reunionSlice';
import projetReducer from './projetSlice';
import notificationReducer from './notificationSlice';
import userReducer from './userSlice';
import dashboardReducer from './dashboardSlice';
import demandeReunionReducer from './demandeReunionSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        documents: documentReducer,
        reunions: reunionReducer,
        projets: projetReducer,
        notifications: notificationReducer,
        users: userReducer,
        dashboard: dashboardReducer,
        demandesReunion: demandeReunionReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export default store;
