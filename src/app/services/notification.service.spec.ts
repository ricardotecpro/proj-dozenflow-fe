import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [{ provide: MatSnackBar, useValue: snackBarSpy }],
    });

    service = TestBed.inject(NotificationService);
  });

  it('success() opens a snackbar with the success panel class', () => {
    service.success('Tarefa criada.');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Tarefa criada.',
      'Fechar',
      jasmine.objectContaining({ panelClass: 'notification-success' }),
    );
  });

  it('error() opens a snackbar with the error panel class and a longer duration', () => {
    service.error('Não foi possível criar a tarefa.');

    expect(snackBarSpy.open).toHaveBeenCalledWith(
      'Não foi possível criar a tarefa.',
      'Fechar',
      jasmine.objectContaining({ panelClass: 'notification-error' }),
    );

    const [, , config] = snackBarSpy.open.calls.mostRecent().args;
    expect((config as { duration: number }).duration).toBeGreaterThan(3000);
  });
});
