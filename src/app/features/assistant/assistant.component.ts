import { Component, inject, OnInit, signal, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AssistantService } from '../../core/services/assistant.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

@Component({
  selector: 'app-assistant',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    MatChipsModule, MatDividerModule
  ],
  template: `
    <div class="assistant-page">
      <h2>AI Assistant</h2>
      <p class="subtitle">Ask anything about your business data.</p>

      <mat-card class="chat-card">
        <div class="messages-area" #messagesArea>
          @if (messages().length === 0 && !loadingHistory()) {
            <div class="empty-chat">
              <mat-icon class="empty-icon">smart_toy</mat-icon>
              <p>Hi! I'm your AI assistant. Ask me anything about your SaaSify account.</p>
            </div>
          }
          @if (loadingHistory()) {
            <div class="loading-center"><mat-spinner diameter="32"></mat-spinner></div>
          }
          @for (msg of messages(); track $index) {
            <div class="message-row" [class.user-row]="msg.role === 'user'">
              @if (msg.role === 'assistant') {
                <div class="avatar assistant-avatar">
                  <mat-icon>smart_toy</mat-icon>
                </div>
              }
              <div class="bubble" [class.user-bubble]="msg.role === 'user'" [class.assistant-bubble]="msg.role === 'assistant'">
                <p class="message-text">{{ msg.text }}</p>
                <span class="timestamp">{{ msg.timestamp | date:'shortTime' }}</span>
              </div>
              @if (msg.role === 'user') {
                <div class="avatar user-avatar">
                  <mat-icon>person</mat-icon>
                </div>
              }
            </div>
          }
          @if (thinking()) {
            <div class="message-row">
              <div class="avatar assistant-avatar"><mat-icon>smart_toy</mat-icon></div>
              <div class="bubble assistant-bubble thinking">
                <span class="dot"></span><span class="dot"></span><span class="dot"></span>
              </div>
            </div>
          }
        </div>

        <mat-divider></mat-divider>

        <div class="suggestions">
          @for (chip of suggestions; track chip) {
            <mat-chip (click)="useSuggestion(chip)">{{ chip }}</mat-chip>
          }
        </div>

        <div class="input-area">
          <form [formGroup]="form" (ngSubmit)="sendMessage()" class="input-form">
            <mat-form-field appearance="outline" class="input-field">
              <input matInput formControlName="question" placeholder="Ask a question..." (keydown.enter)="$event.preventDefault(); sendMessage()" />
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit" class="send-btn" [disabled]="thinking() || form.invalid">
              <mat-icon>send</mat-icon>
            </button>
          </form>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .assistant-page { max-width: 800px; }
    h2 { font-size: 1.8rem; margin: 0 0 4px; }
    .subtitle { color: #666; margin: 0 0 24px; }
    .chat-card { border-radius: 16px !important; overflow: hidden; display: flex; flex-direction: column; }
    .messages-area { flex: 1; height: 480px; overflow-y: auto; padding: 20px; display: flex;
      flex-direction: column; gap: 16px; background: #fafafa; }
    .empty-chat { display: flex; flex-direction: column; align-items: center; justify-content: center;
      height: 100%; color: #888; text-align: center; }
    .empty-icon { font-size: 64px; width: 64px; height: 64px; color: #3f51b5; opacity: 0.4; }
    .loading-center { display: flex; justify-content: center; padding: 32px; }
    .message-row { display: flex; align-items: flex-end; gap: 8px; }
    .user-row { flex-direction: row-reverse; }
    .avatar { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center;
      justify-content: center; flex-shrink: 0; }
    .avatar mat-icon { font-size: 20px; width: 20px; height: 20px; color: white; }
    .assistant-avatar { background: #3f51b5; }
    .user-avatar { background: #7c4dff; }
    .bubble { max-width: 70%; padding: 12px 16px; border-radius: 18px; }
    .assistant-bubble { background: white; border-bottom-left-radius: 4px; box-shadow: 0 1px 4px rgba(0,0,0,0.1); }
    .user-bubble { background: #3f51b5; color: white; border-bottom-right-radius: 4px; }
    .message-text { margin: 0 0 4px; line-height: 1.5; white-space: pre-wrap; }
    .timestamp { font-size: 0.7rem; opacity: 0.6; }
    .thinking { display: flex; align-items: center; gap: 4px; padding: 16px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: #3f51b5; opacity: 0.4;
      animation: bounce 1.2s infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-8px); opacity: 1; } }
    .suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px 16px; }
    .suggestions mat-chip { cursor: pointer; font-size: 0.85rem; }
    .input-area { padding: 12px 16px 16px; }
    .input-form { display: flex; gap: 8px; align-items: center; }
    .input-field { flex: 1; }
    .send-btn { height: 56px; width: 56px; min-width: 56px; border-radius: 50% !important; }
  `]
})
export class AssistantComponent implements OnInit, AfterViewChecked {
  private assistantSvc = inject(AssistantService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  @ViewChild('messagesArea') messagesArea!: ElementRef;

  loadingHistory = signal(false);
  thinking = signal(false);
  messages = signal<ChatMessage[]>([]);

  suggestions = [
    'How many customers do I have?',
    "What's my current plan?",
    'Show my recent customers',
    'What features does my plan include?'
  ];

  form = this.fb.group({
    question: ['', Validators.required]
  });

  ngOnInit(): void {
    this.loadingHistory.set(true);
    this.assistantSvc.getHistory().subscribe({
      next: (hist) => {
        const msgs: ChatMessage[] = [];
        for (const h of hist) {
          msgs.push({ role: 'user', text: h.question, timestamp: h.createdAt });
          msgs.push({ role: 'assistant', text: h.answer, timestamp: h.createdAt });
        }
        this.messages.set(msgs);
        this.loadingHistory.set(false);
      },
      error: () => this.loadingHistory.set(false)
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  scrollToBottom(): void {
    try {
      const el = this.messagesArea?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  useSuggestion(text: string): void {
    this.form.patchValue({ question: text });
    this.sendMessage();
  }

  sendMessage(): void {
    if (this.form.invalid || this.thinking()) return;
    const question = this.form.value.question!.trim();
    if (!question) return;

    const now = new Date().toISOString();
    this.messages.update(m => [...m, { role: 'user', text: question, timestamp: now }]);
    this.form.reset();
    this.thinking.set(true);

    this.assistantSvc.ask({ question }).subscribe({
      next: (res) => {
        this.thinking.set(false);
        this.messages.update(m => [...m, { role: 'assistant', text: res.answer, timestamp: res.timestamp }]);
      },
      error: () => {
        this.thinking.set(false);
        this.snackBar.open('Failed to get a response. Try again.', 'Close', { duration: 4000 });
      }
    });
  }
}
