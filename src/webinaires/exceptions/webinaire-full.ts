import { DomainException } from '../../shared/domain-exeption';

export class WebinaireFullException extends DomainException {
  constructor() {
    super('Webinaire is full');
  }
}
