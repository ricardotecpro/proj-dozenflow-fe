import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.removeItem('isDarkMode');
    document.body.classList.remove('dark-theme');
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.removeItem('isDarkMode');
    document.body.classList.remove('dark-theme');
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('setDarkMode(true) adds the dark-theme class and persists the preference', () => {
    service.setDarkMode(true);

    expect(document.body.classList.contains('dark-theme')).toBeTrue();
    expect(localStorage.getItem('isDarkMode')).toBe('true');
  });

  it('setDarkMode(false) removes the dark-theme class and persists the preference', () => {
    service.setDarkMode(true);
    service.setDarkMode(false);

    expect(document.body.classList.contains('dark-theme')).toBeFalse();
    expect(localStorage.getItem('isDarkMode')).toBe('false');
  });

  it('isDarkMode$ emits the latest value on change', (done) => {
    service.setDarkMode(true);

    service.isDarkMode$.subscribe((isDark) => {
      expect(isDark).toBeTrue();
      done();
    });
  });
});
