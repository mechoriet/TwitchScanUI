import { trigger, transition, query, style, stagger, animate, state } from '@angular/animations';

export const moveAnimation = trigger('moveAnimation', [
  transition('void => *', []), // Prevent animation on load
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      stagger('100ms', [
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true }),
    query(':enter', [
      style({ position: 'relative' }),
      animate('300ms ease-out')
    ], { optional: true }),
    query(':self', [
      animate('300ms ease-in-out', style({ transform: 'translateY(0)' }))
    ], { optional: true })
  ])
]);

export const listAnimation = trigger('listAnimation', [
  transition('* <=> *', [
    // Entering elements
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(-20px)' }),
      stagger('80ms', [
        animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true }),
  ])
]);

export const fadeOut = trigger('fadeOut', [
  state('void', style({
    opacity: 1
  })),
  transition(':leave', [
    animate('300ms ease-in-out', style({ opacity: 0 }))
  ])
])

export const fadeIn = trigger('fadeIn', [
  state('void', style({
    opacity: 0
  })),
  transition(':enter', [
    animate('300ms ease-in-out', style({ opacity: 1 }))
  ])
])

export const fadeInOut = trigger('fadeInOut', [
  state('void', style({
    opacity: 0
  })),
  transition(':enter, :leave', [
    animate('300ms ease-in-out')
  ])
])

export const fadeInOutSlow = trigger('fadeInOutSlow', [
  state('void', style({
    height: '0px',
    opacity: 0
  })),
  transition(':enter, :leave', [
    animate('600ms ease-in-out')
  ])
])

export const fadeInOutFast = trigger('fadeInOutFast', [
  state('void', style({
    opacity: 0
  })),
  transition(':enter, :leave', [
    animate('150ms ease-in-out')
  ])
])

export const expandCollapse = trigger('expandCollapse', [
  state('collapsed', style({
    height: '0px',
    opacity: 0,
    padding: '0px',
    overflow: 'hidden'
  })),
  state('expanded', style({
    height: '*',
    opacity: 1,
    overflow: 'hidden'
  })),
  transition('collapsed <=> expanded', [
    animate('300ms ease-in-out')
  ])
]);

export const messageAnimation = trigger('messageAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(20px)' }),
    animate(
      '350ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 1, transform: 'translateY(0)' })
    )
  ])
]);

export const profileViewAnimation = trigger('profileViewAnimation', [
  transition(':enter', [
    style({ opacity: 0}),
    animate(
      '350ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 1 })
    )
  ]),
  transition(':leave', [
    animate(
      '350ms cubic-bezier(0.25, 0.8, 0.25, 1)',
      style({ opacity: 0 })
    )
  ])
]);
