import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-word-frequency',
    standalone: true,
    template: `
    <div class="card bg-dark text-light">
      <h3>Word Frequency</h3>
      <ul>
        <li *ngFor="let word of topWords">
          {{ word.key }}: {{ word.value }}
        </li>
      </ul>
    </div>
  `,
    styles: [`
    .card { border: 1px solid #ccc; padding: 1rem; margin: 0.5rem 0; }
    ul { list-style-type: none; padding: 0; }
    li { padding: 0.2rem 0; }
  `],
    imports: [CommonModule]
})
export class WordFrequencyComponent {
    @Input() frequency: { [key: string]: number } = {};

    get topWords() {
        return Object.entries(this.frequency)
            .map(([key, value]) => ({ key, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }
}
