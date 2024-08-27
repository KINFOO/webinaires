import { DomainException } from '../../shared/domain-exeption';

export class WebinaireTooManySeatsException extends DomainException {
  constructor() {
    super('Webinaire must have a maximum of 1500 seats');
  }
}
