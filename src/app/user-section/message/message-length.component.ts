import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-average-message-length',
  standalone: true,
  template: `
    <div class="card bg-dark text-light">
      <h3>Average Message Length</h3>
      <p>{{ length.toFixed(2) }}</p>
    </div>
  `,
  styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
  `]
})
export class AverageMessageLengthComponent {
  @Input() length!: number;
}