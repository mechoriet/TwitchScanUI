import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ChatMessage } from '../../../models/chat-message.model';
import { Subscription, timer, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { DataService } from '../../../services/app-service/data.service';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() username!: string;
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  chatMessages: ChatMessage[] = [];
  retainedMessages: ChatMessage[] = [];
  observedMessages: ChatMessage[] = [];
  observeForm: FormGroup;
  observedTexts: Set<string> = new Set<string>();
  observedTextCounts: { [key: string]: number } = {};
  isScrolledToBottom = true;
  private subscription: Subscription = new Subscription();
  private scrollSubscription: Subscription = new Subscription();
  private readonly retentionTime = 10 * 1000;
  private readonly scrollThreshhold = 100;
  private readonly messageThreshhold = 100;
  private readonly messageDebounceTime = 1000;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private renderer: Renderer2
  ) {
    this.observeForm = this.fb.group({
      observeText: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Subscribe to chat messages
    const messageSubscription = this.dataService.messageSubject.subscribe(
      (message: ChatMessage) => {
        this.handleNewMessage(message);
      }
    );
    this.subscription.add(messageSubscription);
  }

  ngAfterViewChecked(): void {

    // Debounce scroll events
    this.scrollSubscription = fromEvent(
      this.chatMessagesContainer.nativeElement,
      'scroll'
    )
      .pipe(debounceTime(this.messageDebounceTime))
      .subscribe(() => this.onScroll());
    this.subscription.add(this.scrollSubscription);
    this.scrollToBottomIfNeeded();
  }

  onScroll(): void {
    const element = this.chatMessagesContainer.nativeElement;
    const wasScrolledToBottom = this.isScrolledToBottom;
    this.isScrolledToBottom =
      element.scrollHeight <= element.scrollTop + element.clientHeight + this.scrollThreshhold;

    if (!wasScrolledToBottom && this.isScrolledToBottom) {
      this.mergeRetainedMessages();
    }
  }

  scrollToBottom(): void {
    const element = this.chatMessagesContainer.nativeElement;
    this.renderer.setProperty(element, 'scrollTop', element.scrollHeight);
    this.isScrolledToBottom = true;
  }

  private scrollToBottomIfNeeded(): void {
    if (this.isScrolledToBottom) {
      this.scrollToBottom();
    }
  }

  private mergeRetainedMessages(): void {
    this.chatMessages.push(...this.retainedMessages);
    this.trimMessages(this.chatMessages);
    this.retainedMessages = [];
    this.scrollToBottom();
  }

  private trimMessages(array: ChatMessage[]): void {
    if (array.length > this.messageThreshhold) {
      array.splice(0, array.length - this.messageThreshhold);
    }
  }

  private handleNewMessage(message: ChatMessage): void {
    if (this.isScrolledToBottom) {
      this.chatMessages.push(message);
      this.trimMessages(this.chatMessages);
      this.scrollToBottomIfNeeded();
    } else {
      this.retainedMessages.push(message);
      this.trimMessages(this.retainedMessages);
    }

    if (this.containsObservedText(message.chatMessage.displayName + ': ' + message.chatMessage.message)) {
      this.highlightObservedMessage(message);
    }

    // Update the counts of observed texts
    this.updateObservedTextCounts();
  }

  onAddTextToObserve(): void {
    const text = this.observeForm.value.observeText.trim().toLowerCase();
    if (text) {
      if (!this.observedTexts.has(text)) {
        this.observedTexts.add(text);
      } else {
        this.observedTexts.delete(text);
        this.observedMessages = this.observedMessages.filter((m) =>
          !m.chatMessage.message.toLowerCase().includes(text)
        );
      }
    }
    this.observeForm.reset({ observeText: '' });
    // Recalculate observed text counts
    this.updateObservedTextCounts();
  }

  containsObservedText(message: string): boolean {
    return Array.from(this.observedTexts).some((text) =>
      message.toLowerCase().includes(text)
    );
  }

  highlightObservedMessage(message: ChatMessage): void {
    this.observedMessages.push(message);

    // Remove the highlighted message after retentionTime
    timer(this.retentionTime).subscribe(() => {
      this.observedMessages = this.observedMessages.filter(
        (m) => m !== message
      );
    });
  }

  private updateObservedTextCounts(): void {
    this.observedTextCounts = {}; // Reset counts
    this.observedTexts.forEach((text) => {
      const count = this.chatMessages.reduce((acc, message) => {
        return acc + (message.chatMessage.message.toLowerCase().includes(text) ? 1 : 0);
      }, 0);
      this.observedTextCounts[text] = count;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.scrollSubscription) {
      this.scrollSubscription.unsubscribe();
    }
  }
}
