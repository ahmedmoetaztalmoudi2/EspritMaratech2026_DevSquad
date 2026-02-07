// Demandes Reunion Redux Slice - Meeting Requests Management
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Fetch all demandes (for admin)
export const fetchAllDemandes = createAsyncThunk(
    'demandesReunion/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/demandes-reunion');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Fetch demandes by demandeur (consultant's own requests)
export const fetchDemandesByDemandeur = createAsyncThunk(
    'demandesReunion/fetchByDemandeur',
    async (demandeurId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/demandes-reunion/demandeur/${demandeurId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Fetch demandes by destinataire (chef de projet's received requests)
export const fetchDemandesByDestinataire = createAsyncThunk(
    'demandesReunion/fetchByDestinataire',
    async (destinataireId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/demandes-reunion/destinataire/${destinataireId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Fetch pending demandes for chef de projet
export const fetchDemandesEnAttente = createAsyncThunk(
    'demandesReunion/fetchEnAttente',
    async (destinataireId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/demandes-reunion/destinataire/${destinataireId}/en-attente`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Count pending demandes
export const fetchCountDemandesEnAttente = createAsyncThunk(
    'demandesReunion/fetchCount',
    async (destinataireId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/demandes-reunion/destinataire/${destinataireId}/count`);
            return response.data.count;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Create demande
export const createDemande = createAsyncThunk(
    'demandesReunion/create',
    async ({ demande, demandeurId, destinataireId }, { rejectWithValue }) => {
        try {
            const response = await api.post(
                `/demandes-reunion?demandeurId=${demandeurId}&destinataireId=${destinataireId}`,
                demande
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Accept demande
export const accepterDemande = createAsyncThunk(
    'demandesReunion/accepter',
    async ({ demandeId, chefProjetId }, { rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/demandes-reunion/${demandeId}/accepter?chefProjetId=${chefProjetId}`
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Refuse demande
export const refuserDemande = createAsyncThunk(
    'demandesReunion/refuser',
    async ({ demandeId, chefProjetId, motifRefus }, { rejectWithValue }) => {
        try {
            const response = await api.patch(
                `/demandes-reunion/${demandeId}/refuser?chefProjetId=${chefProjetId}`,
                { motifRefus }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Create reunion from demande
export const createReunionForDemande = createAsyncThunk(
    'demandesReunion/createReunion',
    async ({ id, reunion }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/demandes-reunion/${id}/create-reunion`, reunion);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Delete demande
export const deleteDemande = createAsyncThunk(
    'demandesReunion/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/demandes-reunion/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    demandes: [],
    mesDemandes: [], // Consultant's own requests
    demandesRecues: [], // Chef de projet's received requests
    pendingCount: 0,
    isLoading: false,
    error: null,
};

const demandeReunionSlice = createSlice({
    name: 'demandesReunion',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch all
            .addCase(fetchAllDemandes.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchAllDemandes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.demandes = action.payload;
            })
            .addCase(fetchAllDemandes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch by demandeur
            .addCase(fetchDemandesByDemandeur.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchDemandesByDemandeur.fulfilled, (state, action) => {
                state.isLoading = false;
                state.mesDemandes = action.payload;
            })
            .addCase(fetchDemandesByDemandeur.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch by destinataire
            .addCase(fetchDemandesByDestinataire.fulfilled, (state, action) => {
                state.demandesRecues = action.payload;
            })
            // Fetch en attente
            .addCase(fetchDemandesEnAttente.fulfilled, (state, action) => {
                state.demandesRecues = action.payload;
                state.pendingCount = action.payload.length;
            })
            // Fetch count
            .addCase(fetchCountDemandesEnAttente.fulfilled, (state, action) => {
                state.pendingCount = action.payload;
            })
            // Create
            .addCase(createDemande.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createDemande.fulfilled, (state, action) => {
                state.isLoading = false;
                state.mesDemandes.unshift(action.payload);
            })
            .addCase(createDemande.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Accept
            .addCase(accepterDemande.fulfilled, (state, action) => {
                const demande = action.payload.demande;
                const index = state.demandesRecues.findIndex(d => d.id === demande.id);
                if (index !== -1) {
                    state.demandesRecues[index] = demande;
                }
                state.pendingCount = Math.max(0, state.pendingCount - 1);
            })
            // Refuse
            .addCase(refuserDemande.fulfilled, (state, action) => {
                const demande = action.payload.demande;
                const index = state.demandesRecues.findIndex(d => d.id === demande.id);
                if (index !== -1) {
                    state.demandesRecues[index] = demande;
                }
                state.pendingCount = Math.max(0, state.pendingCount - 1);
            })
            // Delete
            .addCase(deleteDemande.fulfilled, (state, action) => {
                state.mesDemandes = state.mesDemandes.filter(d => d.id !== action.payload);
                state.demandesRecues = state.demandesRecues.filter(d => d.id !== action.payload);
            });
    },
});

export const { clearError } = demandeReunionSlice.actions;
export default demandeReunionSlice.reducer;
