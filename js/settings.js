// Settings & Preferences Module
const SETTINGS_KEY = 'scontrino_settings_v1';

export class Settings {
    constructor() {
        this.settings = {
            darkMode: false, // Default OFF
            soundEnabled: true,
            hapticEnabled: true,
            highContrast: false
        };
        this.load();
        this.apply();
    }

    load() {
        let stored = null;
        try {
            stored = localStorage.getItem(SETTINGS_KEY);
            if (stored) {
                this.settings = { ...this.settings, ...JSON.parse(stored) };
            }
        } catch (e) {
            console.error('Failed to load settings', e);
        }

        // Removed system preference check to ensure light mode default unless user sets otherwise
    }

    save() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings', e);
        }
    }

    apply() {
        // Apply dark mode
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Apply high contrast
        if (this.settings.highContrast) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }

    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        this.apply();
        this.save();
        return this.settings.darkMode;
    }

    toggleSound() {
        this.settings.soundEnabled = !this.settings.soundEnabled;
        this.save();
        return this.settings.soundEnabled;
    }

    toggleHaptic() {
        this.settings.hapticEnabled = !this.settings.hapticEnabled;
        this.save();
        return this.settings.hapticEnabled;
    }

    get(key) {
        return this.settings[key];
    }
}

export const settings = new Settings();
