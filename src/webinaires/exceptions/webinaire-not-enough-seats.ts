import { DomainException } from '../../shared/domain-exeption';

export class WebinaireNotEnoughSeatsException extends DomainException {
  constructor() {
    super('Webinaire must have seats');
  }
}
