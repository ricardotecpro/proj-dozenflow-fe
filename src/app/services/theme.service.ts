import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private readonly _isDarkMode = new BehaviorSubject<boolean>(false);
  readonly isDarkMode$ = this._isDarkMode.asObservable();

  constructor(
    @Inject(DOCUMENT) private document: Document,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadInitialTheme();
  }

  private loadInitialTheme(): void {
    const storedPreference = localStorage.getItem('isDarkMode');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initialDarkMode = storedPreference !== null ? storedPreference === 'true' : !!prefersDark;
    this.setDarkMode(initialDarkMode);
  }

  setDarkMode(isDark: boolean): void {
    this._isDarkMode.next(isDark);
    localStorage.setItem('isDarkMode', String(isDark));
    if (isDark) {
      this.renderer.addClass(this.document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(this.document.body, 'dark-theme');
    }
  }
}
