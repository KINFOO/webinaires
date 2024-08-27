import { DomainException } from '../../shared/domain-exeption';

export class WebinaireTooEarlyException extends DomainException {
  constructor() {
    super('Webinaire must happen in least 3 days');
  }
}
