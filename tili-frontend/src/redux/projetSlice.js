import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Fetch all projets from API
export const fetchProjets = createAsyncThunk(
    'projets/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            let url = '/projets';
            if (filters.statut) {
                url = `/projets/statut/${filters.statut}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Create projet
export const createProjet = createAsyncThunk(
    'projets/create',
    async (projetData, { rejectWithValue }) => {
        try {
            const { chefProjetId, ...projet } = projetData;
            const response = await api.post(`/projets?chefProjetId=${chefProjetId}`, projet);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Update projet
export const updateProjet = createAsyncThunk(
    'projets/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/projets/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Update projet progress
export const updateProjetProgress = createAsyncThunk(
    'projets/updateProgress',
    async ({ id, pourcentage }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/projets/${id}/avancement?pourcentage=${pourcentage}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Delete projet
export const deleteProjet = createAsyncThunk(
    'projets/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/projets/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Get projet by ID
export const fetchProjetById = createAsyncThunk(
    'projets/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/projets/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Add member to projet
export const addMembreToProjet = createAsyncThunk(
    'projets/addMembre',
    async ({ projetId, userId }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/projets/${projetId}/membres/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Remove member from projet
export const removeMembreFromProjet = createAsyncThunk(
    'projets/removeMembre',
    async ({ projetId, userId }, { rejectWithValue }) => {
        try {
            const response = await api.delete(`/projets/${projetId}/membres/${userId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Update projet status
export const updateProjetStatut = createAsyncThunk(
    'projets/updateStatut',
    async ({ id, statut }, { rejectWithValue }) => {
        try {
            const response = await api.patch(`/projets/${id}/statut?statut=${statut}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Search projets
export const searchProjets = createAsyncThunk(
    'projets/search',
    async (keyword, { rejectWithValue }) => {
        try {
            const response = await api.get(`/projets/search?keyword=${keyword}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Fetch Project Requests
export const fetchProjectRequests = createAsyncThunk(
    'projets/fetchRequests',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/projets/requests');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Create Project Request
export const createProjectRequest = createAsyncThunk(
    'projets/createRequest',
    async (requestTags, { rejectWithValue }) => {
        try {
            const response = await api.post('/projets/requests', requestTags);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Accept Project Request
export const acceptProjectRequest = createAsyncThunk(
    'projets/acceptRequest',
    async (requestData, { rejectWithValue }) => {
        try {
            // Assuming requestData is the request object itself or contains the ID
            // The component passes 'record' which is the request object
            const id = requestData.id;
            const response = await api.post(`/projets/requests/${id}/accept`);
            return { requestId: id, newProject: response.data }; // Return both to update state
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Reject Project Request
export const rejectProjectRequest = createAsyncThunk(
    'projets/rejectRequest',
    async (id, { rejectWithValue }) => {
        try {
            await api.post(`/projets/requests/${id}/reject`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Get projets en retard
export const fetchProjetsEnRetard = createAsyncThunk(
    'projets/fetchEnRetard',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/projets/en-retard');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    projets: [],
    currentProjet: null,
    projetsEnRetard: [],
    requests: [],
    isLoading: false,
    error: null,
};

const projetSlice = createSlice({
    name: 'projets',
    initialState,
    reducers: {
        setCurrentProjet: (state, action) => {
            state.currentProjet = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Projets
            .addCase(fetchProjets.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchProjets.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projets = action.payload;
            })
            .addCase(fetchProjets.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create Projet
            .addCase(createProjet.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createProjet.fulfilled, (state, action) => {
                state.isLoading = false;
                state.projets.unshift(action.payload);
            })
            .addCase(createProjet.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update Projet
            .addCase(updateProjet.fulfilled, (state, action) => {
                const index = state.projets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.projets[index] = action.payload;
                }
            })
            // Update Progress
            .addCase(updateProjetProgress.fulfilled, (state, action) => {
                const index = state.projets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.projets[index] = action.payload;
                }
            })
            // Delete Projet
            .addCase(deleteProjet.fulfilled, (state, action) => {
                state.projets = state.projets.filter(p => p.id !== action.payload);
            })
            // Fetch by ID
            .addCase(fetchProjetById.fulfilled, (state, action) => {
                state.currentProjet = action.payload;
            })
            // Add membre
            .addCase(addMembreToProjet.fulfilled, (state, action) => {
                const index = state.projets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.projets[index] = action.payload;
                }
            })
            // Remove membre
            .addCase(removeMembreFromProjet.fulfilled, (state, action) => {
                const index = state.projets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.projets[index] = action.payload;
                }
            })
            // Update statut
            .addCase(updateProjetStatut.fulfilled, (state, action) => {
                const index = state.projets.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.projets[index] = action.payload;
                }
            })
            // Search
            .addCase(searchProjets.fulfilled, (state, action) => {
                state.projets = action.payload;
            })
            // Fetch en retard
            .addCase(fetchProjetsEnRetard.fulfilled, (state, action) => {
                state.projetsEnRetard = action.payload;
            })
            // Requests
            .addCase(fetchProjectRequests.fulfilled, (state, action) => {
                state.requests = action.payload;
            })
            .addCase(createProjectRequest.fulfilled, (state, action) => {
                state.requests.unshift(action.payload);
            })
            .addCase(acceptProjectRequest.fulfilled, (state, action) => {
                state.requests = state.requests.filter(r => r.id !== action.payload.requestId);
                if (action.payload.newProject) {
                    state.projets.unshift(action.payload.newProject);
                }
            })
            .addCase(rejectProjectRequest.fulfilled, (state, action) => {
                state.requests = state.requests.filter(r => r.id !== action.payload);
            });
    },
});

export const { setCurrentProjet, clearError } = projetSlice.actions;
export default projetSlice.reducer;
