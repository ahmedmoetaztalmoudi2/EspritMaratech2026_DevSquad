// Documents Redux Slice - Connected to Spring Boot API
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api/axiosConfig';

// Fetch all documents
export const fetchDocuments = createAsyncThunk(
    'documents/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            let url = '/documents';
            if (filters.type) {
                url = `/documents/type/${filters.type}`;
            } else if (filters.projetId) {
                url = `/documents/projet/${filters.projetId}`;
            } else if (filters.search) {
                url = `/documents/search?keyword=${filters.search}`;
            }
            const response = await api.get(url);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Create document (without file upload)
export const createDocument = createAsyncThunk(
    'documents/create',
    async (documentData, { rejectWithValue }) => {
        try {
            const { uploaderId, ...document } = documentData;
            const response = await api.post(`/documents?uploaderId=${uploaderId}`, document);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Upload document with file
export const uploadDocument = createAsyncThunk(
    'documents/upload',
    async ({ file, titre, description, type, isPublic, projetId, uploaderId }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('titre', titre);
            if (description) formData.append('description', description);
            formData.append('type', type);
            formData.append('isPublic', isPublic || false);
            if (projetId) formData.append('projetId', projetId);
            formData.append('uploaderId', uploaderId);

            const response = await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Update document
export const updateDocument = createAsyncThunk(
    'documents/update',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/documents/${id}`, data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Delete document
export const deleteDocument = createAsyncThunk(
    'documents/delete',
    async (id, { rejectWithValue }) => {
        try {
            await api.delete(`/documents/${id}`);
            return id;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Get document by ID
export const fetchDocumentById = createAsyncThunk(
    'documents/fetchById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await api.get(`/documents/${id}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

// Get public documents
export const fetchDocumentsPublics = createAsyncThunk(
    'documents/fetchPublics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/documents/public');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

const initialState = {
    documents: [],
    currentDocument: null,
    isLoading: false,
    error: null,
};

const documentSlice = createSlice({
    name: 'documents',
    initialState,
    reducers: {
        setCurrentDocument: (state, action) => {
            state.currentDocument = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchDocuments.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchDocuments.fulfilled, (state, action) => {
                state.isLoading = false;
                state.documents = action.payload;
            })
            .addCase(fetchDocuments.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Create
            .addCase(createDocument.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createDocument.fulfilled, (state, action) => {
                state.isLoading = false;
                state.documents.unshift(action.payload);
            })
            .addCase(createDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Upload
            .addCase(uploadDocument.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(uploadDocument.fulfilled, (state, action) => {
                state.isLoading = false;
                state.documents.unshift(action.payload);
            })
            .addCase(uploadDocument.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Update
            .addCase(updateDocument.fulfilled, (state, action) => {
                const index = state.documents.findIndex(d => d.id === action.payload.id);
                if (index !== -1) {
                    state.documents[index] = action.payload;
                }
            })
            // Delete
            .addCase(deleteDocument.fulfilled, (state, action) => {
                state.documents = state.documents.filter(d => d.id !== action.payload);
            })
            // Fetch by ID
            .addCase(fetchDocumentById.fulfilled, (state, action) => {
                state.currentDocument = action.payload;
            })
            // Fetch publics
            .addCase(fetchDocumentsPublics.fulfilled, (state, action) => {
                state.documents = action.payload;
            });
    },
});

export const { setCurrentDocument, clearError } = documentSlice.actions;
export default documentSlice.reducer;
