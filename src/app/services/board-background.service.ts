import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'boardBackground';

export interface BoardBackgroundOption {
  id: string;
  name: string;
  /** null = usa o fundo padrão do tema (sem override). */
  color: string | null;
}

// Paleta inspirada nas cores clássicas de fundo de board do Trello.
export const BOARD_BACKGROUND_OPTIONS: BoardBackgroundOption[] = [
  { id: 'default', name: 'Padrão', color: null },
  { id: 'ocean', name: 'Ocean Blue', color: '#0079bf' },
  { id: 'orange', name: 'Sunny Orange', color: '#d29034' },
  { id: 'green', name: 'Forest Green', color: '#519839' },
  { id: 'red', name: 'Berry Red', color: '#b04632' },
  { id: 'purple', name: 'Grape Purple', color: '#89609e' },
  { id: 'pink', name: 'Bubblegum Pink', color: '#cd5a91' },
  { id: 'slate', name: 'Slate', color: '#838c91' },
];

@Injectable({
  providedIn: 'root',
})
export class BoardBackgroundService {
  private readonly _selectedId = new BehaviorSubject<string>(BOARD_BACKGROUND_OPTIONS[0].id);
  readonly selectedId$ = this._selectedId.asObservable();

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.loadInitial();
  }

  private loadInitial(): void {
    const storedId = localStorage.getItem(STORAGE_KEY);
    const option = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === storedId) ?? BOARD_BACKGROUND_OPTIONS[0];
    this.apply(option);
  }

  select(id: string): void {
    const option = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === id) ?? BOARD_BACKGROUND_OPTIONS[0];
    this.apply(option);
  }

  private apply(option: BoardBackgroundOption): void {
    this._selectedId.next(option.id);
    localStorage.setItem(STORAGE_KEY, option.id);
    if (option.color) {
      this.document.body.style.setProperty('--board-background', option.color);
      // Todas as swatches são saturadas o bastante para texto/ícones brancos
      // em cima, igual ao header do Trello sobre a cor do board.
      this.document.body.style.setProperty('--board-foreground', '#ffffff');
    } else {
      this.document.body.style.removeProperty('--board-background');
      this.document.body.style.removeProperty('--board-foreground');
    }
  }
}
