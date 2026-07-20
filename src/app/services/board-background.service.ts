import { DOCUMENT, Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';

const STORAGE_KEY = 'boardBackground';

export interface BoardBackgroundOption {
  id: string;
  name: string;
  /** null = usa o fundo padrão do tema (sem override). */
  color: string | null;
}

interface BoardSettingsDTO {
  backgroundColorId: string | null;
  hasBackgroundImage: boolean;
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

// Padrão quando o usuário nunca escolheu uma cor: Ocean Blue, igual ao azul
// clássico dos boards de exemplo do Trello, em vez de um fundo preto liso.
const DEFAULT_BACKGROUND_ID = 'ocean';

// URL estática (recurso singleton, sem id) — não é uma chamada HTTP, é
// usada direto como valor de --board-background-image / <img src>.
export const BOARD_BACKGROUND_IMAGE_URL = `${environment.apiUrl}/board-settings/background-image`;

@Injectable({
  providedIn: 'root',
})
export class BoardBackgroundService {
  private apiUrl = `${environment.apiUrl}/board-settings`;

  private readonly _selectedId = new BehaviorSubject<string>(DEFAULT_BACKGROUND_ID);
  readonly selectedId$ = this._selectedId.asObservable();

  private readonly _hasImage = new BehaviorSubject<boolean>(false);
  readonly hasImage$ = this._hasImage.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private http: HttpClient,
    private notificationService: NotificationService,
  ) {
    this.loadInitial();
  }

  select(id: string): void {
    const option = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === id) ?? BOARD_BACKGROUND_OPTIONS[0];
    this.apply(option);
    this._hasImage.next(false);
    this.http.put<BoardSettingsDTO>(this.apiUrl, { backgroundColorId: option.id }).subscribe({
      error: () => this.notificationService.error('Não foi possível salvar a cor do fundo.'),
    });
  }

  uploadBackgroundImage(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.http.post<BoardSettingsDTO>(`${this.apiUrl}/background-image`, formData).subscribe({
      next: () => this.applyImage(),
      error: () => this.notificationService.error('Não foi possível enviar a imagem de fundo.'),
    });
  }

  removeBackgroundImage(): void {
    const fallback =
      BOARD_BACKGROUND_OPTIONS.find((o) => o.id === this._selectedId.value) ?? BOARD_BACKGROUND_OPTIONS[0];
    this.apply(fallback);
    this._hasImage.next(false);
    this.http.delete<BoardSettingsDTO>(`${this.apiUrl}/background-image`).subscribe({
      error: () => this.notificationService.error('Não foi possível remover a imagem de fundo.'),
    });
  }

  private loadInitial(): void {
    const storedId = localStorage.getItem(STORAGE_KEY);
    const fallback = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === DEFAULT_BACKGROUND_ID)!;
    const option = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === storedId) ?? fallback;
    this.apply(option);

    this.http.get<BoardSettingsDTO>(this.apiUrl).subscribe({
      next: (settings) => this.reconcile(settings),
      error: () => {
        // Sem conexão com o backend ainda: mantém o fundo aplicado a partir
        // do cache local (fast path) até a próxima chance de sincronizar.
      },
    });
  }

  private reconcile(settings: BoardSettingsDTO): void {
    if (settings.hasBackgroundImage) {
      this.applyImage();
      return;
    }

    const colorId = settings.backgroundColorId ?? DEFAULT_BACKGROUND_ID;
    const option = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === colorId) ?? BOARD_BACKGROUND_OPTIONS[0];
    this.apply(option);
    localStorage.setItem(STORAGE_KEY, option.id);
    this._hasImage.next(false);
  }

  private apply(option: BoardBackgroundOption): void {
    this._selectedId.next(option.id);
    localStorage.setItem(STORAGE_KEY, option.id);
    this.document.body.style.removeProperty('--board-background-image');
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

  private applyImage(): void {
    this.document.body.style.setProperty('--board-background-image', `url(${BOARD_BACKGROUND_IMAGE_URL})`);
    this.document.body.style.setProperty('--board-foreground', '#ffffff');
    this._hasImage.next(true);
  }
}
