import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ResizeViewHelper {

    private mobileView = new BehaviorSubject<boolean>(false);
    private fullScreenView = new BehaviorSubject<boolean>(false);
  
    constructor() {
      this.updateViewStates();
      window.addEventListener('resize', () => this.updateViewStates());
    }
  
    // Updates the view states for mobile and fullscreen views
    private updateViewStates(): void {
      const width = window.innerWidth;
      this.mobileView.next(width < 768);

      const maxWindowWidth = window.screen.width;
      this.fullScreenView.next((width >= (maxWindowWidth * 0.9)) && (width >= 768));
    }
  
    // Expose observables for components to subscribe to
    get isMobileView$(): Observable<boolean> {
      return this.mobileView.asObservable();
    }
  
    get isFullScreenView$(): Observable<boolean> {
      return this.fullScreenView.asObservable();
    }
  }