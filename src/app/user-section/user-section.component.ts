import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UserData } from '../models/user.model';
import { Subscription } from 'rxjs';
import { GridsterConfig, GridsterItem, GridType, DisplayGrid, GridsterModule } from 'angular-gridster2';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DataService } from '../services/app-service/data.service';
import { SettingsService, Settings } from '../services/app-service/settings.service';
import { UserProfile } from '../models/user-profile.model';
import { COMPONENTS, ComponentType } from './user-services/user-component.service';
import { expandCollapse, fadeInOut, profileViewAnimation } from '../animations/general.animations';
import { version } from '../general/variables';
import { ProfileService } from './user-services/user-profile.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { TwitchStreamComponent } from './users/twitch-stream.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog.component';
import { ProfileNameDialogComponent } from './dialogs/profile-name-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ChatHistoryComponent } from './users/chat-window/chat-history.component';
import { Dropdown } from 'bootstrap';
import { VodListComponent } from './users/vod-list/vod-list.component';
import { HeatmapDialog } from '../user-dashboard/heatmap-selection/heatmap.dialog';

@Component({
  selector: 'app-user-section',
  standalone: true,
  templateUrl: './user-section.component.html',
  styleUrls: ['./user-section.component.scss'],
  animations: [fadeInOut, expandCollapse, profileViewAnimation],
  imports: [
    CommonModule,
    TwitchStreamComponent,
    RouterModule,
    DragDropModule,
    GridsterModule,
    ChatHistoryComponent,
    VodListComponent
]
})
export class UserSectionComponent implements OnInit, OnDestroy {
  username: string = '';
  chatHistoryUsername: string = '';
  settings: Settings;
  userData: UserData | undefined;
  loading: boolean = true;
  notDismissed: boolean = true;
  showComponentNames: boolean = false;
  info: string = ''; // Error/info messages
  subscriptions: Subscription = new Subscription();
  
  @ViewChild('profileDropdownButton') profileDropdownButton!: ElementRef;
  @ViewChild(VodListComponent) vodListComponent!: VodListComponent;

  version = version;
  components = COMPONENTS; // Unified config array

  gridsterOptions!: GridsterConfig;
  gridsterLayout: Array<GridsterItem & { type: ComponentType }> = [];

  // Profile-related variables
  profiles: UserProfile[] = [];
  activeProfile: UserProfile | undefined;

