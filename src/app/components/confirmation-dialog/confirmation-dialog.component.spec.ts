import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmationDialogComponent>;
  let component: ConfirmationDialogComponent;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmationDialogComponent>>;

  const data: ConfirmationDialogData = {
    title: 'Excluir tarefa',
    message: 'Tem certeza que deseja excluir esta tarefa?',
  };

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [ConfirmationDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
    });

    fixture = TestBed.createComponent(ConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the title and message from injected data', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain(data.title);
    expect(text).toContain(data.message);
  });

  it('onConfirm() closes the dialog with true', () => {
    component.onConfirm();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('onDismiss() closes the dialog with false', () => {
    component.onDismiss();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });
});
