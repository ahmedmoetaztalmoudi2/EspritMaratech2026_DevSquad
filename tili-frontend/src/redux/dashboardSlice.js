// Dashboard Redux Slice - Connected to Spring Boot API
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchDashboardStats = createAsyncThunk(
    'dashboard/fetchStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/stats');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchProjetsRecents = createAsyncThunk(
    'dashboard/fetchProjetsRecents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/projets-recents');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchReunionsAVenir = createAsyncThunk(
    'dashboard/fetchReunionsAVenir',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/reunions-a-venir');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchDocumentsRecents = createAsyncThunk(
    'dashboard/fetchDocumentsRecents',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/documents-recents');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchProjetsEnRetard = createAsyncThunk(
    'dashboard/fetchProjetsEnRetard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/dashboard/projets-en-retard');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    stats: {
        totalUsers: 0,
        totalDocuments: 0,
        totalProjets: 0,
        totalReunions: 0,
        projetsActifs: 0,
        reunionsAVenir: 0,
        documentsByType: [],
        projetsByStatut: [],
        usersByRole: [],
    },
    projetsRecents: [],
    reunionsAVenir: [],
    documentsRecents: [],
    projetsEnRetard: [],
    isLoading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: 'dashboard',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Stats
            .addCase(fetchDashboardStats.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.isLoading = false;
                state.stats = action.payload;
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Projets recents
            .addCase(fetchProjetsRecents.fulfilled, (state, action) => {
                state.projetsRecents = action.payload;
            })
            // Reunions a venir
            .addCase(fetchReunionsAVenir.fulfilled, (state, action) => {
                state.reunionsAVenir = action.payload;
            })
            // Documents recents
            .addCase(fetchDocumentsRecents.fulfilled, (state, action) => {
                state.documentsRecents = action.payload;
            })
            // Projets en retard
            .addCase(fetchProjetsEnRetard.fulfilled, (state, action) => {
                state.projetsEnRetard = action.payload;
            });
    },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
