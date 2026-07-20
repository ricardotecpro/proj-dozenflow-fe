import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { BoardBackgroundPickerComponent } from './board-background-picker.component';
import { BOARD_BACKGROUND_OPTIONS, BoardBackgroundService } from '../../services/board-background.service';

describe('BoardBackgroundPickerComponent', () => {
  let fixture: ComponentFixture<BoardBackgroundPickerComponent>;
  let component: BoardBackgroundPickerComponent;
  let boardBackgroundServiceSpy: jasmine.SpyObj<BoardBackgroundService>;

  beforeEach(() => {
    boardBackgroundServiceSpy = jasmine.createSpyObj('BoardBackgroundService', ['select'], {
      selectedId$: of('default'),
    });

    TestBed.configureTestingModule({
      imports: [BoardBackgroundPickerComponent],
      providers: [{ provide: BoardBackgroundService, useValue: boardBackgroundServiceSpy }],
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
});
