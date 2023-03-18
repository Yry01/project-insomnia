import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TwilioComponent } from './twilio.component';

describe('TwilioComponent', () => {
  let component: TwilioComponent;
  let fixture: ComponentFixture<TwilioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TwilioComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwilioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
