import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ViewPortService {

    private mobileView = new BehaviorSubject<boolean>(false);
    private middleView = new BehaviorSubject<boolean>(false);
    private largeView = new BehaviorSubject<boolean>(false);
    private xLargeView = new BehaviorSubject<boolean>(false);
    private fullScreenView = new BehaviorSubject<boolean>(false);
  
    constructor() {
      this.updateViewStates();
      window.addEventListener('resize', () => this.updateViewStates());
    }
  
    // Updates the view states for mobile and fullscreen views
    private updateViewStates(): void {
      const width = window.innerWidth;
      this.mobileView.next(width < 768);
      this.middleView.next(width < 1024);
      this.largeView.next(width < 1440);
      this.xLargeView.next(width < 1920);

      const maxWindowWidth = window.screen.width;
      this.fullScreenView.next((width >= (maxWindowWidth * 0.9)) && (width >= 768));
    }
  
    // Expose observables for components to subscribe to
    get isMobileView$(): Observable<boolean> {
      return this.mobileView.asObservable();
    }

    get isMiddleView$(): Observable<boolean> {
      return this.middleView.asObservable();
    }

    get isLargeView$(): Observable<boolean> {
      return this.largeView.asObservable();
    }

    get isXLargeView$(): Observable<boolean> {
      return this.xLargeView.asObservable();
    }
  
    get isFullScreenView$(): Observable<boolean> {
      return this.fullScreenView.asObservable();
    }
  }