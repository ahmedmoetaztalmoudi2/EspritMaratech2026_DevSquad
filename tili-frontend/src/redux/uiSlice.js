import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    isDarkMode: localStorage.getItem('isDarkMode') === 'true',
    isVoiceActive: false,
};

export const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleDarkMode: (state) => {
            state.isDarkMode = !state.isDarkMode;
            localStorage.setItem('isDarkMode', state.isDarkMode);
        },
        toggleVoiceActive: (state) => {
            state.isVoiceActive = !state.isVoiceActive;
        },
    },
});

export const { toggleDarkMode, toggleVoiceActive } = uiSlice.actions;
export default uiSlice.reducer;