  constructor(
    private dataService: DataService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private profileService: ProfileService // Added ProfileService injection
  ) {
    this.initializeGridster();
    this.loadProfiles(); // Initialize profiles
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const userParam = params.get('channel');
        if (userParam) {
          this.username = userParam.trim().toLowerCase();
          this.dataService.setUserName(this.username);
        } else {
          this.router.navigate(['']);
        }
      })
    );

    this.settings = this.settingsService.getSettings();
    this.subscriptions.add(
      this.settingsService.settings$.subscribe((s) => {
        this.settings = s;
      })
    );

    this.subscriptions.add(
      this.dataService.chatHistorySubject.subscribe({
        next: (data) => {
          // Need to reset to trigger ngchange
          this.chatHistoryUsername = '';
          setTimeout(() => {
            this.chatHistoryUsername = data;
          }, 100);          
        }
      }));
  }

  ngOnInit(): void {
    if (localStorage.getItem(version + 'dashboard-dismissed')) {
      this.notDismissed = false;
    }
    this.subscriptions.add(
      this.dataService.userDataSubject.subscribe({
        next: (data) => {
          this.userData = data;
          this.loading = false;
        }
      })
    );
    const signalRConnectionSubscription = this.dataService.connectionEstablished.subscribe({
      next: (connected) => {
        if (connected) {
          this.dataService.joinChannel(this.username);
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.add(signalRConnectionSubscription);

    const historicalDataSubscription = this.dataService.historicalDataSubject.subscribe({
      next: (data) => {
        if (data) {
          this.dataService.leaveChannel(this.username);
          this.dataService.setUserData(data.statistics);
        } else {
          this.dataService.joinChannel(this.username);
          this.fetchData();
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
    this.subscriptions.add(historicalDataSubscription);

    this.loading = true;
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.dataService.leaveChannel(this.username);
  }

  // Initialize Gridster options
  initializeGridster() {
    this.gridsterOptions = {
      gridType: GridType.Fit,
      displayGrid: DisplayGrid.OnDragAndResize,
      pushItems: true,
      swap: true,
      draggable: {
        enabled: true,
        ignoreContentClass: 'no-drag',
      },
      resizable: {
        enabled: true,
      },
      itemChangeCallback: this.saveLayoutToProfile.bind(this) // Updated to save to profile
    };
  }

  // Profile handling: Load profiles from ProfileService
  loadProfiles(): void {
    this.profiles = this.profileService.getProfiles();
    const savedProfileName = localStorage.getItem('activeProfile') || 'Complete';
    this.activeProfile = this.profileService.loadProfile(savedProfileName);
    this.loadLayoutFromProfile(); // Load layout from the selected profile
  }

  clearProfiles(): void {
    this.profileService.clearProfiles();
    this.loadProfiles();
  }

  // Switch to a new profile
  switchProfile(profileName: string): void {
    const selectedProfile = this.profileService.loadProfile(profileName);
    if (selectedProfile) {
      this.activeProfile = selectedProfile;
      this.gridsterLayout = selectedProfile.layout;
      localStorage.setItem('activeProfile', profileName);
    }
  }

  // Load layout from the active profile
  loadLayoutFromProfile(): void {
    if (this.activeProfile) {
      this.gridsterLayout = this.activeProfile.layout;
    } else {
      this.gridsterLayout = this.profileService.getCompleteLayout();
    }
  }

  // Save layout to the active profile
  saveLayoutToProfile(): void {
    if (this.activeProfile) {
      this.activeProfile.layout = this.gridsterLayout;
      this.profileService.saveProfile(this.activeProfile);
    }
  }

  addNewProfile(): void {
    const dialogRef = this.dialog.open(ProfileNameDialogComponent, {
      width: '300px',
      data: { title: 'Add New Profile', defaultValue: '' }
    });

    dialogRef.afterClosed().subscribe(newProfileName => {
      if (newProfileName && !this.profiles.find(profile => profile.name === newProfileName)) {
        const newProfile: UserProfile = {
          name: newProfileName,
          layout: this.profileService.getCompleteLayout() // Start with the default layout
        };
        this.profileService.saveProfile(newProfile);
        this.loadProfiles();
      }
    });
  }

  editProfileName(profile: UserProfile): void {
    const dialogRef = this.dialog.open(ProfileNameDialogComponent, {
      width: '300px',
      data: { title: 'Edit Profile Name', defaultValue: profile.name }
    });

    dialogRef.afterClosed().subscribe(newName => {
      if (newName && !this.profiles.find(p => p.name === newName)) {
        profile.name = newName;
        this.profileService.saveProfile(profile);
        this.loadProfiles();
      }
    });
  }

  deleteProfile(profile: UserProfile): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: `Are you sure you want to delete the profile "${profile.name}"?` }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.profileService.deleteProfile(profile.name);
        this.loadProfiles();
      }
    });
  }

  // Toggle components in the layout
  toggleComponent(componentType: ComponentType): void {
    const existingItemIndex = this.gridsterLayout.findIndex(item => item.type === componentType);

    if (existingItemIndex !== -1) {
      this.gridsterLayout.splice(existingItemIndex, 1); // Remove if active
    } else {
      this.gridsterLayout.push({
        cols: 1,
        rows: 1,
        y: 0,
        x: 0,
        type: componentType
      });
    }

    this.saveLayoutToProfile(); // Save layout changes to profile
  }
    
  toggleProfileDropdown() {
    const dropdown = new Dropdown(this.profileDropdownButton.nativeElement);
    dropdown.toggle();
  }

  toggleStream() {
    this.settings.showStream = !this.settings.showStream;
    this.settingsService.setSettings(this.settings);
  }

  resetLayout() {
    this.gridsterLayout = this.profileService.getDefaultProfileByName(this.activeProfile?.name || 'Complete').layout;
    this.saveLayoutToProfile(); // Save reset layout to profile
  }

  showVodModal() {
    if (this.vodListComponent) {
        this.vodListComponent.openModal();
    }
  }

  showHeatmapModal() {    
    this.dialog.open(HeatmapDialog, {
      width: '90%',
      maxWidth: '1200px',
      panelClass: 'heatmap-dialog-container',
      disableClose: true
    });
  }

  isActive(componentType: ComponentType): boolean {
    return this.gridsterLayout.some(item => item.type === componentType);
  }

  // Fetch user data from the service
  fetchData(): void {
    this.subscriptions.add(
      this.dataService.getUserStats(this.username).subscribe({
        next: (data) => {
          this.dataService.setUserData(data);
          this.loading = false;
        },
        error: (err) => {
          this.loading = false;
          this.info = 'An error occurred while fetching data. Please try again later.';
          this.goToDashboard();
        }
      })
    );
  }

  goToDashboard(): void {
    this.router.navigate(['']);
  }

  toggleAnimations(): void {
    const settings = this.settingsService.getSettings();
    settings.showChartAnimations = !settings.showChartAnimations;
    this.settingsService.setSettings(settings);
  }

  saveDismissed(): void {
    this.notDismissed = false;
    localStorage.setItem(version + 'dashboard-dismissed', 'true');
  }
}
