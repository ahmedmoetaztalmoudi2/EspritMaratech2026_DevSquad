// Reunions Redux Slice - Connected to Spring Boot API
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

export const fetchReunions = createAsyncThunk(
    'reunions/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            let url = '/reunions';
            if (filters.statut) {
                url = `/reunions/statut/${filters.statut}`;
            } else if (filters.projetId) {
                url = `/reunions/projet/${filters.projetId}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const createReunion = createAsyncThunk(
    'reunions/create',
    async (reunionData, { rejectWithValue }) => {
        try {
            const { organisateurId, ...reunion } = reunionData;
            const response = await api.post(`/reunions?organisateurId=${organisateurId}`, reunion);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const updateReunion = createAsyncThunk(
    'reunions/update',
    async ({ id, data, userId }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/reunions/${id}?userId=${userId}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const deleteReunion = createAsyncThunk(
    'reunions/delete',
    async ({ id, userId }, { rejectWithValue }) => {
        try {
            await api.delete(`/reunions/${id}?userId=${userId}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchReunionById = createAsyncThunk(
    'reunions/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/reunions/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const addParticipant = createAsyncThunk(
    'reunions/addParticipant',
    async ({ reunionId, userId }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/reunions/${reunionId}/participants/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const removeParticipant = createAsyncThunk(
    'reunions/removeParticipant',
    async ({ reunionId, userId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/reunions/${reunionId}/participants/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const updateReunionStatut = createAsyncThunk(
    'reunions/updateStatut',
    async ({ id, statut }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/reunions/${id}/statut?statut=${statut}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const addCompteRendu = createAsyncThunk(
    'reunions/addCompteRendu',
    async ({ id, compteRendu }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/reunions/${id}/compte-rendu`, { compteRendu });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchReunionsAVenir = createAsyncThunk(
    'reunions/fetchAVenir',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/reunions/a-venir');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const fetchReunionsDuJour = createAsyncThunk(
    'reunions/fetchDuJour',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/reunions/aujourd-hui');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    reunions: [],
    reunionsAVenir: [],
    reunionsDuJour: [],
    currentReunion: null,
    isLoading: false,
    error: null,
};

const reunionSlice = createSlice({
    name: 'reunions',
    initialState,
    reducers: {
        setCurrentReunion: (state, action) => {
            state.currentReunion = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchReunions.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchReunions.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reunions = action.payload;
            })
            .addCase(fetchReunions.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(createReunion.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createReunion.fulfilled, (state, action) => {
                state.isLoading = false;
                state.reunions.unshift(action.payload);
            })
            .addCase(createReunion.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            .addCase(updateReunion.fulfilled, (state, action) => {
                const index = state.reunions.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reunions[index] = action.payload;
                }
            })
            .addCase(deleteReunion.fulfilled, (state, action) => {
                state.reunions = state.reunions.filter(r => r.id !== action.payload);
            })
            .addCase(fetchReunionById.fulfilled, (state, action) => {
                state.currentReunion = action.payload;
            })
            .addCase(addParticipant.fulfilled, (state, action) => {
                const index = state.reunions.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reunions[index] = action.payload;
                }
            })
            .addCase(removeParticipant.fulfilled, (state, action) => {
                const index = state.reunions.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reunions[index] = action.payload;
                }
            })
            .addCase(updateReunionStatut.fulfilled, (state, action) => {
                const index = state.reunions.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reunions[index] = action.payload;
                }
            })
            .addCase(addCompteRendu.fulfilled, (state, action) => {
                const index = state.reunions.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reunions[index] = action.payload;
                }
            })
            .addCase(fetchReunionsAVenir.fulfilled, (state, action) => {
                state.reunionsAVenir = action.payload;
            })
            .addCase(fetchReunionsDuJour.fulfilled, (state, action) => {
                state.reunionsDuJour = action.payload;
            });
    },
});

export const { setCurrentReunion, clearError } = reunionSlice.actions;
export default reunionSlice.reducer;
