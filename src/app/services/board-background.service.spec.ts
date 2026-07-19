import { TestBed } from '@angular/core/testing';
import { BOARD_BACKGROUND_OPTIONS, BoardBackgroundService } from './board-background.service';

describe('BoardBackgroundService', () => {
  let service: BoardBackgroundService;

  beforeEach(() => {
    localStorage.removeItem('boardBackground');
    document.body.style.removeProperty('--board-background');
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem('boardBackground');
    document.body.style.removeProperty('--board-background');
  });

  it('is created and applies the default (no override) on init', () => {
    service = TestBed.inject(BoardBackgroundService);

    expect(service).toBeTruthy();
    expect(document.body.style.getPropertyValue('--board-background')).toBe('');
  });

  it('select() with a color option sets --board-background and persists the id', () => {
    service = TestBed.inject(BoardBackgroundService);
    const ocean = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === 'ocean')!;

    service.select('ocean');

    expect(document.body.style.getPropertyValue('--board-background')).toBe(ocean.color!);
    expect(localStorage.getItem('boardBackground')).toBe('ocean');
  });

  it('select("default") removes the --board-background override', () => {
    service = TestBed.inject(BoardBackgroundService);
    service.select('ocean');

    service.select('default');

    expect(document.body.style.getPropertyValue('--board-background')).toBe('');
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
