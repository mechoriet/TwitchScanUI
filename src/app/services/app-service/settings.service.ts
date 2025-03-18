import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export class Settings {
    showChartAnimations: any | false = false;
    showStream = false;
    streamWidth = 400;
    streamHeight = 300;
    streamPosition = { x: 100, y: 100 };

    setAnimation() {
        this.showChartAnimations = {
            duration: 1000,
            easing: 'easeInOutQuart',
          };
    }

    constructor() {
    }
}

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
    private settings = new Settings();
    private settingsSubject = new BehaviorSubject<Settings>(this.settings);

    settings$ = this.settingsSubject.asObservable();

    getSettings(): Settings {
        return this.settingsSubject.getValue();
    }

    setSettings(settings: Settings): void {
        if (settings.showChartAnimations && settings.setAnimation) {
            settings.setAnimation();
        }
        this.settings = settings;
        this.settingsSubject.next(this.settings);
        this.saveSettings();
    }
    
    constructor() {
        const storedSettings = localStorage.getItem('settings');
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            if (!settings.setAnimation) {
                let newSettings = new Settings();
                newSettings = { ...newSettings, ...settings };
                this.setSettings(newSettings);
                return;
            }
            this.setSettings(JSON.parse(storedSettings));
        }
    }
    
    saveSettings(): void {
        localStorage.setItem('settings', JSON.stringify(this.getSettings()));
    }
}
