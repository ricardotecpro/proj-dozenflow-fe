import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-theme-toggle',
  imports: [CommonModule, MatSlideToggleModule, MatIconModule],
  templateUrl: './theme-toggle.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./theme-toggle.component.scss'],
})
export class ThemeToggleComponent {
  isDarkMode$: Observable<boolean>;

  constructor(private themeService: ThemeService) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  onThemeChange(isDark: boolean): void {
    this.themeService.setDarkMode(isDark);
  }
}
