// Notifications Redux Slice - Connected to Spring Boot API
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchNotifications = createAsyncThunk(
    'notifications/fetchAll',
    async (userId, { rejectWithValue }) => {
        try {
            const url = userId ? `/notifications/user/${userId}` : '/notifications';
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchUnreadNotifications = createAsyncThunk(
    'notifications/fetchUnread',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/notifications/user/${userId}/unread`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchUnreadCount = createAsyncThunk(
    'notifications/fetchUnreadCount',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/notifications/user/${userId}/count`);
            return response.data.unreadCount;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const markAsRead = createAsyncThunk(
    'notifications/markAsRead',
    async (id, { rejectWithValue }) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const markAllAsRead = createAsyncThunk(
    'notifications/markAllAsRead',
    async (userId, { rejectWithValue }) => {
        try {
            await api.patch(`/notifications/user/${userId}/read-all`);
            return true;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const deleteNotification = createAsyncThunk(
    'notifications/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/notifications/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.unreadCount += 1;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.isLoading = false;
                state.notifications = action.payload;
                state.unreadCount = action.payload.filter(n => !n.lu).length;
            })
            .addCase(fetchNotifications.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
                state.notifications = action.payload;
                state.unreadCount = action.payload.length;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markAsRead.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification && !notification.lu) {
                    notification.lu = true;
                    state.unreadCount -= 1;
                }
            })
            .addCase(markAllAsRead.fulfilled, (state) => {
                state.notifications.forEach(n => { n.lu = true; });
                state.unreadCount = 0;
            })
            .addCase(deleteNotification.fulfilled, (state, action) => {
                const notification = state.notifications.find(n => n.id === action.payload);
                if (notification && !notification.lu) {
                    state.unreadCount -= 1;
                }
                state.notifications = state.notifications.filter(n => n.id !== action.payload);
            });
    },
});

export const { addNotification, clearError } = notificationSlice.actions;
export default notificationSlice.reducer;
