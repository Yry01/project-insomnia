import { Component } from '@angular/core';
import { TwilioService } from '../../services/twilio.service';

@Component({
  selector: 'app-twilio',
  templateUrl: './twilio.component.html',
  styleUrls: ['./twilio.component.scss'],
})
export class TwilioComponent {
  phoneNumber = '';
  message = '';

  constructor(private twilioService: TwilioService) {}

  sendSMS() {
    this.twilioService.sendSMS(this.phoneNumber, this.message).subscribe(
      (response) => {
        console.log('SMS sent successfully:', response);
      },
      (error) => {
        console.error('Error sending SMS:', error);
      }
    );
  }
}
