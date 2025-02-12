import { GridsterItem } from 'angular-gridster2';
import { ComponentType } from '../user-section/user-services/user-component.service';

export interface UserProfile {
  name: string;
  editing?: boolean;
  layout: Array<GridsterItem & { type: ComponentType }>;
}