import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import {
  BOARD_BACKGROUND_IMAGE_URL,
  BOARD_BACKGROUND_OPTIONS,
  BoardBackgroundService,
} from './board-background.service';

describe('BoardBackgroundService', () => {
  let service: BoardBackgroundService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.removeItem('boardBackground');
    document.body.style.removeProperty('--board-background');
    document.body.style.removeProperty('--board-foreground');
    document.body.style.removeProperty('--board-background-image');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    localStorage.removeItem('boardBackground');
    document.body.style.removeProperty('--board-background');
    document.body.style.removeProperty('--board-foreground');
    document.body.style.removeProperty('--board-background-image');
  });

  it('is created and applies the default (Ocean Blue) on init', () => {
    service = TestBed.inject(BoardBackgroundService);
    const ocean = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === 'ocean')!;

    expect(service).toBeTruthy();
    expect(document.body.style.getPropertyValue('--board-background')).toBe(ocean.color!);
    expect(document.body.style.getPropertyValue('--board-foreground')).toBe('#ffffff');
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

  it('falls back to the default (Ocean Blue) for an unknown stored id', () => {
    localStorage.setItem('boardBackground', 'not-a-real-option');

    service = TestBed.inject(BoardBackgroundService);
    const ocean = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === 'ocean')!;

    expect(document.body.style.getPropertyValue('--board-background')).toBe(ocean.color!);
  });

  it('reconcile() from the server applies a background image when one is set', () => {
    service = TestBed.inject(BoardBackgroundService);

    httpMock.expectOne('/api/board-settings').flush({ backgroundColorId: null, hasBackgroundImage: true });

    expect(document.body.style.getPropertyValue('--board-background-image')).toBe(`url(${BOARD_BACKGROUND_IMAGE_URL})`);
    expect(document.body.style.getPropertyValue('--board-foreground')).toBe('#ffffff');
    let hasImage: boolean | undefined;
    service.hasImage$.subscribe((v) => (hasImage = v));
    expect(hasImage).toBe(true);
  });

  it('select() persists the new color to the backend', () => {
    service = TestBed.inject(BoardBackgroundService);
    httpMock.expectOne('/api/board-settings').flush({ backgroundColorId: 'ocean', hasBackgroundImage: false });

    service.select('green');

    const req = httpMock.expectOne('/api/board-settings');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ backgroundColorId: 'green' });
    req.flush({ backgroundColorId: 'green', hasBackgroundImage: false });
  });

  it('uploadBackgroundImage() applies the image background once the upload succeeds', () => {
    service = TestBed.inject(BoardBackgroundService);
    httpMock.expectOne('/api/board-settings').flush({ backgroundColorId: 'ocean', hasBackgroundImage: false });

    service.uploadBackgroundImage(new File(['fake'], 'beach.png', { type: 'image/png' }));

    const req = httpMock.expectOne('/api/board-settings/background-image');
    expect(req.request.method).toBe('POST');
    req.flush({ backgroundColorId: null, hasBackgroundImage: true });

    expect(document.body.style.getPropertyValue('--board-background-image')).toBe(`url(${BOARD_BACKGROUND_IMAGE_URL})`);
    let hasImage: boolean | undefined;
    service.hasImage$.subscribe((v) => (hasImage = v));
    expect(hasImage).toBe(true);
  });

  it('removeBackgroundImage() reverts to the current color and clears hasImage$', () => {
    service = TestBed.inject(BoardBackgroundService);
    httpMock.expectOne('/api/board-settings').flush({ backgroundColorId: null, hasBackgroundImage: true });

    service.removeBackgroundImage();

    const req = httpMock.expectOne('/api/board-settings/background-image');
    expect(req.request.method).toBe('DELETE');
    req.flush({ backgroundColorId: 'ocean', hasBackgroundImage: false });

    expect(document.body.style.getPropertyValue('--board-background-image')).toBe('');
    let hasImage: boolean | undefined;
    service.hasImage$.subscribe((v) => (hasImage = v));
    expect(hasImage).toBe(false);
  });
});
