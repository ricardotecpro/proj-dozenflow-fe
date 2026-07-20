import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BoardBackgroundPickerComponent } from './board-background-picker.component';
import { BOARD_BACKGROUND_OPTIONS, BoardBackgroundService } from '../../services/board-background.service';
import { NotificationService } from '../../services/notification.service';

describe('BoardBackgroundPickerComponent', () => {
  let fixture: ComponentFixture<BoardBackgroundPickerComponent>;
  let component: BoardBackgroundPickerComponent;
  let boardBackgroundServiceSpy: jasmine.SpyObj<BoardBackgroundService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  beforeEach(() => {
    boardBackgroundServiceSpy = jasmine.createSpyObj(
      'BoardBackgroundService',
      ['select', 'uploadBackgroundImage', 'removeBackgroundImage'],
      { selectedId$: of('default'), hasImage$: of(false) },
    );
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['success', 'error']);

    TestBed.configureTestingModule({
      imports: [BoardBackgroundPickerComponent],
      providers: [
        { provide: BoardBackgroundService, useValue: boardBackgroundServiceSpy },
        { provide: NotificationService, useValue: notificationServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(BoardBackgroundPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('exposes every board background option', () => {
    expect(component.options).toBe(BOARD_BACKGROUND_OPTIONS);
  });

  it('select() delegates to BoardBackgroundService with the option id', () => {
    const ocean = BOARD_BACKGROUND_OPTIONS.find((o) => o.id === 'ocean')!;

    component.select(ocean);

    expect(boardBackgroundServiceSpy.select).toHaveBeenCalledWith('ocean');
  });

  it('onFileSelected() delegates the chosen file to BoardBackgroundService', () => {
    const file = new File(['fake'], 'beach.png', { type: 'image/png' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [file] });

    component.onFileSelected({ target: input } as unknown as Event);

    expect(boardBackgroundServiceSpy.uploadBackgroundImage).toHaveBeenCalledWith(file);
  });

  it('onFileSelected() rejects files over 5MB without uploading', () => {
    const tooLarge = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: [tooLarge] });

    component.onFileSelected({ target: input } as unknown as Event);

    expect(boardBackgroundServiceSpy.uploadBackgroundImage).not.toHaveBeenCalled();
    expect(notificationServiceSpy.error).toHaveBeenCalled();
  });

  it('removeImage() delegates to BoardBackgroundService', () => {
    component.removeImage();

    expect(boardBackgroundServiceSpy.removeBackgroundImage).toHaveBeenCalled();
  });
});
