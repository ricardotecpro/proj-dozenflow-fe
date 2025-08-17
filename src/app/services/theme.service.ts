import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private renderer: Renderer2;
  private currentTheme: 'light' | 'dark';

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.currentTheme = this.getInitialTheme();
    this.applyTheme(this.currentTheme);
  }

  private getInitialTheme(): 'light' | 'dark' {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (storedTheme) {
      return storedTheme;
    }
    // Fallback para a preferência do sistema do usuário
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  isDarkMode(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(this.currentTheme);
    localStorage.setItem('theme', this.currentTheme);
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    this.renderer.removeClass(document.body, 'dark-theme'); // Limpa o estado anterior
    if (theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
    }
  }
}
