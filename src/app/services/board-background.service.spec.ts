import { TestBed } from '@angular/core/testing';
import { BOARD_BACKGROUND_OPTIONS, BoardBackgroundService } from './board-background.service';

describe('BoardBackgroundService', () => {
  let service: BoardBackgroundService;

  beforeEach(() => {
    localStorage.removeItem('boardBackground');
    document.body.style.removeProperty('--board-background');
    document.body.style.removeProperty('--board-foreground');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem('boardBackground');
    document.body.style.removeProperty('--board-background');
    document.body.style.removeProperty('--board-foreground');
  });

  it('is created and applies the default (no override) on init', () => {
    service = TestBed.inject(BoardBackgroundService);

    expect(service).toBeTruthy();
    expect(document.body.style.getPropertyValue('--board-background')).toBe('');
    expect(document.body.style.getPropertyValue('--board-foreground')).toBe('');
  });

  it('select() with a color option sets --board-background/--board-foreground and persists the id', () => {
    service = TestBed.inject(BoardBackgroundService);
    const ocean = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === 'ocean')!;

    service.select('ocean');

    expect(document.body.style.getPropertyValue('--board-background')).toBe(ocean.color!);
    expect(document.body.style.getPropertyValue('--board-foreground')).toBe('#ffffff');
    expect(localStorage.getItem('boardBackground')).toBe('ocean');
  });

  it('select("default") removes the --board-background/--board-foreground overrides', () => {
    service = TestBed.inject(BoardBackgroundService);
    service.select('ocean');

    service.select('default');

    expect(document.body.style.getPropertyValue('--board-background')).toBe('');
    expect(document.body.style.getPropertyValue('--board-foreground')).toBe('');
    expect(localStorage.getItem('boardBackground')).toBe('default');
  });

  it('loads a previously stored selection on init', () => {
    localStorage.setItem('boardBackground', 'green');

    service = TestBed.inject(BoardBackgroundService);

    const green = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === 'green')!;
    expect(document.body.style.getPropertyValue('--board-background')).toBe(green.color!);
  });

  it('falls back to default for an unknown stored id', () => {
    localStorage.setItem('boardBackground', 'not-a-real-option');

    service = TestBed.inject(BoardBackgroundService);

    expect(document.body.style.getPropertyValue('--board-background')).toBe('');
  });
});
