import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  AfterViewChecked,
  Renderer2,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ChatHistory, Emote, TwitchChatMessage } from '../../../models/chat-message.model';
import { Subscription, timer, fromEvent } from 'rxjs';
import { throttleTime, debounceTime } from 'rxjs/operators';
import { DataService } from '../../../services/app-service/data.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GridsterModule } from 'angular-gridster2';
import { messageAnimation } from '../../../animations/general.animations';
import { openStream } from '../../../helper/general.helper';

interface ObservedTextCount {
  text: string;
  count: number;
}

@Component({
  selector: 'app-chat-window',
  standalone: true,
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ScrollingModule, GridsterModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [messageAnimation]
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
  username: string;
  @ViewChild('chatMessagesContainer') private chatMessagesContainer!: ElementRef;
  chatMessages: TwitchChatMessage[] = [];
  retainedMessages: TwitchChatMessage[] = [];
  observedMessages: TwitchChatMessage[] = [];
  observeForm: FormGroup;
  observedTexts: Set<string> = new Set<string>();
  observedTextCounts: { [key: string]: number } = {};
  isScrolledToBottom = true;
  loading = false;
  
  private subscription: Subscription = new Subscription();
  private readonly retentionTime = 20 * 1000; // Increased retention time for better UX
  private readonly scrollThreshhold = 150;
  private readonly messageThreshhold = 150; // Increased message threshold 
  private readonly messageThrottleTime = 50;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.observeForm = this.fb.group({
      observeText: ['', [Validators.required, Validators.minLength(2)]],
    });
    this.username = dataService.getUserName();

    // Subscribe to username changes
    const usernameSubscription = this.dataService.userName$.subscribe(
      (username) => {
        this.username = username;
        this.cdr.markForCheck();
      }
    );
    this.subscription.add(usernameSubscription);
  }

  ngOnInit(): void {
    // Subscribe to chat messages
    const messageSubscription = this.dataService.messageSubject
      .pipe(throttleTime(this.messageThrottleTime))
      .subscribe((message: TwitchChatMessage) => {
        // Add timestamp if not present
        if (!message.time) {
          message.time = new Date();
        }
        this.handleNewMessage(message);
      });
    this.subscription.add(messageSubscription);

    // Debounce scroll events
    setTimeout(() => {
      const scrollSubscription = fromEvent(
        this.chatMessagesContainer.nativeElement,
        'scroll'
      )
        .pipe(
          throttleTime(100),
          debounceTime(150)
        )
        .subscribe(() => this.onScroll());
      this.subscription.add(scrollSubscription);
    }, 100);

    // Update observed text counts periodically
    const countUpdateSubscription = timer(0, 10000).subscribe(() => {
      this.updateObservedTextCounts();
      this.cdr.markForCheck();
    });
    this.subscription.add(countUpdateSubscription);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngAfterViewChecked(): void {
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
    
    this.cdr.markForCheck();
  }

  openChat(username: string): void {
    this.dataService.chatHistorySubject.next(username);
  }

  scrollToBottom(): void {
    const element = this.chatMessagesContainer.nativeElement;
    this.renderer.setProperty(element, 'scrollTop', element.scrollHeight);
    this.isScrolledToBottom = true;
    this.mergeRetainedMessages();
    this.cdr.markForCheck();
  }

  // Format timestamp for UI display
  formatTimestamp(timestamp: Date): string {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  onAddTextToObserve(): void {
    if (this.observeForm.invalid) return;
    
    const text = this.observeForm.value.observeText.trim().toLowerCase();
    if (text) {
      this.loading = true;
      
      // Simulated delay for better UX
      setTimeout(() => {
        if (!this.observedTexts.has(text)) {
          this.observedTexts.add(text);
          
          // Find and highlight existing messages that match the new observed text
          this.chatMessages.forEach(message => {
            const messageContent = (message.chatMessage.username + ': ' + message.chatMessage.message).toLowerCase();
            if (messageContent.includes(text) && !this.observedMessages.includes(message)) {
              this.highlightObservedMessage(message);
            }
          });
        } else {
          // Remove the text if it already exists
          this.removeObservedText(text);
        }
        
        this.updateObservedTextCounts();
        this.observeForm.reset({ observeText: '' });
        this.loading = false;
        this.cdr.markForCheck();
      }, 300);
    }
  }

  removeObservedText(text: string): void {
    this.observedTexts.delete(text);
    
    // Re-evaluate all observed messages
    const textsArray = Array.from(this.observedTexts);
    this.observedMessages = this.observedMessages.filter((message) => {
      const messageContent = (message.chatMessage.username + ': ' + message.chatMessage.message).toLowerCase();
      return textsArray.some(observedText => messageContent.includes(observedText));
    });
    
    this.updateObservedTextCounts();
    this.cdr.markForCheck();
  }

  containsObservedText(message: string): boolean {
    const lowerCaseMessage = message.toLowerCase();
    return Array.from(this.observedTexts).some((text) =>
      lowerCaseMessage.includes(text)
    );
  }

  private scrollToBottomIfNeeded(): void {
    if (this.isScrolledToBottom) {
      this.scrollToBottom();
    }
  }

  private mergeRetainedMessages(): void {
    if (this.retainedMessages.length === 0) return;
    
    this.chatMessages.push(...this.retainedMessages);
    this.trimMessages(this.chatMessages);
    this.retainedMessages = [];
    this.cdr.markForCheck();
  }

  private trimMessages(array: TwitchChatMessage[]): void {
    if (array.length > this.messageThreshhold) {
      array.splice(0, array.length - this.messageThreshhold);
    }
  }

  private handleNewMessage(message: TwitchChatMessage): void {
    if (message.chatMessage.emotes && message.chatMessage.emotes.length > 0) {
      message.chatMessage.message = this.replaceEmotesWithImages(message.chatMessage.message, message.chatMessage.emotes);
    }

    if (this.isScrolledToBottom) {
      this.chatMessages.push(message);
      this.trimMessages(this.chatMessages);
      this.cdr.markForCheck();
    } else {
      this.retainedMessages.push(message);
      this.trimMessages(this.retainedMessages);
    }

    if (this.containsObservedText((message.chatMessage.username + ': ' + message.chatMessage.message).toLowerCase())) {
      this.highlightObservedMessage(message);
    }
  }

  private highlightObservedMessage(message: TwitchChatMessage): void {
    // Check if this message is already observed
    if (this.observedMessages.some(m => 
        m.chatMessage.username === message.chatMessage.username && 
        m.chatMessage.message === message.chatMessage.message && 
        m.time === message.time)) {
      return;
    }
    
    this.observedMessages.push(message);
    this.cdr.markForCheck();

    // Remove the highlighted message after retentionTime
    timer(this.retentionTime).subscribe(() => {
      this.observedMessages = this.observedMessages.filter(
        (m) => m !== message
      );
      this.cdr.markForCheck();
    });
  }

  private replaceEmotesWithImages(messageText: string, emotes: Emote[]): string {
    let parts: string[] = [];
    let lastIndex = 0;

    // Sort emotes by startIndex to ensure correct order when replacing
    emotes.sort((a, b) => a.startIndex - b.startIndex);

    emotes.forEach(emote => {
      // Append the part of the messageText before the emote
      if (lastIndex < emote.startIndex) {
        parts.push(messageText.substring(lastIndex, emote.startIndex));
      }

      // Append the emote image HTML with better styling
      parts.push(`<img class="emote" alt="${emote.name}" title="${emote.name}" src="${emote.imageUrl}">`);

      // Update lastIndex to the character after the current emote
      lastIndex = emote.endIndex + 1;
    });

    // Append the remaining part of the messageText after the last emote
    if (lastIndex < messageText.length) {
      parts.push(messageText.substring(lastIndex));
    }

    // Join all parts into the final modified message
    return parts.join('');
  }

  private updateObservedTextCounts(): void {
    // Only update if there are any observed texts
    if (this.observedTexts.size === 0) {
      this.observedTextCounts = {};
      return;
    }
    
    const allMessages = [...this.chatMessages, ...this.retainedMessages];
    
    this.observedTexts.forEach((text) => {
      const count = allMessages.reduce((acc, message) => {
        const messageContent = (message.chatMessage.username + ': ' + message.chatMessage.message).toLowerCase();
        return acc + (messageContent.includes(text) ? 1 : 0);
      }, 0);
      this.observedTextCounts[text] = count;
    });
  }
}