// Users Redux Slice - Connected to Spring Boot API
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchUsers = createAsyncThunk(
    'users/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/users');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const createUser = createAsyncThunk(
    'users/create',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await api.post('/users', userData);
            // Fetch the created user to get full data
            const userResponse = await api.get(`/users/${response.data.id}`);
            return userResponse.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const updateUser = createAsyncThunk(
    'users/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const toggleUserStatus = createAsyncThunk(
    'users/toggleStatus',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.put(`/users/${id}/toggle-status`);
            return { id, actif: response.data.actif };
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const deleteUser = createAsyncThunk(
    'users/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/users/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchUserById = createAsyncThunk(
    'users/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
};

const userSlice = createSlice({
    name: 'users',
    initialState,
    reducers: {
        setCurrentUser: (state, action) => {
            state.currentUser = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createUser.fulfilled, (state, action) => {
                state.isLoading = false;
                // We will refresh the list via fetchUsers
            })
            .addCase(createUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateUser.fulfilled, (state) => {
                // State update handled by re-fetching
            })
            .addCase(toggleUserStatus.fulfilled, (state) => {
                // State update handled by re-fetching
            })
            .addCase(deleteUser.fulfilled, (state) => {
                // We will refresh the list via fetchUsers
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.currentUser = action.payload;
            });
    },
});

export const { setCurrentUser, clearError } = userSlice.actions;
export default userSlice.reducer;
