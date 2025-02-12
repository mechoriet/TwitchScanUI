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
import { throttleTime } from 'rxjs/operators';
import { DataService } from '../../../services/app-service/data.service';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GridsterModule } from 'angular-gridster2';
import { messageAnimation } from '../../../animations/general.animations';
import { openStream } from '../../../helper/general.helper';

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
  private subscription: Subscription = new Subscription();
  private readonly retentionTime = 10 * 1000;
  private readonly scrollThreshhold = 100;
  private readonly messageThreshhold = 100;
  private readonly messageThrottleTime = 50;

  constructor(
    private dataService: DataService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2
  ) {
    this.observeForm = this.fb.group({
      observeText: ['', Validators.required],
    });
    this.username = dataService.getUserName();

    // Subscribe to username changes
    const usernameSubscription = this.dataService.userName$.subscribe(
      (username) => {
        this.username = username;
      }
    );
    this.subscription.add(usernameSubscription);
  }

  ngOnInit(): void {
    // Subscribe to chat messages
    const messageSubscription = this.dataService.messageSubject
      .pipe(throttleTime(this.messageThrottleTime))
      .subscribe((message: TwitchChatMessage) => {
        this.handleNewMessage(message);
      })
    this.subscription.add(messageSubscription);

    // Debounce scroll events after short delay to allow DOM to update
    setTimeout(() => {
      const scrollSubscription = fromEvent(
        this.chatMessagesContainer.nativeElement,
        'scroll'
      )
        .pipe(throttleTime(this.messageThrottleTime))
        .subscribe(() => this.onScroll());
      this.subscription.add(scrollSubscription);
    }, 100);
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
  }

  openChat(username: string): void {
    this.dataService.chatHistorySubject.next(username);
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
      this.scrollToBottomIfNeeded();
      this.cdr.markForCheck();
    } else {
      this.retainedMessages.push(message);
      this.trimMessages(this.retainedMessages);
    }

    if (this.containsObservedText((message.chatMessage.username + ': ' + message.chatMessage.message).toLowerCase())) {
      this.highlightObservedMessage(message);
    }

    // Update the counts of observed texts
    this.updateObservedTextCounts();
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

      // Append the emote image HTML
      parts.push(`<img title="${emote.name}" src="${emote.imageUrl}">`);

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

  onAddTextToObserve(): void {
    const text = this.observeForm.value.observeText.trim().toLowerCase();
    if (text) {
      if (!this.observedTexts.has(text)) {
        this.observedTexts.add(text);
      } else {
        // Remove the text if it already exists
        this.removeObservedText(text);
      }
    }
    this.observeForm.reset({ observeText: '' });
    // Recalculate observed text counts
    this.updateObservedTextCounts();
  }

  removeObservedText(text: string): void {
    this.observedTexts.delete(text);
    this.observedMessages = this.observedMessages.filter((m) =>
      !m.chatMessage.message.toLowerCase().includes(text)
    );
  }

  containsObservedText(message: string): boolean {
    return Array.from(this.observedTexts).some((text) =>
      message.toLowerCase().includes(text)
    );
  }

  highlightObservedMessage(message: TwitchChatMessage): void {
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
        return acc + ((message.chatMessage.username + ': ' + message.chatMessage.message).toLowerCase().includes(text) ? 1 : 0);
      }, 0);
      this.observedTextCounts[text] = count;
    });
  }
}
